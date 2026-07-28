"use server";

import { revalidatePath } from "next/cache";
import { getAdminProfile } from "../../../../lib/auth/get-admin-profile";
import {
  inquiryManagers,
  inquiryStatuses,
  type InquiryManager,
  type InquiryStatus,
} from "../../../../lib/inquiries/types";
import { createClient } from "../../../../lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function updateInquiry(id: string, values: Record<string, unknown>) {
  const session = await getAdminProfile();
  if (session.status !== "authorized") {
    return { success: false, error: "권한이 없습니다." };
  }
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Supabase 연결이 필요합니다." };

  const { error } = await supabase
    .from("inquiries")
    .update({ ...values, updated_by: session.user.id })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { success: true, updatedAt: new Date().toISOString() };
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  if (!inquiryStatuses.includes(status)) {
    return { success: false, error: "올바르지 않은 상태입니다." };
  }
  return updateInquiry(id, { status });
}

export async function updateInquiryManager(
  id: string,
  manager: InquiryManager | null,
) {
  if (manager !== null && !inquiryManagers.includes(manager)) {
    return { success: false, error: "올바르지 않은 담당자입니다." };
  }
  return updateInquiry(id, { manager });
}

export async function updateInquiryMemo(id: string, memo: string) {
  return updateInquiry(id, { memo });
}

export async function deleteInquiryAction(id: string) {
  try {
    if (!UUID_PATTERN.test(id)) {
      throw new Error("문의 ID가 올바르지 않습니다.");
    }
    const session = await getAdminProfile();
    if (session.status !== "authorized") {
      throw new Error("권한이 없습니다.");
    }
    if (session.profile.role !== "admin") {
      throw new Error("삭제는 관리자만 할 수 있습니다.");
    }
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase 연결이 필요합니다.");

    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (error) {
    console.error("[Inquiry delete failed]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "문의 삭제에 실패했습니다.",
    };
  }
}
