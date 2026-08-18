import { NextResponse } from "next/server";
import { getAdminProfile } from "../auth/get-admin-profile";
import { AnalyticsError } from "./ga4";
import { canAccessAnalytics, validateDateRange } from "./utils";

export async function authorizeAnalyticsRequest() {
  const session = await getAdminProfile();
  if (!canAccessAnalytics(session.status)) {
    return NextResponse.json({ ok: false, code: "ADMIN_UNAUTHORIZED", message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  return null;
}

export function analyticsRange(request: Request) {
  const url = new URL(request.url);
  return validateDateRange(url.searchParams.get("startDate"), url.searchParams.get("endDate"));
}

export function analyticsErrorResponse(error: unknown) {
  if (error instanceof AnalyticsError) {
    return NextResponse.json({ ok: false, code: error.code, message: error.message }, { status: error.status });
  }
  console.error("[analytics] unexpected server error", error instanceof Error ? { name: error.name, message: error.message } : { type: typeof error });
  return NextResponse.json({ ok: false, code: "ANALYTICS_UNAVAILABLE", message: "분석 데이터를 불러오지 못했습니다." }, { status: 503 });
}
