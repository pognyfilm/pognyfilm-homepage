import type { AdminRole } from "../../lib/auth/get-admin-profile";

type AdminHeaderProps = {
  displayName: string;
  role: AdminRole;
  newInquiryCount: number;
  signOutAction: () => Promise<void>;
};

export default function AdminHeader({
  displayName,
  role,
  newInquiryCount,
  signOutAction,
}: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <span className="admin-avatar" aria-hidden="true">
          {displayName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <strong>{displayName}</strong>
          <span>{role === "admin" ? "관리자" : "편집자"}</span>
        </div>
      </div>
      <div className="admin-header-actions">
        <a href="/admin/inquiries" className="admin-notification" aria-label={`새 문의 ${newInquiryCount}건`}>
          🔔
          {newInquiryCount > 0 && <span className="admin-new-badge">NEW</span>}
        </a>
        <form action={signOutAction}><button type="submit">로그아웃</button></form>
      </div>
    </header>
  );
}
