import { NextResponse } from "next/server";
import { analyticsRange, authorizeAnalyticsRequest } from "../../../../../lib/analytics/api";

export async function GET(request: Request) {
  const denied = await authorizeAnalyticsRequest();
  if (denied) return denied;
  const parsed = analyticsRange(request);
  if (!parsed.ok) return NextResponse.json(parsed, { status: 400 });
  return NextResponse.json({ ok: false, code: "GOOGLE_ADS_PHASE_2", message: "Google Ads 연결은 Phase 2에서 제공됩니다." }, { status: 501 });
}
