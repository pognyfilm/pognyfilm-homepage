import { createSign } from "node:crypto";
import type { DateRange } from "./utils";
import { percentageChange, previousDateRange, rangeCacheTtl } from "./utils";

type GaRow = { dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> };
type GaResponse = { rows?: GaRow[] };
type GaRequest = {
  dateRanges: DateRange[];
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: unknown;
  orderBys?: unknown[];
  limit?: number;
};

export class AnalyticsError extends Error {
  constructor(public code: string, message: string, public status = 503) {
    super(message);
  }
}

const cache = new Map<string, { expires: number; value: unknown }>();
let tokenCache: { token: string; expires: number } | null = null;
let tokenPromise: Promise<string> | null = null;

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");

function normalizePrivateKey(value: string) {
  let key = value.trim();
  const fromJson = (candidate: string) => {
    try {
      const credentials = JSON.parse(candidate) as { private_key?: unknown; GOOGLE_ANALYTICS_PRIVATE_KEY?: unknown };
      const parsedKey = credentials.private_key ?? credentials.GOOGLE_ANALYTICS_PRIVATE_KEY;
      return typeof parsedKey === "string" ? parsedKey : null;
    } catch {
      return null;
    }
  };
  if (key.startsWith("GOOGLE_ANALYTICS_PRIVATE_KEY=")) key = key.slice(key.indexOf("=") + 1).trim();
  if (key.startsWith("{")) key = fromJson(key) || key;
  if (key.startsWith('"') && key.endsWith('"')) {
    try {
      const parsed = JSON.parse(key);
      if (typeof parsed === "string") key = parsed;
    } catch {
      key = key.slice(1, -1);
    }
  }
  if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").trim();
  if (!key.includes("BEGIN PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8").trim();
      const decodedKey = decoded.startsWith("{") ? fromJson(decoded) : null;
      if (decodedKey || decoded.includes("BEGIN PRIVATE KEY")) key = decodedKey || decoded;
    } catch {
      // Keep the original value so validation can reject it safely.
    }
  }
  return key;
}

function config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL?.trim();
  const privateKeyValue = process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
  const privateKey = privateKeyValue ? normalizePrivateKey(privateKeyValue) : "";
  if (!propertyId || !clientEmail || !privateKey) {
    throw new AnalyticsError("GA4_NOT_CONFIGURED", "Google Analytics 연결이 필요합니다.");
  }
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
    console.error("[analytics:ga4] service account private key format is invalid");
    throw new AnalyticsError("GA4_AUTH_FAILED", "Google Analytics 서비스 계정 인증 정보를 확인해주세요.");
  }
  return { propertyId, clientEmail, privateKey };
}

async function requestAccessToken() {
  if (tokenCache && tokenCache.expires > Date.now() + 60_000) return tokenCache.token;
  const { clientEmail, privateKey } = config();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  let signature: string;
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${payload}`);
    signature = signer.sign(privateKey).toString("base64url");
  } catch {
    console.error("[analytics:ga4] service account private key could not be parsed");
    throw new AnalyticsError("GA4_AUTH_FAILED", "Google Analytics 서비스 계정 인증 정보를 확인해주세요.");
  }
  const assertion = `${header}.${payload}.${signature}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("[analytics:ga4] service account authentication failed", { status: response.status });
    throw new AnalyticsError("GA4_AUTH_FAILED", "Google Analytics 권한을 확인해주세요.");
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new AnalyticsError("GA4_AUTH_FAILED", "Google Analytics 권한을 확인해주세요.");
  tokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

async function accessToken() {
  if (tokenCache && tokenCache.expires > Date.now() + 60_000) return tokenCache.token;
  tokenPromise ||= requestAccessToken().finally(() => { tokenPromise = null; });
  return tokenPromise;
}

async function runReport(request: GaRequest): Promise<GaResponse> {
  const { propertyId } = config();
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("[analytics:ga4] report request failed", { status: response.status });
    throw new AnalyticsError("GA4_REQUEST_FAILED", "Google Analytics 데이터를 불러오지 못했습니다.");
  }
  return response.json() as Promise<GaResponse>;
}

async function cached<T>(key: string, range: DateRange, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await loader();
  cache.set(key, { value, expires: Date.now() + rangeCacheTtl(range) });
  return value;
}

const metric = (row: GaRow | undefined, index: number) => Number(row?.metricValues?.[index]?.value || 0);
const dimension = (row: GaRow, index: number) => row.dimensionValues?.[index]?.value || "";
const eventFilter = (names: string[]) => names.length ? ({ filter: { fieldName: "eventName", inListFilter: { values: names } } }) : null;
const ADMIN_LEAD_EVENT = "generate_lead";

export type AcquisitionChannelName =
  | "Google Ads"
  | "NAVER 광고"
  | "NAVER 자연검색"
  | "NAVER"
  | "Google 검색"
  | "YouTube"
  | "Direct"
  | "기타";

export type Ga4AcquisitionChannel = {
  channel: AcquisitionChannelName;
  users: number;
  sessions: number;
  leads: number;
  conversionRate: number | null;
  sessionShare: number;
  details: Array<{ source: string; medium: string; sessions: number; users: number; leads: number }>;
};

const acquisitionChannels: AcquisitionChannelName[] = [
  "Google Ads", "NAVER 광고", "NAVER 자연검색", "NAVER", "Google 검색", "YouTube", "Direct", "기타",
];

export function classifyAcquisitionChannel(source: string, medium: string): AcquisitionChannelName {
  const normalizedSource = source.toLowerCase();
  const normalizedMedium = medium.toLowerCase();
  if (normalizedSource === "google" && normalizedMedium === "cpc") return "Google Ads";
  if (normalizedSource === "naver" && normalizedMedium === "cpc") return "NAVER 광고";
  if (["ad.search.naver.com", "m.ad.search.naver.com"].includes(normalizedSource) && normalizedMedium === "referral") return "NAVER 광고";
  if (normalizedSource === "naver" && normalizedMedium === "organic") return "NAVER 자연검색";
  if (["m.search.naver.com", "search.naver.com"].includes(normalizedSource) && normalizedMedium === "referral") return "NAVER";
  if (normalizedSource === "google" && normalizedMedium === "organic") return "Google 검색";
  if (normalizedSource.includes("youtube")) return "YouTube";
  if (normalizedSource === "(direct)" && normalizedMedium === "(none)") return "Direct";
  return "기타";
}

async function totals(range: DateRange) {
  const [summary, leads] = await Promise.all([
    runReport({ dateRanges: [range], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "newUsers" }] }),
    runReport({ dateRanges: [range], metrics: [{ name: "eventCount" }], dimensionFilter: eventFilter([ADMIN_LEAD_EVENT]) }),
  ]);
  return { users: metric(summary.rows?.[0], 0), sessions: metric(summary.rows?.[0], 1), newUsers: metric(summary.rows?.[0], 2), leads: metric(leads.rows?.[0], 0) };
}

export async function getGa4Overview(range: DateRange) {
  return cached(`overview:${range.startDate}:${range.endDate}`, range, async () => {
    const previousRange = previousDateRange(range);
    const [current, previous] = await Promise.all([totals(range), totals(previousRange)]);
    return {
      source: "GA4" as const,
      range,
      current,
      previous,
      changes: {
        users: percentageChange(current.users, previous.users),
        sessions: percentageChange(current.sessions, previous.sessions),
        newUsers: percentageChange(current.newUsers, previous.newUsers),
        leads: percentageChange(current.leads, previous.leads),
      },
      leadEventNames: [ADMIN_LEAD_EVENT],
    };
  });
}

export async function getGa4Conversions(range: DateRange) {
  return cached(`conversions:${range.startDate}:${range.endDate}`, range, async () => {
    const report = await runReport({
      dateRanges: [range],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter([ADMIN_LEAD_EVENT]),
      limit: 1,
    });
    const counts = new Map((report.rows || []).map((row) => [dimension(row, 0), metric(row, 0)]));
    const events = [{ eventName: ADMIN_LEAD_EVENT, eventCount: counts.get(ADMIN_LEAD_EVENT) || 0 }];
    return { source: "GA4" as const, range, conversions: events.reduce((sum, event) => sum + event.eventCount, 0), events };
  });
}

type ReportSpec = { dimensions: string[]; metrics: string[]; limit?: number };
async function rows(range: DateRange, spec: ReportSpec) {
  const report = await runReport({
    dateRanges: [range],
    dimensions: spec.dimensions.map((name) => ({ name })),
    metrics: spec.metrics.map((name) => ({ name })),
    limit: spec.limit || 100,
  });
  return (report.rows || []).map((row) => ({
    dimensions: spec.dimensions.reduce<Record<string, string>>((result, name, index) => ({ ...result, [name]: dimension(row, index) }), {}),
    metrics: spec.metrics.reduce<Record<string, number>>((result, name, index) => ({ ...result, [name]: metric(row, index) }), {}),
  }));
}

async function leadRows(range: DateRange, dimensions: string[]) {
  const report = await runReport({
    dateRanges: [range],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: [{ name: "eventCount" }],
    dimensionFilter: eventFilter([ADMIN_LEAD_EVENT]),
    limit: 250,
  });
  return (report.rows || []).map((row) => ({ key: dimensions.map((_, index) => dimension(row, index)).join("||"), leads: metric(row, 0) }));
}

export async function getGa4Acquisition(range: DateRange) {
  return cached(`acquisition:${range.startDate}:${range.endDate}`, range, async () => {
    const [summary, detailRows, acquisitionLeadRows] = await Promise.all([
      runReport({ dateRanges: [range], metrics: [{ name: "activeUsers" }, { name: "sessions" }] }),
      rows(range, { dimensions: ["sessionSource", "sessionMedium"], metrics: ["sessions", "activeUsers"], limit: 250 }),
      runReport({
        dateRanges: [range],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: eventFilter([ADMIN_LEAD_EVENT]),
        limit: 250,
      }),
    ]);
    const totalUsers = metric(summary.rows?.[0], 0);
    const totalSessions = metric(summary.rows?.[0], 1);
    const leadMap = new Map((acquisitionLeadRows.rows || []).map((row) => [
      `${dimension(row, 0)}||${dimension(row, 1)}`,
      metric(row, 0),
    ]));
    const detailMap = new Map(detailRows.map((item) => {
      const source = item.dimensions.sessionSource || "(not set)";
      const medium = item.dimensions.sessionMedium || "(not set)";
      return [`${source}||${medium}`, {
        source,
        medium,
        sessions: item.metrics.sessions || 0,
        users: item.metrics.activeUsers || 0,
        leads: leadMap.get(`${source}||${medium}`) || 0,
      }];
    }));
    for (const row of acquisitionLeadRows.rows || []) {
      const source = dimension(row, 0) || "(not set)";
      const medium = dimension(row, 1) || "(not set)";
      const key = `${source}||${medium}`;
      if (!detailMap.has(key)) detailMap.set(key, { source, medium, sessions: 0, users: 0, leads: metric(row, 0) });
    }
    const allDetails = [...detailMap.values()];
    const attributedSessions = detailRows.reduce((sum, item) => sum + (item.metrics.sessions || 0), 0);
    const channels: Ga4AcquisitionChannel[] = acquisitionChannels.map((channel) => {
      const details = allDetails
        .filter((item) => classifyAcquisitionChannel(item.source, item.medium) === channel)
        .sort((a, b) => b.sessions - a.sessions || b.leads - a.leads);
      const users = details.reduce((sum, item) => sum + item.users, 0);
      const sessions = details.reduce((sum, item) => sum + item.sessions, 0);
      const leads = details.reduce((sum, item) => sum + item.leads, 0);
      return {
        channel,
        users,
        sessions,
        leads,
        conversionRate: sessions ? (leads / sessions) * 100 : null,
        sessionShare: attributedSessions ? (sessions / attributedSessions) * 100 : 0,
        details,
      };
    });
    return { source: "GA4" as const, basis: "session" as const, range, totalUsers, totalSessions, attributedSessions, channels };
  });
}

export async function getGa4Traffic(range: DateRange) {
  return cached(`traffic:${range.startDate}:${range.endDate}`, range, async () => {
    const specs = {
      trend: { dimensions: ["date"], metrics: ["activeUsers", "sessions"] },
      channels: { dimensions: ["sessionDefaultChannelGroup"], metrics: ["activeUsers", "sessions", "engagedSessions"] },
      sources: { dimensions: ["sessionSource", "sessionMedium"], metrics: ["sessions", "activeUsers"] },
      pages: { dimensions: ["pagePath", "pageTitle"], metrics: ["screenPageViews", "activeUsers", "averageSessionDuration"], limit: 50 },
      devices: { dimensions: ["deviceCategory"], metrics: ["activeUsers", "sessions"] },
      regions: { dimensions: ["region", "city"], metrics: ["activeUsers", "sessions"], limit: 50 },
    } satisfies Record<string, ReportSpec>;
    const [trend, channels, sources, pages, devices, regions, trendLeads, channelLeads, sourceLeads, pageLeads, deviceLeads, regionLeads] = await Promise.all([
      rows(range, specs.trend), rows(range, specs.channels), rows(range, specs.sources), rows(range, specs.pages), rows(range, specs.devices), rows(range, specs.regions),
      leadRows(range, ["date"]), leadRows(range, ["sessionDefaultChannelGroup"]), leadRows(range, ["sessionSource", "sessionMedium"]), leadRows(range, ["pagePath", "pageTitle"]), leadRows(range, ["deviceCategory"]), leadRows(range, ["region", "city"]),
    ]);
    const merge = (items: Awaited<ReturnType<typeof rows>>, leads: Awaited<ReturnType<typeof leadRows>>) => {
      const map = new Map(leads.map((item) => [item.key, item.leads]));
      return items.map((item) => {
        const key = Object.values(item.dimensions).join("||");
        const conversions = map.get(key) || 0;
        const sessions = item.metrics.sessions || 0;
        return { ...item, conversions, conversionRate: sessions ? (conversions / sessions) * 100 : 0 };
      });
    };
    return { source: "GA4" as const, range, trend: merge(trend, trendLeads), channels: merge(channels, channelLeads), sources: merge(sources, sourceLeads), pages: merge(pages, pageLeads), devices: merge(devices, deviceLeads), regions: merge(regions, regionLeads), acquisition: await getGa4Acquisition(range) };
  });
}

export function isGa4Configured() {
  return Boolean(process.env.GA4_PROPERTY_ID?.trim() && process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL?.trim() && process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.trim());
}

export function resetGa4StateForTests() {
  cache.clear();
  tokenCache = null;
  tokenPromise = null;
}
