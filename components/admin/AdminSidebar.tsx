"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "포트폴리오 관리", href: "/admin/portfolio", enabled: true },
  { label: "품질보증서", href: "/admin/warranty", enabled: true },
  { label: "문의관리", href: "/admin/inquiries", enabled: true, badge: true },
  { label: "광고·방문 분석", href: "/admin/analytics", enabled: true },
];

function SidebarContents({ newInquiryCount }: { newInquiryCount: number }) {
  const pathname = usePathname();
  return (
    <>
      <Link className="admin-sidebar-brand" href="/admin">
        <span>POGNY FILM</span>
        <strong>ADMIN</strong>
      </Link>
      <nav aria-label="관리자 메뉴">
        <Link
          className={pathname === "/admin" ? "is-active" : ""}
          href="/admin"
          aria-current={pathname === "/admin" ? "page" : undefined}
        >
          <span aria-hidden="true">01</span>
          대시보드
        </Link>
        {menus.map((menu, index) =>
          menu.enabled && menu.href ? (
            <Link
              className={pathname.startsWith(menu.href) ? "is-active" : ""}
              href={menu.href}
              aria-current={pathname.startsWith(menu.href) ? "page" : undefined}
              key={menu.label}
            >
              <span aria-hidden="true">0{index + 2}</span>
              {menu.label}
              {menu.badge && newInquiryCount > 0 && (
                <em
                  className="admin-new-badge"
                  title={`미확인 문의 ${newInquiryCount}건`}
                  aria-label={`새 문의 ${newInquiryCount}건`}
                >
                  NEW
                </em>
              )}
            </Link>
          ) : (
            <span
              className="admin-disabled-menu"
              aria-disabled="true"
              title="다음 단계에서 제공됩니다."
              key={menu.label}
            >
              <span aria-hidden="true">0{index + 2}</span>
              {menu.label}
              <em>준비 중</em>
            </span>
          ),
        )}
      </nav>
      <div className="admin-sidebar-footer">
        <span>DATA INSIGHT</span>
        <p>운영·방문 데이터 분석</p>
      </div>
    </>
  );
}

export default function AdminSidebar({ newInquiryCount }: { newInquiryCount: number }) {
  return (
    <>
      <aside className="admin-sidebar">
        <SidebarContents newInquiryCount={newInquiryCount} />
      </aside>
      <details className="admin-mobile-menu">
        <summary>관리 메뉴</summary>
        <div className="admin-mobile-menu-panel">
          <SidebarContents newInquiryCount={newInquiryCount} />
        </div>
      </details>
    </>
  );
}
