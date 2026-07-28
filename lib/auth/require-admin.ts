import { redirect } from "next/navigation";
import { getAdminProfile } from "./get-admin-profile";

export async function requireAdmin() {
  const session = await getAdminProfile();

  if (session.status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (session.status === "unauthorized") {
    redirect("/admin/login?error=unauthorized");
  }

  return session;
}
