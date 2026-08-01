"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "../app/analytics";

const isKakaoConsultationLink = (link: HTMLAnchorElement) =>
  link.href.includes("pf.kakao.com") ||
  link.matches(".quick-kakao, [data-kakao-consultation]");

export default function GoogleTagManagerEvents() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a");
      if (!link) return;

      if (link.href.startsWith("tel:")) {
        trackAnalyticsEvent("phone_click", { link_url: link.href });
        return;
      }

      if (isKakaoConsultationLink(link)) {
        trackAnalyticsEvent("kakao_click", { link_url: link.href });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
