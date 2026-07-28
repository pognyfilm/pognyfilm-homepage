"use client";

import { useEffect } from "react";

const CONSENT_STORAGE_KEY = "pogny_analytics_consent";

export default function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string;
}) {
  useEffect(() => {
    if (!measurementId) {
      console.warn("[analytics] GA4 measurement ID is missing.");
      return;
    }

    if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
      console.warn(
        `[analytics] GA4 measurement ID has an invalid format: ${measurementId}`,
      );
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

    const isLocalDiagnostic = window.location.hostname === "localhost";
    window.updateAnalyticsConsent = (granted: boolean) => {
      window.gtag?.("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
      try {
        window.localStorage.setItem(
          CONSENT_STORAGE_KEY,
          granted ? "granted" : "denied",
        );
      } catch (error) {
        console.warn(
          "[analytics] Consent preference could not be persisted.",
          error,
        );
      }
    };

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    try {
      if (window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted") {
        window.updateAnalyticsConsent(true);
      }
    } catch (error) {
      console.warn("[analytics] Consent preference could not be read.", error);
    }
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: true,
      debug_mode: process.env.NODE_ENV !== "production",
    });

    const scriptSelector = `script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`;
    if (!document.querySelector(scriptSelector)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.dataset.pognyGa4 = measurementId;
      script.addEventListener("load", () => {
        if (isLocalDiagnostic) {
          console.info(`[analytics:test] gtag.js loaded ${measurementId}`);
        }
      });
      script.addEventListener("error", () => {
        console.warn(
          `[analytics] gtag.js failed to load for measurement ID ${measurementId}.`,
        );
      });
      document.head.appendChild(script);
    }

    if (isLocalDiagnostic) {
      console.info(
        `[analytics:test] initialized ${measurementId} queue=${window.dataLayer.length}`,
      );
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes("/g/collect")) {
            console.info(`[analytics:test] collect ${entry.name}`);
          }
        }
      });
      observer.observe({ type: "resource", buffered: true });
      return () => observer.disconnect();
    }
  }, [measurementId]);

  return null;
}
