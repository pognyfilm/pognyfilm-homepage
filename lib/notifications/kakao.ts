import { SolapiMessageService } from "solapi";
import { maskPhone, normalizeKoreanPhone } from "./sms";

export type KakaoSendResult = {
  accepted: boolean;
  httpStatus: number | null;
  providerCode: string | null;
  providerMessage: string;
  requestId: string | null;
  recipientMasked: string;
  failureStage: string | null;
};

type KakaoConfig = {
  apiKey: string;
  apiSecret: string;
  senderNumber: string;
  pfId: string;
  templateId: string;
};

type CustomerInquiryKakaoInput = {
  config: KakaoConfig;
  recipientNumber: string;
  name: string;
  area: string;
  inquiryType: string;
};

type KakaoProviderResponse = {
  readonly messageList?: readonly {
    readonly statusCode?: string;
    readonly statusMessage?: string;
    readonly messageId?: string;
  }[];
  readonly groupInfo: {
    readonly groupId?: string;
  };
};

type KakaoMessageService = {
  send: (
    message: {
      to: string;
      from: string;
      kakaoOptions: {
        pfId: string;
        templateId: string;
        variables: Record<string, string>;
        disableSms: boolean;
      };
    },
    options: { showMessageList: boolean },
  ) => Promise<KakaoProviderResponse>;
};

export type KakaoServiceFactory = (
  apiKey: string,
  apiSecret: string,
) => KakaoMessageService;

const defaultServiceFactory: KakaoServiceFactory = (apiKey, apiSecret) =>
  new SolapiMessageService(apiKey, apiSecret);

const getErrorDetails = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return {
      httpStatus: null,
      providerCode: null,
      providerMessage: String(error),
    };
  }

  const record = error as Record<string, unknown>;
  const response =
    record.response && typeof record.response === "object"
      ? (record.response as Record<string, unknown>)
      : null;
  const data =
    response?.data && typeof response.data === "object"
      ? (response.data as Record<string, unknown>)
      : null;
  const rawStatus = record.status ?? record.statusCode ?? response?.status;
  const httpStatus =
    typeof rawStatus === "number"
      ? rawStatus
      : typeof rawStatus === "string" && /^\d{3}$/.test(rawStatus)
        ? Number(rawStatus)
        : null;
  const rawCode = record.errorCode ?? record.code ?? data?.errorCode ?? null;
  const rawMessage =
    record.errorMessage ??
    record.message ??
    data?.errorMessage ??
    "Unknown Kakao provider error";

  return {
    httpStatus,
    providerCode: rawCode == null ? null : String(rawCode),
    providerMessage: String(rawMessage),
  };
};

const logKakaoResult = (result: KakaoSendResult) => {
  const payload = {
    httpStatus: result.httpStatus,
    providerCode: result.providerCode,
    providerMessage: result.providerMessage,
    requestId: result.requestId,
    recipient: result.recipientMasked,
    failureStage: result.failureStage,
  };

  if (result.accepted) {
    console.info("[kakao:customer] Provider accepted message request:", payload);
  } else {
    console.error("[kakao:customer] Message delivery request failed:", payload);
  }
};

export const sendCustomerInquiryKakao = async (
  {
    config,
    recipientNumber,
    name,
    area,
    inquiryType,
  }: CustomerInquiryKakaoInput,
  serviceFactory: KakaoServiceFactory = defaultServiceFactory,
): Promise<KakaoSendResult> => {
  const to = normalizeKoreanPhone(recipientNumber);
  const from = normalizeKoreanPhone(config.senderNumber);
  const recipientMasked = maskPhone(to);

  if (!/^010\d{8}$/.test(to) || !/^0\d{8,10}$/.test(from)) {
    const result: KakaoSendResult = {
      accepted: false,
      httpStatus: null,
      providerCode: "INVALID_PHONE_FORMAT",
      providerMessage: "Recipient or sender number is not a valid Korean number.",
      requestId: null,
      recipientMasked,
      failureStage: "validation",
    };
    logKakaoResult(result);
    return result;
  }

  try {
    const service = serviceFactory(config.apiKey, config.apiSecret);
    const response = await service.send(
      {
        to,
        from,
        kakaoOptions: {
          pfId: config.pfId,
          templateId: config.templateId,
          variables: {
            "#{고객명}": name,
            "#{지역}": area || "미입력",
            "#{문의유형}": inquiryType || "미입력",
          },
          // Customer SMS fallback is not part of this phase.
          disableSms: true,
        },
      },
      { showMessageList: true },
    );
    const messages = response.messageList ?? [];
    const firstMessage = messages[0];
    const accepted =
      messages.length > 0 &&
      messages.every((message) => message.statusCode === "2000");
    const result: KakaoSendResult = {
      accepted,
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
    logKakaoResult(result);
    return result;
  } catch (error) {
    const details = getErrorDetails(error);
    const result: KakaoSendResult = {
      accepted: false,
      ...details,
      requestId: null,
      recipientMasked,
      failureStage: "provider_request",
    };
    logKakaoResult(result);
    return result;
  }
};
