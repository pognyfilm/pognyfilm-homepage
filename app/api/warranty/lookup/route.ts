import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/admin";
import {
  createWarrantyAccessToken,
  isValidCustomerPhone,
  maskCustomerName,
  normalizeWarrantyName,
  normalizeWarrantyPhone,
} from "../../../../lib/warranty/public-access";
import type { Warranty } from "../../../../lib/warranty/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();
const genericNotFoundMessage =
  "등록된 품질보증서를 찾을 수 없습니다. 고객명과 연락처를 다시 확인해주세요.";

const noStoreJson = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

const getRateLimitKey = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex");
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
};

const formatAddress = (item: Warranty) =>
  [item.region, item.place].filter(Boolean).join(" ");

export async function POST(request: NextRequest) {
  if (isRateLimited(getRateLimitKey(request))) {
    return noStoreJson(
      { ok: false, message: "조회 횟수를 초과했습니다. 잠시 후 다시 시도해주세요." },
      429,
    );
  }

  let body: { customerName?: unknown; phone?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return noStoreJson({ ok: false, message: genericNotFoundMessage }, 400);
  }

  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const normalizedName = normalizeWarrantyName(customerName);
  const phone =
    typeof body.phone === "string" ? normalizeWarrantyPhone(body.phone) : "";

  if (
    normalizedName.length < 2 ||
    normalizedName.length > 40 ||
    !isValidCustomerPhone(phone)
  ) {
    return noStoreJson({ ok: false, message: genericNotFoundMessage }, 400);
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("[warranty-lookup] Supabase server configuration is unavailable.");
    return noStoreJson(
      { ok: false, message: "현재 조회 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요." },
      503,
    );
  }

  const { data, error } = await supabase
    .from("warranties")
    .select(
      "id,warranty_number,customer_name,phone,region,place,installation_date,product_name,warranty_period,installer,notes,created_at,updated_at,created_by,updated_by",
    )
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[warranty-lookup] Warranty query failed.", {
      code: error.code,
      message: error.message,
    });
    return noStoreJson(
      { ok: false, message: "현재 조회 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요." },
      503,
    );
  }

  const item = (data as Warranty[] | null)?.find(
    (candidate) =>
      normalizeWarrantyName(candidate.customer_name) === normalizedName,
  );

  if (!item) {
    return noStoreJson({ ok: false, message: genericNotFoundMessage }, 404);
  }

  const token = createWarrantyAccessToken(item.id);
  const documentUrl = `/warranty/document?token=${encodeURIComponent(token)}`;

  return noStoreJson({
    ok: true,
    warranty: {
      warrantyNumber: item.warranty_number,
      customerName: maskCustomerName(item.customer_name),
      installationDate: item.installation_date,
      installationAddress: formatAddress(item),
      productName: item.product_name,
      warrantyPeriod: item.warranty_period,
      installerName: item.installer || "포그니필름 본사 직영팀",
      status: "발급 완료",
      documentUrl,
    },
  });
}
