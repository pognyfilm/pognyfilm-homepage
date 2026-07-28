import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "관리자 | 포그니필름",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
