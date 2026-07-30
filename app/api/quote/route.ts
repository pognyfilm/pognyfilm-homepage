import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sendCustomerInquiryKakao } from "../../../lib/notifications/kakao";
import {
  normalizeKoreanPhone,
  sendManagerInquirySms,
} from "../../../lib/notifications/sms";
import {
  createServiceClient,
  hasSupabaseServerConfig,
  missingSupabaseEnvironmentVariables,
} from "../../../lib/supabase/admin";

export const runtime = "nodejs";

const SERVICE_MAINTENANCE_MESSAGE =
  "현재 상담 접수 시스템 점검 중입니다.\n잠시 후 다시 시도해주세요.";

type QuoteRequest = {
  name?: unknown;
  phone?: unknown;
  area?: unknown;
  space?: unknown;
  message?: unknown;
  privacyConsent?: unknown;
};

const emailEnvironmentVariables = [
  "RESEND_API_KEY",
  "INQUIRY_EMAIL_RECEIVER",
  "INQUIRY_EMAIL_FROM",
] as const;

const managerSmsEnvironmentVariables = [
  "SOLAPI_API_KEY",
  "SOLAPI_API_SECRET",
  "SOLAPI_SENDER_NUMBER",
  "INQUIRY_SMS_RECEIVER",
] as const;

const customerKakaoEnvironmentVariables = [
  "SOLAPI_API_KEY",
  "SOLAPI_API_SECRET",
  "SOLAPI_SENDER_NUMBER",
  "SOLAPI_KAKAO_PFID",
  "SOLAPI_KAKAO_TEMPLATE_ID",
] as const;

const getMissingEnvironmentVariables = (
  names: readonly string[],
) => names.filter((name) => !process.env[name]?.trim());

const normalizeText = (value: unknown, maxLength: number) =>
  (typeof value === "string" ? value : "").trim().slice(0, maxLength);

const normalizePhone = (value: unknown) =>
  normalizeKoreanPhone(value);

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );

const formatKoreanTime = () =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

const createEmailHtml = ({
  name,
  phone,
  area,
  space,
  message,
  receivedAt,
}: {
  name: string;
  phone: string;
  area: string;
  space: string;
  message: string;
  receivedAt: string;
}) => {
  const rows = [
    ["고객명", name],
    ["연락처", phone],
    ["지역", area || "미입력"],
    ["시공 장소", space || "미입력"],
    ["문의 내용", message || "미입력"],
    ["접수 시간", receivedAt],
  ];

  return `
    <!doctype html>
    <html lang="ko">
      <body style="margin:0;padding:24px;background:#f3f7fc;font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#0a2240;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d9e6f5;border-radius:16px;overflow:hidden;">
          <div style="padding:24px;background:#0a2b4d;color:#ffffff;">
            <div style="font-size:13px;font-weight:700;letter-spacing:.08em;color:#79b7ff;">POGNY FILM</div>
            <h1 style="margin:8px 0 0;font-size:22px;line-height:1.4;">포그니필름 신규 견적 문의</h1>
          </div>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tbody>
              ${rows
                .map(
                  ([label, value]) => `
                    <tr>
                      <th style="width:110px;padding:16px 18px;border-bottom:1px solid #e7eef7;text-align:left;vertical-align:top;font-size:14px;color:#46617d;">${label}</th>
                      <td style="padding:16px 18px;border-bottom:1px solid #e7eef7;font-size:15px;line-height:1.65;white-space:pre-wrap;word-break:break-word;">${escapeHtml(value)}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    if (!hasSupabaseServerConfig) {
      console.error("[quote] Inquiry intake is unavailable due to server configuration.", {
        missingEnvironmentVariables: missingSupabaseEnvironmentVariables,
      });
      return NextResponse.json(
        {
          ok: false,
          code: "SERVICE_UNAVAILABLE",
          message: SERVICE_MAINTENANCE_MESSAGE,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = (await request.json()) as QuoteRequest;
    const name = normalizeText(body.name, 50);
    const phone = normalizePhone(body.phone);
    const area = normalizeText(body.area, 100);
    const space = normalizeText(body.space, 100);
    const message = normalizeText(body.message, 1000);
    const privacyConsent = body.privacyConsent === true;

    if (!name || !/^010\d{8}$/.test(phone) || !privacyConsent) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      console.error(
        "[quote] Supabase configuration passed validation but the service client was not created.",
      );
      return NextResponse.json(
        {
          ok: false,
          code: "SERVICE_UNAVAILABLE",
          message: SERVICE_MAINTENANCE_MESSAGE,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: inquiry, error: insertError } = await supabase
      .from("inquiries")
      .insert({
        customer_name: name,
        phone,
        region: area || null,
        place: space || null,
        message: message || null,
        source: "homepage",
        status: "new",
        manager: null,
      })
      .select("id")
      .single();

    if (insertError || !inquiry) {
      console.error("[quote] Inquiry insert failed:", insertError);
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const receivedAt = formatKoreanTime();
    const smsText = `[포그니필름 신규 상담]

👤 고객명 : ${name}
📞 연락처 : ${phone}
📍 지역 : ${area || "미입력"}
🪟 문의유형 : ${space || "미입력"}

💬 문의내용
${message || "미입력"}

관리자 페이지에서 상세 내용을 확인하세요.`;

    const missingEmailEnvironmentVariables = getMissingEnvironmentVariables(
      emailEnvironmentVariables,
    );
    let emailSent = false;
    if (missingEmailEnvironmentVariables.length) {
      console.error("[quote] Employee email configuration is missing:", {
        inquiryId: inquiry.id,
        missingEnvironmentVariables: missingEmailEnvironmentVariables,
      });
    } else {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const emailResult = await resend.emails.send({
          from: process.env.INQUIRY_EMAIL_FROM!,
          to: [process.env.INQUIRY_EMAIL_RECEIVER!],
          subject: `[포그니필름] ${name}님 신규 견적 문의`,
          html: createEmailHtml({ name, phone, area, space, message, receivedAt }),
        });
        emailSent = !emailResult.error;
        if (emailResult.error) {
          console.error("[quote] Employee email delivery failed:", {
            inquiryId: inquiry.id,
            error: emailResult.error,
          });
        }
      } catch (error) {
        console.error("[quote] Employee email delivery failed:", {
          inquiryId: inquiry.id,
          error,
        });
      }
    }

    const missingManagerSmsEnvironmentVariables =
      getMissingEnvironmentVariables(managerSmsEnvironmentVariables);
    let managerSmsAccepted = false;
    if (missingManagerSmsEnvironmentVariables.length) {
      console.error("[quote] Manager SMS configuration is missing:", {
        inquiryId: inquiry.id,
        missingEnvironmentVariables: missingManagerSmsEnvironmentVariables,
      });
    } else {
      const managerSmsResult = await sendManagerInquirySms({
        config: {
          apiKey: process.env.SOLAPI_API_KEY!,
          apiSecret: process.env.SOLAPI_API_SECRET!,
          senderNumber: process.env.SOLAPI_SENDER_NUMBER!,
        },
        recipientNumber: process.env.INQUIRY_SMS_RECEIVER!,
        text: smsText,
      });
      managerSmsAccepted = managerSmsResult.accepted;
    }

    if (managerSmsAccepted) {
      const { error: smsUpdateError } = await supabase
        .from("inquiries")
        .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
        .eq("id", inquiry.id);
      if (smsUpdateError) {
        console.error("[quote] SMS status update failed:", {
          inquiryId: inquiry.id,
          error: smsUpdateError,
        });
      }
    }

    const missingKakaoEnvironmentVariables = getMissingEnvironmentVariables(
      customerKakaoEnvironmentVariables,
    );
    let customerKakaoAccepted = false;
    if (missingKakaoEnvironmentVariables.length) {
      console.error("[quote] Customer Kakao configuration is missing:", {
        inquiryId: inquiry.id,
        missingEnvironmentVariables: missingKakaoEnvironmentVariables,
      });
    } else {
      const customerKakaoResult = await sendCustomerInquiryKakao({
        config: {
          apiKey: process.env.SOLAPI_API_KEY!,
          apiSecret: process.env.SOLAPI_API_SECRET!,
          senderNumber: process.env.SOLAPI_SENDER_NUMBER!,
          pfId: process.env.SOLAPI_KAKAO_PFID!,
          templateId: process.env.SOLAPI_KAKAO_TEMPLATE_ID!,
        },
        recipientNumber: phone,
        name,
        area,
        inquiryType: space,
      });
      customerKakaoAccepted = customerKakaoResult.accepted;
    }

    return NextResponse.json(
      {
        ok: true,
        inquiryId: inquiry.id,
        notificationSent: emailSent && managerSmsAccepted,
        kakaoAccepted: customerKakaoAccepted,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("[quote] Unexpected error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
