"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../../lib/auth/require-admin";
import { createClient } from "../../../../lib/supabase/server";
import type { WarrantySaveInput } from "../../../../lib/warranty/types";
import {
  assertWarrantyId,
  validateWarrantyInput,
} from "../../../../lib/warranty/validation";

type ActionResult =
  | { success: true; id?: string; warrantyNumber?: string }
  | { success: false; error: string };

async function getContext() {
  const session = await requireAdmin();
  const supabase = await createClient();
  if (session.status !== "authorized" || !supabase) {
    throw new Error("관리자 인증 연결을 확인해주세요.");
  }
  return { session, supabase };
}

const refreshWarranty = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/warranty");
};

export async function saveWarrantyAction(
  mode: "create" | "edit",
  rawInput: WarrantySaveInput,
): Promise<ActionResult> {
  try {
    const input = validateWarrantyInput(rawInput);
    const { session, supabase } = await getContext();

    if (mode === "create") {
      const { data, error } = await supabase.rpc("create_warranty_record", {
        input_customer_name: input.customer_name,
        input_phone: input.phone,
        input_region: input.region,
        input_place: input.place,
        input_installation_date: input.installation_date,
        input_issued_date: input.issued_date,
        input_product_name: input.product_name,
        input_installation_area: input.installation_area,
        input_warranty_period: input.warranty_period,
        input_installer: input.installer,
        input_notes: input.notes || null,
      });
      if (error) throw error;
      const created = (data as Array<{ id: string; warranty_number: string }> | null)?.[0];
      if (!created) throw new Error("품질보증번호 생성에 실패했습니다.");
      refreshWarranty();
      return {
        success: true,
        id: created.id,
        warrantyNumber: created.warranty_number,
      };
    }

    if (!input.id) throw new Error("품질보증서 ID가 필요합니다.");
    assertWarrantyId(input.id);
    const { error } = await supabase
      .from("warranties")
      .update({
        customer_name: input.customer_name,
        phone: input.phone,
        region: input.region,
        place: input.place,
        installation_date: input.installation_date,
        issued_date: input.issued_date,
        product_name: input.product_name,
        installation_area: input.installation_area,
        warranty_period: input.warranty_period,
        installer: input.installer,
        notes: input.notes || null,
        updated_by: session.user.id,
      })
      .eq("id", input.id);
    if (error) throw error;
    refreshWarranty();
    return { success: true, id: input.id };
  } catch (error) {
    console.error("[Warranty save failed]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "품질보증서 저장에 실패했습니다.",
    };
  }
}

export async function deleteWarrantyAction(id: string): Promise<ActionResult> {
  try {
    assertWarrantyId(id);
    const { session, supabase } = await getContext();
    if (session.profile.role !== "admin") {
      throw new Error("삭제는 관리자만 할 수 있습니다.");
    }
    const { error } = await supabase.from("warranties").delete().eq("id", id);
    if (error) throw error;
    refreshWarranty();
    return { success: true };
  } catch (error) {
    console.error("[Warranty delete failed]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "삭제에 실패했습니다.",
    };
  }
}
