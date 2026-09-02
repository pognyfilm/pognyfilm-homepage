import type { WarrantySaveInput } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const text = (value: string, label: string, maxLength: number) => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label}을(를) 입력해주세요.`);
  if (normalized.length > maxLength) {
    throw new Error(`${label}은(는) ${maxLength}자 이내로 입력해주세요.`);
  }
  return normalized;
};

export function validateWarrantyInput(input: WarrantySaveInput) {
  const phone = input.phone.replace(/[^0-9]/g, "");
  if (!/^0\d{8,10}$/.test(phone)) {
    throw new Error("연락처를 정확히 입력해주세요.");
  }
  if (!DATE_PATTERN.test(input.installation_date)) {
    throw new Error("시공일을 정확히 입력해주세요.");
  }
  if (!DATE_PATTERN.test(input.issued_date)) {
    throw new Error("발급일을 정확히 입력해주세요.");
  }
  const installationAreaText = input.installation_area.trim();
  const installationArea = installationAreaText
    ? Number(installationAreaText)
    : null;
  if (
    installationArea !== null &&
    (!Number.isFinite(installationArea) || installationArea <= 0 || installationArea > 99999)
  ) {
    throw new Error("시공면적을 올바르게 입력해주세요.");
  }

  return {
    id: input.id,
    customer_name: text(input.customer_name, "고객명", 80),
    phone,
    region: text(input.region, "시공지역", 100),
    place: text(input.place, "시공장소", 150),
    installation_date: input.installation_date,
    issued_date: input.issued_date,
    product_name: text(input.product_name, "제품명", 120),
    installation_area: installationArea,
    warranty_period: text(input.warranty_period, "보증기간", 80),
    installer: text(input.installer, "시공담당자", 80),
    notes: input.notes.trim().slice(0, 5000),
  };
}

export function assertWarrantyId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("품질보증서 ID가 올바르지 않습니다.");
  }
}
