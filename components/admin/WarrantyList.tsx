"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminRole } from "../../lib/auth/get-admin-profile";
import type { Warranty } from "../../lib/warranty/types";
import { deleteWarrantyAction } from "../../app/admin/(protected)/warranty/actions";

export default function WarrantyList({
  items,
  role,
  initialError,
}: {
  items: Warranty[];
  role: AdminRole;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(initialError || "");
  const [isPending, startTransition] = useTransition();

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
    if (!keyword) return items;
    return items.filter((item) =>
      [
        item.warranty_number,
        item.customer_name,
        item.phone,
        item.region,
        item.place,
        item.product_name,
        item.installer,
      ].some((value) =>
        value.toLowerCase().replace(/[^a-z0-9가-힣]/g, "").includes(keyword),
      ),
    );
  }, [items, query]);

  const remove = (item: Warranty) => {
    if (
      !window.confirm(
        `${item.warranty_number} · ${item.customer_name} 고객의 품질보증서를 삭제하시겠습니까?`,
      )
    ) {
      return;
    }
    setMessage("");
    startTransition(async () => {
      const result = await deleteWarrantyAction(item.id);
      if (!result.success) setMessage(result.error);
      else router.refresh();
    });
  };

  return (
    <section className="admin-portfolio-panel" aria-busy={isPending}>
      <div className="admin-portfolio-toolbar admin-warranty-toolbar">
        <p>총 <strong>{items.length}</strong>건</p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="보증번호, 고객명, 연락처 검색"
          aria-label="품질보증서 검색"
        />
      </div>

      {message && <p className="admin-data-error" role="alert">{message}</p>}

      {!initialError && visibleItems.length === 0 ? (
        <div className="admin-list-empty">
          <strong>표시할 품질보증서가 없습니다.</strong>
          <p>신규 등록 버튼으로 첫 품질보증서를 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-portfolio-table admin-warranty-table">
            <thead>
              <tr>
                <th>보증번호</th>
                <th>고객명/연락처</th>
                <th>시공지역·장소</th>
                <th>시공일</th>
                <th>제품명</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td data-label="보증번호">
                    <strong className="admin-warranty-number">{item.warranty_number}</strong>
                  </td>
                  <td data-label="고객명/연락처">
                    <strong>{item.customer_name}</strong>
                    <small className="admin-table-subline">{item.phone}</small>
                  </td>
                  <td data-label="시공지역·장소">
                    {item.region}<small className="admin-table-subline">{item.place}</small>
                  </td>
                  <td data-label="시공일">{item.installation_date}</td>
                  <td data-label="제품명">{item.product_name}</td>
                  <td data-label="관리">
                    <div className="admin-row-actions">
                      <Link
                        href={`/admin/warranty/${item.id}/print`}
                        target="_blank"
                        rel="noopener"
                      >
                        PDF 출력
                      </Link>
                      <Link href={`/admin/warranty/${item.id}/edit`}>수정</Link>
                      {role === "admin" && (
                        <button
                          type="button"
                          onClick={() => remove(item)}
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
