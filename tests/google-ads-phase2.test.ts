import assert from "node:assert/strict";

const originalFetch = globalThis.fetch;
const names = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
  "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
] as const;
const originalEnvironment = Object.fromEntries(names.map((name) => [name, process.env[name]]));

async function run() {
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN = "test-developer-token";
  process.env.GOOGLE_ADS_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_ADS_CLIENT_SECRET = "test-client-secret";
  process.env.GOOGLE_ADS_REFRESH_TOKEN = "test-refresh-token";
  process.env.GOOGLE_ADS_CUSTOMER_ID = "123-456-7890";
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID = "098-765-4321";

  const ads = await import("../lib/analytics/google-ads");
  ads.resetGoogleAdsStateForTests();
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "mock-access-token", expires_in: 3600 }), { status: 200 });
    }
    assert.match(url, /customers\/1234567890\/googleAds:searchStream/);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("login-customer-id"), "0987654321");
    assert.equal(headers.get("developer-token"), "test-developer-token");
    const query = (JSON.parse(String(init?.body || "{}")) as { query: string }).query;
    if (query.includes("customer.currency_code")) {
      return new Response(JSON.stringify([{ results: [{ customer: { currencyCode: "KRW", timeZone: "Asia/Seoul" } }] }]), { status: 200 });
    }
    if (query.includes("FROM customer")) {
      return new Response(JSON.stringify([{ results: [{ metrics: { costMicros: "15000000", impressions: "1200", clicks: "30", ctr: 0.025, averageCpc: "500000", conversions: 3 } }] }]), { status: 200 });
    }
    return new Response(JSON.stringify([{ results: [{ campaign: { id: "1", name: "검색 캠페인", status: "ENABLED", advertisingChannelType: "SEARCH" }, metrics: { costMicros: "15000000", impressions: "1200", clicks: "30", ctr: 0.025, averageCpc: "500000", conversions: 3 } }] }]), { status: 200 });
  }) as typeof fetch;

  const report = await ads.getGoogleAdsReport({ startDate: "2026-08-12", endDate: "2026-08-18" });
  assert.equal(report.currencyCode, "KRW");
  assert.equal(report.timeZone, "Asia/Seoul");
  assert.deepEqual(report.summary, { cost: 15, impressions: 1200, clicks: 30, ctr: 0.025, averageCpc: 0.5, conversions: 3 });
  assert.equal(report.campaigns[0]?.name, "검색 캠페인");

  ads.resetGoogleAdsStateForTests();
  globalThis.fetch = (async (input: string | URL | Request) => String(input).includes("oauth2.googleapis.com")
    ? new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })
    : new Response("[]", { status: 200 })) as typeof fetch;
  await assert.rejects(
    () => ads.getGoogleAdsReport({ startDate: "2026-08-12", endDate: "2026-08-18" }),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "GOOGLE_ADS_AUTH_FAILED",
  );
  console.info("Google Ads Phase 2 unit tests passed.");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  for (const name of names) {
    const value = originalEnvironment[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
