"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Warranty, WarrantySaveInput } from "../../lib/warranty/types";
import { saveWarrantyAction } from "../../app/admin/(protected)/warranty/actions";
import AdminDatePicker, { getTodayInKorea } from "./AdminDatePicker";

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
      issued_date: String(formData.get("issued_date") || ""),
      product_name: String(formData.get("product_name") || ""),
      installation_area: String(formData.get("installation_area") || ""),
      warranty_period: String(formData.get("warranty_period") || ""),
      installer: initialItem?.installer || "포그니필름 본사 직영팀",
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
            <h2>품질보증서 등록 정보</h2>
          </div>
          <span>* 표시는 필수 입력 항목입니다.</span>
        </div>

        <div className="admin-warranty-auto-info">
          <div>
            <strong>자동 반영 정보</strong>
            <span>품질보증번호, 시공사 정보와 직인은 자동으로 품질보증서에 반영됩니다.</span>
          </div>
          <b>{initialItem?.warranty_number || "저장 시 자동 생성"}</b>
        </div>

        <div className="admin-warranty-form-groups">
          <fieldset className="admin-warranty-form-group">
            <legend>고객 정보</legend>
            <div className="admin-form-grid">
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
                  placeholder="예: 경기도 파주시, 서울 강남구"
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
                  placeholder="예: OO아파트 102동 1301호 거실/베란다"
                  maxLength={150}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="admin-warranty-form-group">
            <legend>시공 정보</legend>
            <div className="admin-form-grid">
              <AdminDatePicker
                name="installation_date"
                label="시공일"
                defaultValue={initialItem?.installation_date || ""}
                required
              />
              <AdminDatePicker
                name="issued_date"
                label="발급일"
                defaultValue={initialItem?.issued_date || getTodayInKorea()}
                required
              />
              <label>
                <span>제품명 *</span>
                <input
                  name="product_name"
                  type="text"
                  defaultValue={initialItem?.product_name || ""}
                  placeholder="예: PG PRO 1590"
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
                  list="warranty-period-options"
                  defaultValue={initialItem?.warranty_period || ""}
                  placeholder="예: 7년, 10년"
                  maxLength={80}
                  required
                />
                <datalist id="warranty-period-options">
                  <option value="7년" />
                  <option value="10년" />
                </datalist>
                <small>추천값을 선택하거나 다른 보증기간을 직접 입력할 수 있습니다.</small>
              </label>
            </div>
          </fieldset>

          <fieldset className="admin-warranty-form-group">
            <legend>추가 정보</legend>
            <div className="admin-form-grid">
              <label className="admin-field-full">
                <span>내부 메모</span>
                <textarea
                  name="notes"
                  defaultValue={initialItem?.notes || ""}
                  rows={5}
                  maxLength={5000}
                  placeholder="관리자 확인용 메모를 입력해주세요."
                />
                <small>내부 관리용 정보이며 고객용 품질보증서에는 표시되지 않습니다.</small>
              </label>
            </div>
          </fieldset>
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
