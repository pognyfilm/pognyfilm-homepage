import { SolapiMessageService } from "solapi";

export type SmsRecipient = "manager";

export type SmsSendResult = {
  accepted: boolean;
  httpStatus: number | null;
  providerCode: string | null;
  providerMessage: string;
  requestId: string | null;
  recipientMasked: string;
  failureStage: string | null;
};

type SmsConfig = {
  apiKey: string;
  apiSecret: string;
  senderNumber: string;
};

type SendSmsInput = {
  config: SmsConfig;
  recipient: SmsRecipient;
  recipientNumber: string;
  text: string;
};

export const normalizeKoreanPhone = (value: unknown) => {
  const digits = (typeof value === "string" ? value : "").replace(/\D/g, "");
  if (digits.startsWith("82")) {
    return `0${digits.slice(2)}`;
  }
  return digits;
};

export const maskPhone = (value: string) => {
  const digits = normalizeKoreanPhone(value);
  if (digits.length < 7) return "***";
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
};

const isValidRecipient = (value: string) => /^01\d{8,9}$/.test(value);
const isValidSender = (value: string) => /^0\d{8,10}$/.test(value);

const getErrorDetails = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return {
      httpStatus: null,
      providerCode: null,
      providerMessage: String(error),
    };
  }

  const record = error as Record<string, unknown>;
  const nestedResponse =
    record.response && typeof record.response === "object"
      ? (record.response as Record<string, unknown>)
      : null;
  const nestedData =
    nestedResponse?.data && typeof nestedResponse.data === "object"
      ? (nestedResponse.data as Record<string, unknown>)
      : null;

  const rawHttpStatus =
    record.status ?? record.statusCode ?? nestedResponse?.status ?? null;
  const httpStatus =
    typeof rawHttpStatus === "number"
      ? rawHttpStatus
      : typeof rawHttpStatus === "string" && /^\d{3}$/.test(rawHttpStatus)
        ? Number(rawHttpStatus)
        : null;
  const rawCode =
    record.errorCode ?? record.code ?? nestedData?.errorCode ?? null;
  const rawMessage =
    record.errorMessage ??
    record.message ??
    nestedData?.errorMessage ??
    "Unknown SMS provider error";

  return {
    httpStatus,
    providerCode: rawCode == null ? null : String(rawCode),
    providerMessage: String(rawMessage),
  };
};

const logSmsResult = (recipient: SmsRecipient, result: SmsSendResult) => {
  const payload = {
    httpStatus: result.httpStatus,
    providerCode: result.providerCode,
    providerMessage: result.providerMessage,
    requestId: result.requestId,
    recipient: result.recipientMasked,
    failureStage: result.failureStage,
  };

  if (result.accepted) {
    console.info(`[sms:${recipient}] Provider accepted message request:`, payload);
  } else {
    console.error(`[sms:${recipient}] Message delivery request failed:`, payload);
  }
};

export const sendSms = async ({
  config,
  recipient,
  recipientNumber,
  text,
}: SendSmsInput): Promise<SmsSendResult> => {
  const to = normalizeKoreanPhone(recipientNumber);
  const from = normalizeKoreanPhone(config.senderNumber);
  const recipientMasked = maskPhone(to);

  if (!isValidRecipient(to) || !isValidSender(from)) {
    const result: SmsSendResult = {
      accepted: false,
      httpStatus: null,
      providerCode: "INVALID_PHONE_FORMAT",
      providerMessage: "Recipient or sender number is not a valid Korean number.",
      requestId: null,
      recipientMasked,
      failureStage: "validation",
    };
    logSmsResult(recipient, result);
    return result;
  }

  try {
    const service = new SolapiMessageService(
      config.apiKey,
      config.apiSecret,
    );
    const response = await service.send(
      { to, from, text },
      { showMessageList: true },
    );
    const messages = response.messageList ?? [];
    const firstMessage = messages[0];
    const accepted =
      messages.length > 0 &&
      messages.every((message) => message.statusCode === "2000");
    const result: SmsSendResult = {
      accepted,
      // The SDK resolves only for a successful provider HTTP response and does
      // not expose the raw response object.
      httpStatus: 200,
      providerCode: firstMessage?.statusCode ?? null,
      providerMessage:
        firstMessage?.statusMessage ??
        "Provider response did not include a message result.",
      requestId:
        firstMessage?.messageId ?? response.groupInfo.groupId ?? null,
      recipientMasked,
      failureStage: accepted ? null : "provider_response",
    };
    logSmsResult(recipient, result);
    return result;
  } catch (error) {
    const details = getErrorDetails(error);
    const result: SmsSendResult = {
      accepted: false,
      ...details,
      requestId: null,
      recipientMasked,
      failureStage: "provider_request",
    };
    logSmsResult(recipient, result);
    return result;
  }
};

export const sendManagerInquirySms = (
  input: Omit<SendSmsInput, "recipient">,
) => sendSms({ ...input, recipient: "manager" });
