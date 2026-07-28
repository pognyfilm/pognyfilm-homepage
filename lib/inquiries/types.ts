export const inquiryStatuses = [
  "new",
  "consulting",
  "visit_reserved",
  "quotation_completed",
  "contract_completed",
  "closed",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "미확인",
  consulting: "상담중",
  visit_reserved: "방문예약",
  quotation_completed: "견적완료",
  contract_completed: "계약완료",
  closed: "종료",
};

export const inquiryManagers = ["이성화", "이두연"] as const;
export type InquiryManager = (typeof inquiryManagers)[number];

export type Inquiry = {
  id: string;
  customer_name: string;
  phone: string;
  region: string | null;
  place: string | null;
  message: string | null;
  source: string;
  status: InquiryStatus;
  manager: InquiryManager | null;
  memo: string | null;
  sms_sent: boolean;
  sms_sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};
