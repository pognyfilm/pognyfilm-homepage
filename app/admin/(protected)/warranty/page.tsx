import Link from "next/link";
import WarrantyList from "../../../../components/admin/WarrantyList";
import { requireAdmin } from "../../../../lib/auth/require-admin";
import { getAdminWarranties } from "../../../../lib/warranty/queries";

export default async function AdminWarrantyPage() {
  const session = await requireAdmin();
  if (session.status !== "authorized") return null;
  const { items, error } = await getAdminWarranties();

  return (
    <>
      <div className="admin-page-heading">
        <div><p>WARRANTY</p><h1>품질보증서</h1></div>
        <Link
          className="admin-primary-link admin-warranty-create-link"
          href="/admin/warranty/new"
        >
          신규 등록
        </Link>
      </div>
      <WarrantyList
        items={items}
        role={session.profile.role}
        initialError={error}
      />
    </>
  );
}
