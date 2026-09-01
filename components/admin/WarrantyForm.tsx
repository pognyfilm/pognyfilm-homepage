"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Warranty, WarrantySaveInput } from "../../lib/warranty/types";
import { saveWarrantyAction } from "../../app/admin/(protected)/warranty/actions";

export default function WarrantyForm({
  mode,
  initialItem,
}: {
  mode: "create" | "edit";
  initialItem?: Warranty | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const input: WarrantySaveInput = {
      id: initialItem?.id,
      customer_name: String(formData.get("customer_name") || ""),
      phone: String(formData.get("phone") || ""),
      region: String(formData.get("region") || ""),
      place: String(formData.get("place") || ""),
      installation_date: String(formData.get("installation_date") || ""),
      product_name: String(formData.get("product_name") || ""),
      installation_area: String(formData.get("installation_area") || ""),
      warranty_period: String(formData.get("warranty_period") || ""),
      installer: String(formData.get("installer") || ""),
      notes: String(formData.get("notes") || ""),
    };

    setIsSubmitting(true);
    setMessage("");
    const result = await saveWarrantyAction(mode, input);
    if (!result.success) {
      setMessage(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/warranty");
    router.refresh();
  };

  return (
    <form className="admin-portfolio-form" onSubmit={handleSubmit}>
      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div>
            <span className="admin-form-step">WARRANTY</span>
            <h2>품질보증 정보</h2>
          </div>
          <span>필수 항목을 모두 입력해주세요.</span>
        </div>

        <div className="admin-form-grid">
          <label className="admin-field-full">
            <span>품질보증번호</span>
            <input
              type="text"
              value={initialItem?.warranty_number || "등록 완료 시 자동 생성"}
              readOnly
              aria-readonly="true"
              className="admin-readonly-field"
            />
            <small>등록일 기준 PG-YYMMDDNN 형식으로 중복 없이 자동 생성됩니다.</small>
          </label>
          <label>
            <span>고객명 *</span>
            <input
              name="customer_name"
              type="text"
              defaultValue={initialItem?.customer_name || ""}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label>
            <span>연락처 *</span>
            <input
              name="phone"
              type="tel"
              defaultValue={initialItem?.phone || ""}
              placeholder="010-0000-0000"
              maxLength={20}
              autoComplete="tel"
              required
            />
          </label>
          <label>
            <span>시공지역 *</span>
            <input
              name="region"
              type="text"
              defaultValue={initialItem?.region || ""}
              placeholder="예: 서울 강남구"
              maxLength={100}
              required
            />
          </label>
          <label>
            <span>시공장소 *</span>
            <input
              name="place"
              type="text"
              defaultValue={initialItem?.place || ""}
              placeholder="예: 아파트 거실"
              maxLength={150}
              required
            />
          </label>
          <label>
            <span>시공일 *</span>
            <input
              name="installation_date"
              type="date"
              defaultValue={initialItem?.installation_date || ""}
              required
            />
          </label>
          <label>
            <span>제품명 *</span>
            <input
              name="product_name"
              type="text"
              defaultValue={initialItem?.product_name || ""}
              placeholder="예: PG-PRO"
              maxLength={120}
              required
            />
          </label>
          <label>
            <span>시공면적 (㎡)</span>
            <input
              name="installation_area"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="99999"
              step="0.01"
              defaultValue={initialItem?.installation_area ?? ""}
              placeholder="예: 28"
            />
            <small>숫자만 입력하면 보증서에 ㎡ 단위로 표시됩니다.</small>
          </label>
          <label>
            <span>보증기간 *</span>
            <input
              name="warranty_period"
              type="text"
              defaultValue={initialItem?.warranty_period || ""}
              placeholder="예: 시공일로부터 10년"
              maxLength={80}
              required
            />
          </label>
          <label>
            <span>시공담당자 *</span>
            <input
              name="installer"
              type="text"
              defaultValue={initialItem?.installer || ""}
              maxLength={80}
              required
            />
          </label>
          <label className="admin-field-full">
            <span>비고</span>
            <textarea
              name="notes"
              defaultValue={initialItem?.notes || ""}
              rows={6}
              maxLength={5000}
              placeholder="추가로 기록할 내용을 입력해주세요."
            />
          </label>
        </div>
      </section>

      {message && <p className="admin-data-error" role="alert">{message}</p>}

      <div className="admin-form-actions">
        <Link href="/admin/warranty">취소</Link>
        {initialItem && (
          <Link
            className="admin-pdf-link"
            href={`/admin/warranty/${initialItem.id}/print`}
            target="_blank"
            rel="noopener"
          >
            PDF 출력
          </Link>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "저장 중..."
            : mode === "create"
              ? "품질보증서 등록"
              : "수정사항 저장"}
        </button>
      </div>
    </form>
  );
}
