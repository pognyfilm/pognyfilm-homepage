import { redirect } from "next/navigation";
import { getAdminProfile } from "../../../../lib/auth/get-admin-profile";
import AdminLoginForm from "../../../../components/admin/AdminLoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const session = await getAdminProfile();
  const params = await searchParams;

  if (session.status === "authorized") {
    redirect("/admin");
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <span>POGNY FILM</span>
          <strong>ADMIN</strong>
        </div>
        <p className="admin-kicker">관리자 시스템</p>
        <h1 id="admin-login-title">관리자 로그인</h1>
        <p className="admin-login-description">
          포그니필름 홈페이지 운영 권한이 있는 계정으로 로그인해주세요.
        </p>

        {session.status === "unconfigured" ? (
          <div className="admin-setup-notice" role="status">
            <strong>Supabase 연결 설정이 필요합니다.</strong>
            <p>
              관리자 인증을 사용하려면 Vercel과 로컬 환경에 Supabase 공개
              URL 및 Anon Key를 등록해주세요.
            </p>
          </div>
        ) : (
          <AdminLoginForm
            initialError={
              params.error === "unauthorized"
                ? "활성화된 관리자 또는 편집자 권한이 없는 계정입니다."
                : undefined
            }
          />
        )}
      </section>
    </main>
  );
}
