"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  inquiryManagers,
  inquiryStatusLabels,
  inquiryStatuses,
  type Inquiry,
  type InquiryManager as InquiryManagerName,
  type InquiryStatus,
} from "../../lib/inquiries/types";
import {
  deleteInquiryAction,
  updateInquiryManager,
  updateInquiryMemo,
  updateInquiryStatus,
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

export default function InquiryManager({
  items,
  role,
}: {
  items: Inquiry[];
  role: AdminRole;
}) {
  const [rows, setRows] = useState(items);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [memo, setMemo] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const memoReady = useRef(false);

  useEffect(() => setRows(items), [items]);

  useEffect(() => {
    setMemo(selected?.memo || "");
    setSaveMessage("");
    memoReady.current = false;
    const timer = window.setTimeout(() => {
      memoReady.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selected?.id, selected?.memo]);

  useEffect(() => {
    if (!selected || !memoReady.current || memo === (selected.memo || "")) return;
    setSaveMessage("저장 중...");
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await updateInquiryMemo(selected.id, memo);
        if (result.success) {
          setSelected((current) =>
            current
              ? { ...current, memo, updated_at: result.updatedAt || current.updated_at }
              : current,
          );
          setSaveMessage(`자동 저장됨 · ${formatDate(result.updatedAt!, true)}`);
        } else {
          setSaveMessage(result.error || "메모 저장에 실패했습니다.");
        }
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [memo, selected]);

  const changeStatus = (status: InquiryStatus) => {
    if (!selected) return;
    const previous = selected.status;
    setSelected({ ...selected, status });
    setRows((current) =>
      current.map((item) =>
        item.id === selected.id ? { ...item, status } : item,
      ),
    );
    setSaveMessage("저장 중...");
    startTransition(async () => {
      const result = await updateInquiryStatus(selected.id, status);
      setSaveMessage(result.success ? "상태가 저장되었습니다." : result.error || "저장 실패");
      if (!result.success) {
        setSelected((current) => current ? { ...current, status: previous } : current);
        setRows((current) =>
          current.map((item) =>
            item.id === selected.id ? { ...item, status: previous } : item,
          ),
        );
      }
    });
  };

  const changeManager = (manager: InquiryManagerName | null) => {
    if (!selected) return;
    const previous = selected.manager;
    setSelected({ ...selected, manager });
    setSaveMessage("저장 중...");
    startTransition(async () => {
      const result = await updateInquiryManager(selected.id, manager);
      setSaveMessage(result.success ? "담당자가 저장되었습니다." : result.error || "저장 실패");
      if (!result.success) setSelected((current) => current ? { ...current, manager: previous } : current);
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
    setSaveMessage("");
    startTransition(async () => {
      const result = await deleteInquiryAction(target.id);
      if (!result.success) {
        setSaveMessage(result.error || "문의 삭제에 실패했습니다.");
        return;
      }
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
                onClick={() => setSelected(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(item);
                  }
                }}
              >
                <td data-label="이름">
                  <span className="admin-inquiry-name">
                    <strong>{item.customer_name}</strong>
                    {item.status === "new" && <em className="admin-new-badge">NEW</em>}
                    <em className={`admin-status-badge is-${item.status}`}>
                      {inquiryStatusLabels[item.status]}
                    </em>
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
            <section className="admin-inquiry-controls">
              <label><span>상태</span><select value={selected.status} disabled={isPending} onChange={(event) => changeStatus(event.target.value as InquiryStatus)}>{inquiryStatuses.map((status) => <option key={status} value={status}>{inquiryStatusLabels[status]}</option>)}</select></label>
              <label><span>담당자</span><select value={selected.manager || ""} disabled={isPending} onChange={(event) => changeManager((event.target.value || null) as InquiryManagerName | null)}><option value="">없음</option>{inquiryManagers.map((manager) => <option key={manager} value={manager}>{manager}</option>)}</select></label>
              <label className="is-wide"><span>상담 메모</span><textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="상담 내용을 자유롭게 기록하세요." /></label>
              <p className="admin-inquiry-save-status" aria-live="polite">{saveMessage || `최종 수정 ${formatDate(selected.updated_at, true)}`}</p>
            </section>
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
