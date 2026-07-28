"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminRole } from "../../lib/auth/get-admin-profile";
import type { PortfolioItem, PortfolioStatus } from "../../lib/portfolio/types";
import {
  changePortfolioStatusAction,
  deletePortfolioAction,
} from "../../app/admin/(protected)/portfolio/actions";

const statusLabels: Record<PortfolioStatus, string> = {
  published: "게시중",
  draft: "임시저장",
  hidden: "숨김",
};

export default function PortfolioList({
  items,
  role,
  initialError,
}: {
  items: PortfolioItem[];
  role: AdminRole;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | PortfolioStatus>("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(initialError || "");
  const [isPending, startTransition] = useTransition();

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (filter === "all" || item.status === filter) &&
        (!keyword ||
          item.title.toLowerCase().includes(keyword) ||
          (item.region || "").toLowerCase().includes(keyword)),
    );
  }, [filter, items, query]);

  const changeStatus = (id: string, status: PortfolioStatus) => {
    setMessage("");
    startTransition(async () => {
      const result = await changePortfolioStatusAction(id, status);
      if (!result.success) setMessage(result.error);
      else {
        if (result.warning) setMessage(result.warning);
        router.refresh();
      }
    });
  };

  const remove = (id: string, title: string) => {
    if (!window.confirm(`"${title}" 포트폴리오를 삭제하시겠습니까? 이미지도 함께 삭제됩니다.`)) return;
    setMessage("");
    startTransition(async () => {
      const result = await deletePortfolioAction(id);
      if (!result.success) setMessage(result.error);
      else {
        if (result.warning) setMessage(result.warning);
        router.refresh();
      }
    });
  };

  return (
    <section className="admin-portfolio-panel" aria-busy={isPending}>
      <div className="admin-portfolio-toolbar">
        <div className="admin-status-filters" aria-label="상태 필터">
          {[
            ["all", "전체"],
            ["published", "게시중"],
            ["draft", "임시저장"],
            ["hidden", "숨김"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={filter === value ? "is-active" : ""}
              onClick={() => setFilter(value as "all" | PortfolioStatus)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목 또는 지역 검색"
          aria-label="포트폴리오 검색"
        />
      </div>

      {message && <p className="admin-data-error" role="alert">{message}</p>}

      {!initialError && visibleItems.length === 0 ? (
        <div className="admin-list-empty">
          <strong>표시할 포트폴리오가 없습니다.</strong>
          <p>신규 등록 버튼으로 첫 포트폴리오를 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-portfolio-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>지역</th>
                <th>제품</th>
                <th>상태</th>
                <th>메인 노출</th>
                <th>시공일</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td data-label="제목"><strong>{item.title}</strong></td>
                  <td data-label="지역">{item.region || "—"}</td>
                  <td data-label="제품">{item.product || "—"}</td>
                  <td data-label="상태">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        changeStatus(item.id, event.target.value as PortfolioStatus)
                      }
                      disabled={isPending}
                      aria-label={`${item.title} 상태`}
                    >
                      <option value="published">게시중</option>
                      <option value="draft">임시저장</option>
                      <option value="hidden">숨김</option>
                    </select>
                  </td>
                  <td data-label="메인 노출">
                    <span
                      className={`admin-feature-badge ${item.is_featured ? "is-on" : "is-off"}`}
                    >
                      {item.is_featured ? "대표 노출" : "OFF"}
                    </span>
                  </td>
                  <td data-label="시공일">{item.installation_date || "—"}</td>
                  <td data-label="수정일">
                    {new Intl.DateTimeFormat("ko-KR").format(new Date(item.updated_at))}
                  </td>
                  <td data-label="관리">
                    <div className="admin-row-actions">
                      <Link href={`/admin/portfolio/${item.id}/edit`}>수정</Link>
                      {role === "admin" && (
                        <button
                          type="button"
                          onClick={() => remove(item.id, item.title)}
                          disabled={isPending}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
