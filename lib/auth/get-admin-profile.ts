import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

export type AdminRole = "admin" | "editor";

export type AdminProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: AdminRole;
  is_active: boolean;
};

export type AdminSession =
  | { status: "unconfigured"; user: null; profile: null }
  | { status: "unauthenticated"; user: null; profile: null }
  | { status: "unauthorized"; user: User; profile: AdminProfile | null }
  | { status: "authorized"; user: User; profile: AdminProfile };

export async function getAdminProfile(): Promise<AdminSession> {
  const supabase = await createClient();

  if (!supabase) {
    return { status: "unconfigured", user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated", user: null, profile: null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,is_active")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as AdminProfile | null;
  const hasAccess =
    profile?.is_active === true &&
    (profile.role === "admin" || profile.role === "editor");

  if (!hasAccess) {
    return { status: "unauthorized", user, profile };
  }

  return { status: "authorized", user, profile };
}
