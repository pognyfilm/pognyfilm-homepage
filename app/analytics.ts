export type AnalyticsEventName =
  | "quote_button_click"
  | "quote_submit"
  | "generate_lead"
  | "phone_click"
  | "kakao_click"
  | "youtube_click"
  | "blog_click"
  | "film_recommendation"
  | "chatbot_open"
  | "chatbot_start"
  | "chatbot_step_complete"
  | "chatbot_recommendation_view"
  | "chatbot_lead_click"
  | "chatbot_phone_click";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const trackAnalyticsEvent = (
  eventName: AnalyticsEventName,
  parameters: Record<string, string | number | boolean> = {},
) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_location: window.location.href,
    page_title: document.title,
    ...parameters,
    debug_mode: process.env.NODE_ENV !== "production",
  });
  if (window.location.hostname === "localhost") {
    console.info(`[analytics:test] event ${eventName}`);
  }
};

export const pushQuoteSubmitEvent = () => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "quote_submit",
  });
};
