import assert from "node:assert/strict";
import { validateWarrantyInput } from "../lib/warranty/validation";
import { getWarrantyIssuedDateValue } from "../lib/warranty/date";

const base = {
  customer_name: "김포그니",
  phone: "010-1234-5678",
  region: "경기도 파주시",
  place: "아파트 거실",
  installation_date: "2026-09-01",
  issued_date: "2026-09-05",
  product_name: "PG PRO 1590",
  installation_area: "28.5",
  warranty_period: "시공일로부터 10년",
  installer: "포그니필름 본사 직영팀",
  notes: "",
};

assert.equal(validateWarrantyInput(base).installation_area, 28.5);
assert.equal(validateWarrantyInput(base).issued_date, "2026-09-05");
assert.throws(
  () => validateWarrantyInput({ ...base, issued_date: "2026/09/05" }),
  /발급일/,
);
assert.equal(
  validateWarrantyInput({ ...base, installation_area: "" }).installation_area,
  null,
);
assert.throws(
  () => validateWarrantyInput({ ...base, installation_area: "0" }),
  /시공면적/,
);
assert.throws(
  () => validateWarrantyInput({ ...base, installation_area: "not-a-number" }),
  /시공면적/,
);
assert.equal(
  getWarrantyIssuedDateValue("2026-09-05", "2026-09-02T03:00:00.000Z"),
  "2026-09-05T00:00:00+09:00",
);
assert.equal(
  getWarrantyIssuedDateValue(null, "2026-09-02T03:00:00.000Z"),
  "2026-09-02T03:00:00.000Z",
);

console.log("Warranty date and installation area validation tests passed.");
