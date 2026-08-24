import { createHmac } from "node:crypto";
import { AnalyticsError } from "./ga4";
import type { DateRange } from "./utils";
import { rangeCacheTtl } from "./utils";

const NAVER_ADS_BASE_URL = "https://api.searchad.naver.com";
const STATS_FIELDS = ["impCnt", "clkCnt", "salesAmt"];
const MAX_IDS_PER_REQUEST = 50;

type NaverAdsConfig = {
  customerId: string;
  accessLicense: string;
  secretKey: string;
};

type NaverCampaign = {
  nccCampaignId?: string;
  campaignTp?: string;
};

type NaverStat = {
  impCnt?: number | string;
  clkCnt?: number | string;
  salesAmt?: number | string;
};

type NaverStatsResponse = NaverStat[] | {
  data: NaverStat[];
  summary?: unknown;
  compTm?: unknown;
  cycleBaseTm?: unknown;
};

export type NaverAdsReport = {
  source: "NAVER Ads";
  range: DateRange;
  currencyCode: "KRW";
  timeZone: "Asia/Seoul";
  syncedAt: string;
  dataStatus: "available" | "empty";
  summary: {
    cost: number;
    impressions: number;
    clicks: number;
    ctr: number;
    averageCpc: number;
  };
};

const cache = new Map<string, { expires: number; value: NaverAdsReport }>();

function config(): NaverAdsConfig {
  const rawCustomerId = process.env.NAVER_ADS_CUSTOMER_ID?.trim();
  const customerId = rawCustomerId?.replace(/\D/g, "");
  const accessLicense = process.env.NAVER_ADS_ACCESS_LICENSE?.trim();
  const secretKey = process.env.NAVER_ADS_SECRET_KEY?.trim();
  if (!customerId || !accessLicense || !secretKey) {
    throw new AnalyticsError("NAVER_ADS_NOT_CONFIGURED", "NAVER 광고 연결 설정을 확인해주세요.");
  }
  return { customerId, accessLicense, secretKey };
}

function signature(timestamp: string, method: string, uri: string, secretKey: string) {
  return createHmac("sha256", secretKey)
    .update(`${timestamp}.${method}.${uri}`)
    .digest("base64");
}

function providerErrorCode(payload: unknown) {
  if (!payload || typeof payload !== "object") return "UNKNOWN";
  const code = (payload as { code?: unknown }).code;
  return typeof code === "string" || typeof code === "number" ? String(code) : "UNKNOWN";
}

async function request<T>(uri: string, searchParams?: URLSearchParams): Promise<T> {
  const { customerId, accessLicense, secretKey } = config();
  const timestamp = Date.now().toString();
  const url = new URL(`${NAVER_ADS_BASE_URL}${uri}`);
  if (searchParams) url.search = searchParams.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "x-timestamp": timestamp,
      "x-api-key": accessLicense,
      "x-customer": customerId,
      "x-signature": signature(timestamp, "GET", uri, secretKey),
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as T | unknown;
  if (!response.ok) {
    const code = providerErrorCode(data);
    console.error("[analytics:naver-ads] API request failed", {
      status: response.status,
      code,
      transactionId: response.headers.get("x-transaction-id") || undefined,
    });
    const isAuthenticationError = response.status === 401 || response.status === 403;
    const status = isAuthenticationError ? 502 : 503;
    const message = isAuthenticationError
      ? "NAVER 광고 API 연결을 확인해주세요."
      : `NAVER 광고 API 조회에 실패했습니다. (${code})`;
    throw new AnalyticsError(`NAVER_ADS_API_${code}`, message, status);
  }
  return data as T;
}

const numeric = (value: number | string | undefined) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const chunks = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
};

export function parseNaverStatsResponse(response: unknown): NaverStat[] {
  const rows = Array.isArray(response)
    ? response
    : response && typeof response === "object" && "data" in response && Array.isArray(response.data)
      ? response.data
      : null;
  if (!rows || !rows.every((row) => row !== null && typeof row === "object" && !Array.isArray(row))) {
    throw new AnalyticsError("NAVER_ADS_INVALID_STATS_RESPONSE", "NAVER 광고 데이터 형식을 확인해주세요.");
  }
  return rows as NaverStat[];
}

async function loadReport(range: DateRange): Promise<NaverAdsReport> {
  const campaigns = await request<NaverCampaign[]>("/ncc/campaigns");
  if (!Array.isArray(campaigns)) {
    throw new AnalyticsError("NAVER_ADS_INVALID_RESPONSE", "NAVER 광고 캠페인 정보를 확인할 수 없습니다.");
  }

  const idsByType = new Map<string, string[]>();
  for (const campaign of campaigns) {
    if (!campaign.nccCampaignId) continue;
    const type = campaign.campaignTp || "UNKNOWN";
    idsByType.set(type, [...(idsByType.get(type) || []), campaign.nccCampaignId]);
  }

  const statRequests = [...idsByType.values()].flatMap((ids) => chunks(ids, MAX_IDS_PER_REQUEST)).map((ids) => {
    const params = new URLSearchParams();
    for (const id of ids) params.append("ids", id);
    params.set("fields", JSON.stringify(STATS_FIELDS));
    params.set("timeRange", JSON.stringify({ since: range.startDate, until: range.endDate }));
    return request<NaverStatsResponse>("/stats", params);
  });
  const statGroups = await Promise.all(statRequests);
  const stats = statGroups.flatMap(parseNaverStatsResponse);
  const impressions = stats.reduce((sum, item) => sum + numeric(item.impCnt), 0);
  const clicks = stats.reduce((sum, item) => sum + numeric(item.clkCnt), 0);
  const cost = stats.reduce((sum, item) => sum + numeric(item.salesAmt), 0);

  return {
    source: "NAVER Ads",
    range,
    currencyCode: "KRW",
    timeZone: "Asia/Seoul",
    syncedAt: new Date().toISOString(),
    dataStatus: stats.length ? "available" : "empty",
    summary: {
      cost,
      impressions,
      clicks,
      ctr: impressions ? clicks / impressions : 0,
      averageCpc: clicks ? cost / clicks : 0,
    },
  };
}

export async function getNaverAdsReport(range: DateRange) {
  const key = `${range.startDate}:${range.endDate}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loadReport(range);
  cache.set(key, { value, expires: Date.now() + rangeCacheTtl(range) });
  return value;
}

export function resetNaverAdsStateForTests() {
  cache.clear();
}
