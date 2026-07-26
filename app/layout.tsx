import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포그니필름",
  description: "포그니필름 Next.js 마이그레이션 기본 프로젝트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
