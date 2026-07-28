import Link from "next/link";
import { requireAdmin } from "../../../../lib/auth/require-admin";
import { getAdminPortfolioItems } from "../../../../lib/portfolio/queries";
import PortfolioList from "../../../../components/admin/PortfolioList";

export default async function AdminPortfolioPage() {
  const session = await requireAdmin();
  if (session.status !== "authorized") return null;
  const { items, error } = await getAdminPortfolioItems();

  return (
    <>
      <div className="admin-page-heading">
        <div><p>CONTENT</p><h1>포트폴리오 관리</h1></div>
        <Link className="admin-primary-link" href="/admin/portfolio/new">신규 등록</Link>
      </div>
      <PortfolioList items={items} role={session.profile.role} initialError={error} />
    </>
  );
}
