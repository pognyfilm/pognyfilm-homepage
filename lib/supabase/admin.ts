import { createClient } from "@supabase/supabase-js";

export const requiredSupabaseEnvironmentVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const missingSupabaseEnvironmentVariables =
  requiredSupabaseEnvironmentVariables.filter(
    (variableName) => !process.env[variableName],
  );

export const hasSupabaseServerConfig =
  missingSupabaseEnvironmentVariables.length === 0;

if (!hasSupabaseServerConfig) {
  console.error(
    "[startup] Supabase configuration validation failed. Missing required environment variables:",
    missingSupabaseEnvironmentVariables,
  );
}

export const createServiceClient = () => {
  if (!hasSupabaseServerConfig) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(url!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
