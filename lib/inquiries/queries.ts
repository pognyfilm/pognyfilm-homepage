import { createClient } from "../supabase/server";
import type { Inquiry } from "./types";

export async function getAdminInquiries(limit?: number) {
  const supabase = await createClient();
  if (!supabase) {
    return { items: [] as Inquiry[], error: "Supabase 연결이 필요합니다." };
  }

  let query = supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;

  return {
    items: (data || []) as Inquiry[],
    error: error?.message || null,
  };
}

export async function getInquiryDashboardData() {
  const supabase = await createClient();
  if (!supabase) {
    return {
      todayCount: null,
      newCount: null,
      recent: [] as Inquiry[],
      error: "Supabase 연결이 필요합니다.",
    };
  }

  const now = new Date();
  const koreanDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const start = new Date(`${koreanDate}T00:00:00+09:00`).toISOString();
  const end = new Date(`${koreanDate}T24:00:00+09:00`).toISOString();

  const [today, unread, recent] = await Promise.all([
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start)
      .lt("created_at", end),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new")
      .gte("created_at", start)
      .lt("created_at", end),
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const error = today.error || unread.error || recent.error;
  return {
    todayCount: today.count,
    newCount: unread.count,
    recent: (recent.data || []) as Inquiry[],
    error: error?.message || null,
  };
}
