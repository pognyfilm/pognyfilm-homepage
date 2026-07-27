export type AnalyticsEventName =
  | "quote_button_click"
  | "generate_lead"
  | "phone_click"
  | "kakao_click"
  | "youtube_click"
  | "blog_click"
  | "film_recommendation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackAnalyticsEvent = (
  eventName: AnalyticsEventName,
  parameters: Record<string, string | number | boolean> = {},
) => {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventName, {
    page_location: window.location.href,
    page_title: document.title,
    ...parameters,
    debug_mode: process.env.NODE_ENV !== "production",
  });
};
