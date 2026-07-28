import { requireAdmin } from "../../../lib/auth/require-admin";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import { signOut } from "../actions";
import { getInquiryDashboardData } from "../../../lib/inquiries/queries";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  if (session.status === "unconfigured") {
    return (
      <main className="admin-unconfigured-page">
        <div className="admin-setup-notice admin-setup-notice-large">
          <span>ADMIN SETUP</span>
          <h1>관리자 인증 연결이 필요합니다.</h1>
          <p>
            현재 관리자 화면의 기반 구축은 완료되었지만 Supabase 환경변수가
            설정되지 않았습니다. 별도 홈페이지 관리자용 Supabase 프로젝트를
            준비한 후 환경변수를 등록해주세요.
          </p>
        </div>
      </main>
    );
  }

  const displayName =
    session.profile.display_name || session.profile.email || session.user.email;

  const inquiryDashboard = await getInquiryDashboardData();
  const newInquiryCount = inquiryDashboard.newCount || 0;

  return (
    <div className="admin-shell">
      <AdminSidebar newInquiryCount={newInquiryCount} />
      <div className="admin-workspace">
        <AdminHeader
          displayName={displayName || "관리자"}
          role={session.profile.role}
          newInquiryCount={newInquiryCount}
          signOutAction={signOut}
        />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
