import { AnalyticsError } from "./ga4";
import type { DateRange } from "./utils";
import { rangeCacheTtl } from "./utils";

const GOOGLE_ADS_API_VERSION = "v25";

type AdsConfig = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId: string;
};

type AdsMetrics = {
  costMicros?: string;
  impressions?: string;
  clicks?: string;
  ctr?: number;
  averageCpc?: number;
  conversions?: number;
};

type AdsRow = {
  customer?: { currencyCode?: string; timeZone?: string };
  campaign?: { id?: string; name?: string; status?: string; advertisingChannelType?: string };
  metrics?: AdsMetrics;
};

type SearchStreamChunk = { results?: AdsRow[] };

export type GoogleAdsSummary = {
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  conversions: number;
};

export type GoogleAdsCampaign = GoogleAdsSummary & {
  id: string;
  name: string;
  status: string;
  channelType: string;
};

export type GoogleAdsReport = {
  source: "Google Ads";
  range: DateRange;
  currencyCode: "KRW";
  timeZone: string;
  summary: GoogleAdsSummary;
  campaigns: GoogleAdsCampaign[];
};

const cache = new Map<string, { expires: number; value: GoogleAdsReport }>();
let tokenCache: { token: string; expires: number } | null = null;
let tokenPromise: Promise<string> | null = null;

const cleanCustomerId = (value: string) => value.replace(/-/g, "").trim();

function config(): AdsConfig {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim();
  const customerId = cleanCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID || "");
  const loginCustomerId = cleanCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "");
  if (!developerToken || !clientId || !clientSecret || !refreshToken || !customerId || !loginCustomerId) {
    throw new AnalyticsError("GOOGLE_ADS_NOT_CONFIGURED", "Google Ads 연결 설정을 확인해주세요.");
  }
  if (!/^\d{10}$/.test(customerId) || !/^\d{10}$/.test(loginCustomerId)) {
    throw new AnalyticsError("GOOGLE_ADS_INVALID_CUSTOMER_ID", "Google Ads 고객 ID 형식을 확인해주세요.");
  }
  return { developerToken, clientId, clientSecret, refreshToken, customerId, loginCustomerId };
}

async function requestAccessToken() {
  const { clientId, clientSecret, refreshToken } = config();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({})) as { access_token?: string; expires_in?: number; error?: string };
  if (!response.ok || !data.access_token) {
    console.error("[analytics:google-ads] OAuth authentication failed", { status: response.status, code: data.error || "unknown" });
    throw new AnalyticsError("GOOGLE_ADS_AUTH_FAILED", "Google Ads OAuth 인증 정보를 확인해주세요.");
  }
  tokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

async function accessToken() {
  if (tokenCache && tokenCache.expires > Date.now() + 60_000) return tokenCache.token;
  tokenPromise ||= requestAccessToken().finally(() => { tokenPromise = null; });
  return tokenPromise;
}

function adsErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return "UNKNOWN";
  const root = payload as { error?: { details?: Array<{ errors?: Array<{ errorCode?: Record<string, string> }> }> } };
  const errorCode = root.error?.details?.flatMap((detail) => detail.errors || [])[0]?.errorCode;
  if (!errorCode) return "UNKNOWN";
  const entry = Object.entries(errorCode)[0];
  return entry ? `${entry[0]}.${entry[1]}` : "UNKNOWN";
}

async function search(query: string) {
  const { developerToken, customerId, loginCustomerId } = config();
  const response = await fetch(`https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      "content-type": "application/json",
      "developer-token": developerToken,
      "login-customer-id": loginCustomerId,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as SearchStreamChunk[] | unknown;
  if (!response.ok || !Array.isArray(data)) {
    const code = adsErrorCode(data);
    console.error("[analytics:google-ads] API request failed", { status: response.status, code });
    throw new AnalyticsError(`GOOGLE_ADS_API_${code}`, `Google Ads API 조회에 실패했습니다. (${code})`, response.status === 401 || response.status === 403 ? 502 : 503);
  }
  return data.flatMap((chunk) => chunk.results || []);
}

const micros = (value: string | number | undefined) => Number(value || 0) / 1_000_000;
const numeric = (value: string | number | undefined) => Number(value || 0);

function summary(metrics: AdsMetrics | undefined): GoogleAdsSummary {
  return {
    cost: micros(metrics?.costMicros),
    impressions: numeric(metrics?.impressions),
    clicks: numeric(metrics?.clicks),
    ctr: numeric(metrics?.ctr),
    averageCpc: micros(metrics?.averageCpc),
    conversions: numeric(metrics?.conversions),
  };
}

async function loadReport(range: DateRange): Promise<GoogleAdsReport> {
  const dateFilter = `segments.date BETWEEN '${range.startDate}' AND '${range.endDate}'`;
  const [metadataRows, accountRows, campaignRows] = await Promise.all([
    search("SELECT customer.currency_code, customer.time_zone FROM customer LIMIT 1"),
    search(`SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions FROM customer WHERE ${dateFilter}`),
    search(`SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions FROM campaign WHERE ${dateFilter} ORDER BY metrics.cost_micros DESC`),
  ]);
  const metadata = metadataRows[0];
  const currencyCode = metadata?.customer?.currencyCode;
  const timeZone = metadata?.customer?.timeZone;
  if (!timeZone || !currencyCode) throw new AnalyticsError("GOOGLE_ADS_ACCOUNT_METADATA_MISSING", "Google Ads 광고계정 정보를 확인할 수 없습니다.");
  if (currencyCode !== "KRW") throw new AnalyticsError("GOOGLE_ADS_CURRENCY_NOT_KRW", `Google Ads 광고계정 통화가 KRW가 아닙니다. (${currencyCode})`);
  return {
    source: "Google Ads",
    range,
    currencyCode: "KRW",
    timeZone,
    summary: summary(accountRows[0]?.metrics),
    campaigns: campaignRows.map((row) => ({
      id: row.campaign?.id || "",
      name: row.campaign?.name || "이름 없음",
      status: row.campaign?.status || "UNKNOWN",
      channelType: row.campaign?.advertisingChannelType || "UNKNOWN",
      ...summary(row.metrics),
    })),
  };
}

export async function getGoogleAdsReport(range: DateRange) {
  const key = `${range.startDate}:${range.endDate}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loadReport(range);
  cache.set(key, { value, expires: Date.now() + rangeCacheTtl(range) });
  return value;
}

export async function getGoogleAdsTodayReport() {
  const metadata = await search("SELECT customer.currency_code, customer.time_zone FROM customer LIMIT 1");
  const timeZone = metadata[0]?.customer?.timeZone;
  if (!timeZone) throw new AnalyticsError("GOOGLE_ADS_ACCOUNT_METADATA_MISSING", "Google Ads 광고계정 시간대를 확인할 수 없습니다.");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return getGoogleAdsReport({ startDate: today, endDate: today });
}

export function resetGoogleAdsStateForTests() {
  cache.clear();
  tokenCache = null;
  tokenPromise = null;
}
