import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { canAccessAnalytics, percentageChange, safeCostPerConversion, validateDateRange } from "../lib/analytics/utils";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  propertyId: process.env.GA4_PROPERTY_ID,
  clientEmail: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  events: process.env.GA4_LEAD_EVENT_NAMES,
};

async function run() {
  assert.equal(validateDateRange("2026-07-01", "2026-07-31").ok, true);
  assert.equal(validateDateRange("2026-07-31", "2026-07-01").ok, false);
  assert.equal(validateDateRange("2026-01-01", "2026-07-31").ok, false);
  assert.equal(safeCostPerConversion(10000, 0), null);
  assert.equal(safeCostPerConversion(10000, 2), 5000);
  assert.equal(percentageChange(120, 100), 20);
  assert.equal(percentageChange(1, 0), null);
  assert.equal(canAccessAnalytics("authorized"), true);
  assert.equal(canAccessAnalytics("unauthenticated"), false);
  assert.equal(canAccessAnalytics("unauthorized"), false);

  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  process.env.GA4_PROPERTY_ID = "123456";
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "analytics@example.test";
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  process.env.GA4_LEAD_EVENT_NAMES = "generate_lead,quote_submit";

  const ga4 = await import("../lib/analytics/ga4");
  ga4.resetGa4StateForTests();
  let reportCalls = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("oauth2.googleapis.com")) return new Response(JSON.stringify({ access_token: "mock-token", expires_in: 3600 }), { status: 200 });
    reportCalls += 1;
    const body = JSON.parse(String(init?.body || "{}")) as { metrics?: Array<{ name: string }> };
    const values = body.metrics?.[0]?.name === "eventCount" ? ["3"] : ["12", "18", "7"];
    return new Response(JSON.stringify({ rows: [{ metricValues: values.map((value) => ({ value })) }] }), { status: 200 });
  }) as typeof fetch;
  const overview = await ga4.getGa4Overview({ startDate: "2026-07-01", endDate: "2026-07-07" });
  assert.deepEqual(overview.current, { users: 12, sessions: 18, newUsers: 7, leads: 3 });
  assert.equal(reportCalls, 4);

  ga4.resetGa4StateForTests();
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).includes("oauth2.googleapis.com")) return new Response(JSON.stringify({ access_token: "mock-token", expires_in: 3600 }), { status: 200 });
    const body = JSON.parse(String(init?.body || "{}")) as { dimensions?: Array<{ name: string }> };
    assert.equal(body.dimensions?.[0]?.name, "eventName");
    return new Response(JSON.stringify({ rows: [
      { dimensionValues: [{ value: "generate_lead" }], metricValues: [{ value: "4" }] },
    ] }), { status: 200 });
  }) as typeof fetch;
  const conversions = await ga4.getGa4Conversions({ startDate: "2026-07-01", endDate: "2026-07-07" });
  assert.equal(conversions.conversions, 4);
  assert.deepEqual(conversions.events, [
    { eventName: "generate_lead", eventCount: 4 },
  ]);

  ga4.resetGa4StateForTests();
  globalThis.fetch = (async (input: string | URL | Request) => String(input).includes("oauth2.googleapis.com")
    ? new Response(JSON.stringify({ access_token: "mock-token", expires_in: 3600 }), { status: 200 })
    : new Response(JSON.stringify({ rows: [] }), { status: 200 })) as typeof fetch;
  const empty = await ga4.getGa4Overview({ startDate: "2026-06-01", endDate: "2026-06-07" });
  assert.deepEqual(empty.current, { users: 0, sessions: 0, newUsers: 0, leads: 0 });

  ga4.resetGa4StateForTests();
  globalThis.fetch = (async (input: string | URL | Request) => String(input).includes("oauth2.googleapis.com")
    ? new Response(JSON.stringify({ error: "invalid_grant" }), { status: 401 })
    : new Response("{}", { status: 500 })) as typeof fetch;
  await assert.rejects(() => ga4.getGa4Overview({ startDate: "2026-07-01", endDate: "2026-07-07" }), (error: unknown) => error instanceof ga4.AnalyticsError && error.code === "GA4_AUTH_FAILED");

  ga4.resetGa4StateForTests();
  delete process.env.GA4_PROPERTY_ID;
  await assert.rejects(() => ga4.getGa4Overview({ startDate: "2026-07-01", endDate: "2026-07-07" }), (error: unknown) => error instanceof ga4.AnalyticsError && error.code === "GA4_NOT_CONFIGURED");
  console.info("Analytics Phase 1 unit tests passed.");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  process.env.GA4_PROPERTY_ID = originalEnvironment.propertyId;
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = originalEnvironment.clientEmail;
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = originalEnvironment.privateKey;
  process.env.GA4_LEAD_EVENT_NAMES = originalEnvironment.events;
});
