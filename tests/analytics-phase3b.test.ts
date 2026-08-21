import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { safeCostPerConversion } from "../lib/analytics/utils";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  propertyId: process.env.GA4_PROPERTY_ID,
  clientEmail: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  events: process.env.GA4_LEAD_EVENT_NAMES,
};

async function run() {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  process.env.GA4_PROPERTY_ID = "123456";
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "analytics@example.test";
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  process.env.GA4_LEAD_EVENT_NAMES = "generate_lead,quote_submit";

  const ga4 = await import("../lib/analytics/ga4");
  ga4.resetGa4StateForTests();
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "mock-token", expires_in: 3600 }), { status: 200 });
    }
    const body = JSON.parse(String(init?.body || "{}")) as {
      dimensionFilter?: { filter?: { fieldName?: string; inListFilter?: { values?: string[] } } };
    };
    assert.equal(body.dimensionFilter?.filter?.fieldName, "eventName");
    assert.deepEqual(body.dimensionFilter?.filter?.inListFilter?.values, ["generate_lead"]);
    return new Response(JSON.stringify({ rows: [
      { dimensionValues: [{ value: "generate_lead" }], metricValues: [{ value: "4" }] },
      { dimensionValues: [{ value: "quote_submit" }], metricValues: [{ value: "9" }] },
    ] }), { status: 200 });
  }) as typeof fetch;

  const conversions = await ga4.getGa4Conversions({ startDate: "2026-08-15", endDate: "2026-08-21" });
  assert.equal(conversions.conversions, 4);
  assert.deepEqual(conversions.events, [{ eventName: "generate_lead", eventCount: 4 }]);
  assert.equal(ga4.classifyAcquisitionChannel("naver", "cpc"), "NAVER 광고");
  assert.equal(ga4.classifyAcquisitionChannel("naver", "organic"), "NAVER 자연검색");
  assert.equal(ga4.classifyAcquisitionChannel("(data not available)", "(data not available)"), "기타");
  assert.equal(safeCostPerConversion(120_000, 0), null);
  assert.equal(safeCostPerConversion(120_000, 3), 40_000);
  console.info("Analytics Phase 3-B unit tests passed.");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  process.env.GA4_PROPERTY_ID = originalEnvironment.propertyId;
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = originalEnvironment.clientEmail;
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = originalEnvironment.privateKey;
  process.env.GA4_LEAD_EVENT_NAMES = originalEnvironment.events;
});
