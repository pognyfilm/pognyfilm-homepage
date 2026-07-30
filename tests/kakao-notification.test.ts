import assert from "node:assert/strict";
import {
  sendCustomerInquiryKakao,
  type KakaoServiceFactory,
} from "../lib/notifications/kakao";

const config = {
  apiKey: "test-key",
  apiSecret: "test-secret",
  senderNumber: "021234567",
  pfId: "test-pfid",
  templateId: "test-template",
};

const successFactory: KakaoServiceFactory = () => ({
  async send(message) {
    assert.equal(message.to, "01012345678");
    assert.equal(message.kakaoOptions.disableSms, true);
    assert.deepEqual(message.kakaoOptions.variables, {
      "#{고객명}": "홍길동",
      "#{지역}": "서울",
      "#{문의유형}": "아파트",
    });
    return {
      groupInfo: { groupId: "test-group" },
      messageList: [
        {
          statusCode: "2000",
          statusMessage: "Success",
          messageId: "test-message",
        },
      ],
    };
  },
});

const failureFactory: KakaoServiceFactory = () => ({
  async send() {
    throw {
      status: 400,
      errorCode: "TEST_FAILURE",
      errorMessage: "Rejected by test provider",
    };
  },
});

const input = {
  config,
  recipientNumber: "010-1234-5678",
  name: "홍길동",
  area: "서울",
  inquiryType: "아파트",
};

const run = async () => {
  const success = await sendCustomerInquiryKakao(input, successFactory);
  assert.equal(success.accepted, true);
  assert.equal(success.providerCode, "2000");
  assert.equal(success.requestId, "test-message");

  const failure = await sendCustomerInquiryKakao(input, failureFactory);
  assert.equal(failure.accepted, false);
  assert.equal(failure.httpStatus, 400);
  assert.equal(failure.providerCode, "TEST_FAILURE");
  assert.equal(failure.failureStage, "provider_request");

  console.info("Kakao notification success/failure tests passed.");
};

void run();
