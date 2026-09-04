import type { Metadata } from "next";
import Script from "next/script";
import GoogleTagManagerEvents from "../components/GoogleTagManagerEvents";
import "./globals.css";

const GTM_CONTAINER_ID = "GTM-WQ6VN9VQ";
const CLARITY_PROJECT_ID = "xsrswb4u08";
const SMARTLOG_ACCOUNT = "UHPT-78623";
const SMARTLOG_SERVER = "a78";
const siteTitle = "단열필름 전문 브랜드 | 포그니필름";
const siteDescription =
  "NSN 스퍼터링 기술로 검증된 열차단 성능, 측정 장비를 통한 실시간 현장 확인, 정품 품질보증서 발급 및 공식 홈페이지 조회 서비스, 본사 직영 시공팀의 무제한 책임 시공제를 제공합니다.";

export const metadata: Metadata = {
  metadataBase: new URL("https://pogny.co.kr"),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`,
          }}
        />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>
        <script
          id="smartlog-config"
          dangerouslySetInnerHTML={{
            __html: `window.hpt_info={_account:"${SMARTLOG_ACCOUNT}",_server:"${SMARTLOG_SERVER}"};`,
          }}
        />
        <Script
          id="smartlog-core"
          src="https://cdn.smlog.co.kr/core/smart.js"
          strategy="beforeInteractive"
          charSet="utf-8"
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <noscript>
          <img
            src="https://a78.smlog.co.kr/smart_bda.php?_account=78623"
            alt=""
            width={0}
            height={0}
            style={{ display: "none", width: 0, height: 0 }}
          />
        </noscript>
        <GoogleTagManagerEvents />
        {children}
      </body>
    </html>
  );
}
