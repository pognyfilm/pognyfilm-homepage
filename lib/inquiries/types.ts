export type InquiryStatus =
  | "new"
  | "consulting"
  | "visit_reserved"
  | "quotation_completed"
  | "contract_completed"
  | "closed";

export type Inquiry = {
  id: string;
  customer_name: string;
  phone: string;
  region: string | null;
  place: string | null;
  message: string | null;
  source: string;
  status: InquiryStatus;
  manager: string | null;
  memo: string | null;
  sms_sent: boolean;
  sms_sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};
