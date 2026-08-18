export type DateRange = {
  startDate: string;
  endDate: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_ANALYTICS_RANGE_DAYS = 93;

const parseUtcDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
};

export function validateDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) {
    return { ok: false as const, code: "INVALID_DATE", message: "조회 기간을 확인해주세요." };
  }
  const start = parseUtcDate(startDate);
  const end = parseUtcDate(endDate);
  if (!start || !end || start > end) {
    return { ok: false as const, code: "INVALID_DATE", message: "조회 기간을 확인해주세요." };
  }
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > MAX_ANALYTICS_RANGE_DAYS) {
    return { ok: false as const, code: "DATE_RANGE_TOO_LARGE", message: `최대 ${MAX_ANALYTICS_RANGE_DAYS}일까지 조회할 수 있습니다.` };
  }
  return { ok: true as const, range: { startDate, endDate }, days };
}

export function previousDateRange(range: DateRange): DateRange {
  const start = new Date(`${range.startDate}T00:00:00.000Z`);
  const end = new Date(`${range.endDate}T00:00:00.000Z`);
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousEnd = new Date(start.getTime() - 86_400_000);
  const previousStart = new Date(previousEnd.getTime() - (days - 1) * 86_400_000);
  return {
    startDate: previousStart.toISOString().slice(0, 10),
    endDate: previousEnd.toISOString().slice(0, 10),
  };
}

export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 10_000) / 100;
}

export function safeCostPerConversion(cost: number, conversions: number): number | null {
  return conversions > 0 ? cost / conversions : null;
}

export function parseLeadEventNames(value = process.env.GA4_LEAD_EVENT_NAMES || "") {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function rangeCacheTtl(range: DateRange, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  if (range.endDate >= today) return 5 * 60_000;
  const days = Math.floor((new Date(`${range.endDate}T00:00:00Z`).getTime() - new Date(`${range.startDate}T00:00:00Z`).getTime()) / 86_400_000) + 1;
  return days <= 30 ? 30 * 60_000 : 6 * 60 * 60_000;
}

export function canAccessAnalytics(status: string) {
  return status === "authorized";
}
