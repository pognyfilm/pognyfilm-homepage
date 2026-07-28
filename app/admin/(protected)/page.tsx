import Link from "next/link";
import AdminEmptyState from "../../../components/admin/AdminEmptyState";
import AdminMetricCard from "../../../components/admin/AdminMetricCard";
import { getPortfolioDashboardData } from "../../../lib/portfolio/queries";
import { getInquiryDashboardData } from "../../../lib/inquiries/queries";
import { inquiryStatusLabels } from "../../../lib/inquiries/types";

export default async function AdminDashboardPage() {
  const [portfolio, inquiries] = await Promise.all([
    getPortfolioDashboardData(),
    getInquiryDashboardData(),
  ]);
  const metrics = [
    { label: "오늘 방문자", status: "데이터 연결 전" },
    { label: "오늘 문의", status: inquiries.error ? "연결 확인 필요" : "오늘 접수", value: inquiries.todayCount },
    { label: "미확인 문의", status: inquiries.error ? "연결 확인 필요" : "처리 대기", value: inquiries.newCount },
    { label: "오늘 광고비", status: "데이터 연결 전" },
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>OVERVIEW</p>
          <h1>대시보드</h1>
        </div>
        <span className="admin-status-chip">Phase 1 · 기반 구축</span>
      </div>

      <section className="admin-metric-grid" aria-label="운영 지표">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="admin-portfolio-summary" aria-label="포트폴리오 현황">
        <article><span>게시중 포트폴리오</span><strong>{portfolio.counts.published ?? "—"}</strong></article>
        <article><span>임시저장</span><strong>{portfolio.counts.draft ?? "—"}</strong></article>
        <article><span>숨김</span><strong>{portfolio.counts.hidden ?? "—"}</strong></article>
        {portfolio.error && <p role="status">포트폴리오 테이블 연결 후 데이터가 표시됩니다.</p>}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-empty-card">
          <div className="admin-card-title"><h2>최근 문의</h2><Link href="/admin/inquiries">전체 보기</Link></div>
          {inquiries.recent.length ? (
            <ul className="admin-recent-portfolio">
              {inquiries.recent.map((item) => (
                <li key={item.id}>
                  <Link href="/admin/inquiries">{item.customer_name} · {item.region || "지역 미입력"}</Link>
                  <span className="admin-dashboard-inquiry-status">
                    {item.status === "new" && <em className="admin-new-badge">NEW</em>}
                    <em className={`admin-status-badge is-${item.status}`}>
                      {inquiryStatusLabels[item.status]}
                    </em>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-empty-content"><strong>접수된 문의가 없습니다.</strong><p>새 문의가 접수되면 최근 5건을 표시합니다.</p></div>
          )}
        </article>
        <article className="admin-empty-card">
          <div className="admin-card-title"><h2>최근 등록 포트폴리오</h2><Link href="/admin/portfolio">전체 보기</Link></div>
          {portfolio.recent.length ? (
            <ul className="admin-recent-portfolio">
              {portfolio.recent.map((item) => (
                <li key={item.id}>
                  <Link href={`/admin/portfolio/${item.id}/edit`}>{item.title}</Link>
                  <span>{item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-empty-content"><strong>표시할 포트폴리오 데이터가 없습니다.</strong><p>첫 포트폴리오를 등록해주세요.</p></div>
          )}
        </article>
        <AdminEmptyState
          title="최근 등록 품질보증서"
          message="표시할 품질보증서 데이터가 없습니다."
          detail="품질보증서 관리 기능은 다음 단계에서 연결합니다."
        />
      </section>

      <section className="admin-quick-actions" aria-labelledby="quick-actions-title">
        <div>
          <p>QUICK ACTIONS</p>
          <h2 id="quick-actions-title">빠른 작업</h2>
        </div>
        <Link className="admin-quick-link" href="/admin/portfolio/new">포트폴리오 등록</Link>
        <button type="button" disabled title="다음 단계에서 제공됩니다.">
          품질보증서 등록
        </button>
      </section>
    </>
  );
}
