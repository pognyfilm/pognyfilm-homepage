import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const originalFetch = globalThis.fetch;
const names = ["NAVER_ADS_CUSTOMER_ID", "NAVER_ADS_ACCESS_LICENSE", "NAVER_ADS_SECRET_KEY"] as const;
const originalEnvironment = Object.fromEntries(names.map((name) => [name, process.env[name]]));

async function run() {
  process.env.NAVER_ADS_CUSTOMER_ID = "1234567";
  process.env.NAVER_ADS_ACCESS_LICENSE = "test-access-license";
  process.env.NAVER_ADS_SECRET_KEY = "test-secret-key";

  const naverAds = await import("../lib/analytics/naver-ads");
  naverAds.resetNaverAdsStateForTests();
  let statsCalls = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    const timestamp = headers.get("x-timestamp") || "";
    const expectedSignature = createHmac("sha256", "test-secret-key")
      .update(`${timestamp}.GET.${url.pathname}`)
      .digest("base64");
    assert.equal(headers.get("x-api-key"), "test-access-license");
    assert.equal(headers.get("x-customer"), "1234567");
    assert.equal(headers.get("x-signature"), expectedSignature);

    if (url.pathname === "/ncc/campaigns") {
      return new Response(JSON.stringify([
        { nccCampaignId: "cmp-search-1", campaignTp: "WEB_SITE" },
        { nccCampaignId: "cmp-search-2", campaignTp: "WEB_SITE" },
        { nccCampaignId: "cmp-shopping-1", campaignTp: "SHOPPING" },
      ]), { status: 200 });
    }
    assert.equal(url.pathname, "/stats");
    assert.equal(url.searchParams.get("fields"), '["impCnt","clkCnt","salesAmt"]');
    assert.deepEqual(JSON.parse(url.searchParams.get("timeRange") || "{}"), { since: "2026-08-18", until: "2026-08-24" });
    statsCalls += 1;
    return new Response(JSON.stringify(statsCalls === 1
      ? { summary: {}, data: [{ impCnt: 1000, clkCnt: 10, salesAmt: 12000 }, { impCnt: "500", clkCnt: "5", salesAmt: "6000" }], compTm: "", cycleBaseTm: "" }
      : [{ impCnt: 200, clkCnt: 2, salesAmt: 3000 }]), { status: 200 });
  }) as typeof fetch;

  const report = await naverAds.getNaverAdsReport({ startDate: "2026-08-18", endDate: "2026-08-24" });
  assert.equal(statsCalls, 2);
  assert.equal(report.currencyCode, "KRW");
  assert.equal(report.timeZone, "Asia/Seoul");
  assert.equal(report.dataStatus, "available");
  assert.deepEqual(report.summary, {
    cost: 21000,
    impressions: 1700,
    clicks: 17,
    ctr: 0.01,
    averageCpc: 21000 / 17,
  });

  assert.deepEqual(naverAds.parseNaverStatsResponse({ summary: {}, data: [] }), []);
  assert.deepEqual(naverAds.parseNaverStatsResponse([{ impCnt: 0, clkCnt: 0, salesAmt: 0 }]), [{ impCnt: 0, clkCnt: 0, salesAmt: 0 }]);
  assert.throws(
    () => naverAds.parseNaverStatsResponse({ summary: {} }),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "NAVER_ADS_INVALID_STATS_RESPONSE",
  );

  naverAds.resetNaverAdsStateForTests();
  process.env.NAVER_ADS_CUSTOMER_ID = "Customer ID: 123-456-7";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(new Headers(init?.headers).get("x-customer"), "1234567");
    const url = new URL(String(input));
    return new Response(JSON.stringify(url.pathname === "/ncc/campaigns" ? [] : []), { status: 200 });
  }) as typeof fetch;
  const emptyReport = await naverAds.getNaverAdsReport({ startDate: "2026-08-24", endDate: "2026-08-24" });
  assert.equal(emptyReport.dataStatus, "empty");

  naverAds.resetNaverAdsStateForTests();
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    return new Response(JSON.stringify(url.pathname === "/ncc/campaigns"
      ? [{ nccCampaignId: "cmp-zero", campaignTp: "WEB_SITE" }]
      : { summary: {}, data: [{ impCnt: 0, clkCnt: 0, salesAmt: 0 }] }), { status: 200 });
  }) as typeof fetch;
  const zeroReport = await naverAds.getNaverAdsReport({ startDate: "2026-08-23", endDate: "2026-08-23" });
  assert.equal(zeroReport.dataStatus, "available");
  assert.deepEqual(zeroReport.summary, { cost: 0, impressions: 0, clicks: 0, ctr: 0, averageCpc: 0 });
  assert.ok(Number.isFinite(zeroReport.summary.ctr));
  assert.ok(Number.isFinite(zeroReport.summary.averageCpc));

  naverAds.resetNaverAdsStateForTests();
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    return new Response(JSON.stringify(url.pathname === "/ncc/campaigns"
      ? [{ nccCampaignId: "cmp-invalid", campaignTp: "WEB_SITE" }]
      : { summary: {} }), { status: 200 });
  }) as typeof fetch;
  await assert.rejects(
    () => naverAds.getNaverAdsReport({ startDate: "2026-08-22", endDate: "2026-08-22" }),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "NAVER_ADS_INVALID_STATS_RESPONSE",
  );

  const cpl = (cost: number, leads: number) => leads ? cost / leads : null;
  assert.equal(cpl(711673, 0), null);
  assert.equal(cpl(711673, 2), 355836.5);

  naverAds.resetNaverAdsStateForTests();
  globalThis.fetch = (async () => new Response(JSON.stringify({ code: 1004, message: "authentication failed" }), { status: 403 })) as typeof fetch;
  await assert.rejects(
    () => naverAds.getNaverAdsReport({ startDate: "2026-08-18", endDate: "2026-08-24" }),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "NAVER_ADS_API_1004",
  );
  console.info("NAVER Ads API unit tests passed.");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  for (const name of names) {
    const value = originalEnvironment[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});
