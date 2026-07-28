import type { Metadata } from "next";
import Script from "next/script";
import GoogleAnalytics from "../components/GoogleAnalytics";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-22MMZD6XVR";
const CLARITY_PROJECT_ID = "xsrswb4u08";
const siteTitle = "포그니필름 | 프리미엄 단열필름 전문 브랜드";
const siteDescription =
  "열차단, 자외선 차단, 눈부심 완화, 주간 사생활 보호까지. 전문 시공과 품질보증을 제공하는 포그니필름입니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://pogny.co.kr"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://pogny.co.kr",
    siteName: "포그니필름",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/assets/pogny-og.png",
        width: 1200,
        height: 630,
        alt: "포그니필름 프리미엄 단열필름 전문 브랜드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/assets/pogny-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
      </head>
      <body>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        {children}
      </body>
    </html>
  );
}
