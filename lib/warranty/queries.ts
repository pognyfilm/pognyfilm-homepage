import { createClient } from "../supabase/server";
import type { Warranty } from "./types";

export async function getAdminWarranties() {
  const supabase = await createClient();
  if (!supabase) {
    return { items: [] as Warranty[], error: "Supabase 연결이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("warranties")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    items: (data || []) as Warranty[],
    error: error?.message || null,
  };
}

export async function getAdminWarranty(id: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { item: null as Warranty | null, error: "Supabase 연결이 필요합니다." };
  }

  const { data, error } = await supabase
    .from("warranties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return {
    item: (data as Warranty | null) || null,
    error: error?.message || (!data ? "품질보증서를 찾을 수 없습니다." : null),
  };
}
