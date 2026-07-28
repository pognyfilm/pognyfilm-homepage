import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabasePublicConfig } from "./config";

const allowedRoles = new Set(["admin", "editor"]);
const sessionHeaderNames = ["cache-control", "expires", "pragma"] as const;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let pendingCookies: Parameters<typeof response.cookies.set>[] = [];
  let pendingHeaders: Record<string, string> = {};

  if (!hasSupabasePublicConfig()) {
    return response;
  }

  const redirectWithSession = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    pendingCookies.forEach((cookie) => redirectResponse.cookies.set(...cookie));
    sessionHeaderNames.forEach((name) => {
      const value = pendingHeaders[name];
      if (value) redirectResponse.headers.set(name, value);
    });
    return redirectResponse;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          pendingCookies = cookiesToSet.map(({ name, value, options }) => [
            name,
            value,
            options,
          ]);
          pendingHeaders = headers;
          pendingCookies.forEach((cookie) => response.cookies.set(...cookie));
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user) {
    if (!isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return redirectWithSession(url);
    }

    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();
  const hasAccess =
    profile?.is_active === true && allowedRoles.has(String(profile.role));

  if (isLoginPage && hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return redirectWithSession(url);
  }

  if (!isLoginPage && !hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "?error=unauthorized";
    return redirectWithSession(url);
  }

  return response;
}
