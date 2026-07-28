import InquiryManager from "../../../../components/admin/InquiryManager";
import { getAdminInquiries } from "../../../../lib/inquiries/queries";
import { requireAdmin } from "../../../../lib/auth/require-admin";

export default async function AdminInquiriesPage() {
  const session = await requireAdmin();
  if (session.status !== "authorized") return null;
  const { items, error } = await getAdminInquiries();

  return (
    <>
      <div className="admin-page-heading">
        <div><p>INQUIRIES</p><h1>문의관리</h1></div>
        <span className="admin-status-chip">전체 {items.length}건</span>
      </div>
      {error ? (
        <section className="admin-inquiry-state" role="alert">
          <strong>문의 데이터를 불러오지 못했습니다.</strong>
          <p>잠시 후 다시 시도해주세요.</p>
        </section>
      ) : items.length ? (
        <InquiryManager items={items} role={session.profile.role} />
      ) : (
        <section className="admin-inquiry-state">
          <strong>접수된 문의가 없습니다.</strong>
          <p>홈페이지에서 새 문의가 접수되면 이곳에 표시됩니다.</p>
        </section>
      )}
    </>
  );
}
