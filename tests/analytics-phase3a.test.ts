import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  propertyId: process.env.GA4_PROPERTY_ID,
  clientEmail: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
  privateKey: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
};

async function run() {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  process.env.GA4_PROPERTY_ID = "123456";
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "analytics@example.test";
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  const ga4 = await import("../lib/analytics/ga4");
  ga4.resetGa4StateForTests();
  const channelMetrics = [[3, 6], [2, 3], [10, 20], [29, 34], [2, 2], [2, 2], [14, 15], [142, 170]];
  let filteredReportIndex = 0;

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "mock-token", expires_in: 3600 }), { status: 200 });
    }
    const body = JSON.parse(String(init?.body || "{}")) as {
      dimensions?: Array<{ name: string }>;
      dimensionFilter?: unknown;
    };
    if (body.dimensions?.length) {
      return new Response(JSON.stringify({ rows: [
        { dimensionValues: [{ value: "google" }, { value: "cpc" }], metricValues: [{ value: "6" }, { value: "3" }] },
        { dimensionValues: [{ value: "naver" }, { value: "organic" }], metricValues: [{ value: "20" }, { value: "10" }] },
        { dimensionValues: [{ value: "(not set)" }, { value: "(not set)" }], metricValues: [{ value: "21" }, { value: "15" }] },
      ] }), { status: 200 });
    }
    if (body.dimensionFilter) {
      const [users, sessions] = channelMetrics[filteredReportIndex++] || [0, 0];
      return new Response(JSON.stringify({ rows: [{ metricValues: [{ value: String(users) }, { value: String(sessions) }] }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ rows: [{ metricValues: [{ value: "204" }, { value: "252" }] }] }), { status: 200 });
  }) as typeof fetch;

  const acquisition = await ga4.getGa4Acquisition({ startDate: "2026-08-12", endDate: "2026-08-18" });
  assert.equal(acquisition.totalUsers, 204);
  assert.equal(acquisition.totalSessions, 252);
  assert.equal(acquisition.attributedSessions, 252);
  assert.equal(acquisition.channels.length, 8);
  assert.deepEqual(acquisition.channels[0], {
    channel: "Google Ads",
    users: 3,
    sessions: 6,
    sessionShare: (6 / 252) * 100,
    details: [{ source: "google", medium: "cpc", sessions: 6, users: 3 }],
  });
  assert.equal(acquisition.channels.find((item) => item.channel === "NAVER 자연검색")?.sessions, 20);
  assert.equal(acquisition.channels.find((item) => item.channel === "기타")?.details[0]?.source, "(not set)");
  assert.ok(Math.abs(acquisition.channels.reduce((sum, item) => sum + item.sessionShare, 0) - 100) < 0.0001);
  console.info("Analytics Phase 3-A unit tests passed.");
}

run().finally(() => {
  globalThis.fetch = originalFetch;
  process.env.GA4_PROPERTY_ID = originalEnvironment.propertyId;
  process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = originalEnvironment.clientEmail;
  process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = originalEnvironment.privateKey;
});
