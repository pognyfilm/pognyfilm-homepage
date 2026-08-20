"use client";

import { useEffect, useState, useTransition } from "react";
import { type Inquiry } from "../../lib/inquiries/types";
import {
  deleteInquiryAction,
  markInquiryRead,
} from "../../app/admin/(protected)/inquiries/actions";
import type { AdminRole } from "../../lib/auth/get-admin-profile";

const formatDate = (value: string, withTime = false) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : {}),
  }).format(new Date(value));

const truncate = (value: string | null) => {
  const text = value || "—";
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
};

const isTodayInKorea = (value: string) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(value)) === formatter.format(new Date());
};

export default function InquiryManager({
  items,
  role,
}: {
  items: Inquiry[];
  role: AdminRole;
}) {
  const [rows, setRows] = useState(items);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setRows(items), [items]);

  const openInquiry = (item: Inquiry) => {
    setSelected(item);
    if (item.status !== "new" || !isTodayInKorea(item.created_at)) return;

    startTransition(async () => {
      const result = await markInquiryRead(item.id);
      if (!result.success) return;
      setRows((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, status: "closed" } : row,
        ),
      );
      setSelected((current) =>
        current?.id === item.id ? { ...current, status: "closed" } : current,
      );
    });
  };

  const removeInquiry = () => {
    if (!selected || role !== "admin") return;
    if (
      !window.confirm(
        `${selected.customer_name} 고객의 문의를 삭제하시겠습니까?\n삭제한 문의는 복구할 수 없습니다.`,
      )
    ) {
      return;
    }
    const target = selected;
    startTransition(async () => {
      const result = await deleteInquiryAction(target.id);
      if (!result.success) return;
      setRows((current) => current.filter((item) => item.id !== target.id));
      setSelected(null);
    });
  };

  return (
    <>
      <div className="admin-inquiry-list">
        <table className="admin-inquiry-table">
          <thead>
            <tr>
              <th>이름</th><th>연락처</th><th>지역</th><th>시공장소</th><th>문의내용</th><th>문의일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr
                key={item.id}
                tabIndex={0}
                role="button"
                aria-label={`${item.customer_name} 문의 상세 보기`}
                onClick={() => openInquiry(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openInquiry(item);
                  }
                }}
              >
                <td data-label="이름">
                  <span className="admin-inquiry-name">
                    <strong>{item.customer_name}</strong>
                    {item.status === "new" && isTodayInKorea(item.created_at) && (
                      <em className="admin-new-badge">NEW</em>
                    )}
                  </span>
                </td>
                <td data-label="연락처">{item.phone}</td>
                <td data-label="지역">{item.region || "—"}</td>
                <td data-label="시공장소">{item.place || "—"}</td>
                <td
                  className="admin-inquiry-message-cell"
                  data-label="문의내용"
                  data-tooltip={item.message || "문의내용 없음"}
                  title={item.message || "문의내용 없음"}
                >
                  <span>{truncate(item.message)}</span>
                </td>
                <td data-label="문의일">{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-drawer-layer" role="presentation">
          <button className="admin-drawer-backdrop" type="button" aria-label="상세 닫기" onClick={() => setSelected(null)} />
          <aside className="admin-inquiry-drawer" role="dialog" aria-modal="true" aria-labelledby="inquiry-drawer-title">
            <header>
              <div><p>INQUIRY DETAIL</p><h2 id="inquiry-drawer-title">{selected.customer_name}님의 문의</h2></div>
              <button type="button" onClick={() => setSelected(null)} aria-label="닫기">×</button>
            </header>
            <dl className="admin-inquiry-detail">
              <div><dt>고객명</dt><dd>{selected.customer_name}</dd></div>
              <div><dt>연락처</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
              <div><dt>지역</dt><dd>{selected.region || "—"}</dd></div>
              <div><dt>시공장소</dt><dd>{selected.place || "—"}</dd></div>
              <div className="is-wide"><dt>문의내용</dt><dd>{selected.message || "—"}</dd></div>
              <div><dt>접수일시</dt><dd>{formatDate(selected.created_at, true)}</dd></div>
              <div><dt>SMS 발송</dt><dd>{selected.sms_sent ? `발송 완료${selected.sms_sent_at ? ` · ${formatDate(selected.sms_sent_at, true)}` : ""}` : "미발송"}</dd></div>
            </dl>
            {role === "admin" && (
              <div className="admin-inquiry-delete-zone">
                <div>
                  <strong>문의 삭제</strong>
                  <p>삭제한 문의는 복구할 수 없습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={removeInquiry}
                  disabled={isPending}
                >
                  삭제
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
