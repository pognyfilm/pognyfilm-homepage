export const getWarrantyIssuedDateValue = (
  issuedDate: string | null | undefined,
  createdAt: string,
) => issuedDate ? `${issuedDate}T00:00:00+09:00` : createdAt;
