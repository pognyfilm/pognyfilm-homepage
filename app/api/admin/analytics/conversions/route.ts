import { NextResponse } from "next/server";
import { analyticsErrorResponse, analyticsRange, authorizeAnalyticsRequest } from "../../../../../lib/analytics/api";
import { getGa4Conversions } from "../../../../../lib/analytics/ga4";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await authorizeAnalyticsRequest();
  if (denied) return denied;
  const parsed = analyticsRange(request);
  if (!parsed.ok) return NextResponse.json(parsed, { status: 400 });
  try {
    return NextResponse.json({ ok: true, data: await getGa4Conversions(parsed.range) });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
