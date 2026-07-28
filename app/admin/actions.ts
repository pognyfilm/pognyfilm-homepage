"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AdminLoginResult =
  | { success: true }
  | {
      success: false;
      error: {
        name: string;
        message: string;
        status?: number;
        code?: string;
      };
    };

export async function signIn(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  const supabase = await createClient();

  if (!supabase) {
    const error = {
      name: "SupabaseConfigurationError",
      message: "Supabase 환경변수가 설정되지 않았습니다.",
    };
    console.error("[Admin signInWithPassword failed]", error);
    return { success: false, error };
  }

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const error = {
        name: signInError.name,
        message: signInError.message,
        status: signInError.status,
        code: signInError.code,
      };
      console.error("[Admin signInWithPassword failed]", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (caughtError) {
    const error = {
      name:
        caughtError instanceof Error
          ? caughtError.name
          : "UnknownAdminLoginError",
      message:
        caughtError instanceof Error
          ? caughtError.message
          : "알 수 없는 로그인 오류가 발생했습니다.",
    };
    console.error("[Admin signInWithPassword exception]", error);
    return { success: false, error };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
