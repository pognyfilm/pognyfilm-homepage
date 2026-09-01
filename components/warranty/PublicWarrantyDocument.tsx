"use client";

import { useEffect } from "react";
import type { Warranty } from "../../lib/warranty/types";
import styles from "../../app/warranty/WarrantyPage.module.css";
import WarrantyCertificate from "./WarrantyCertificate";

export default function PublicWarrantyDocument({
  item,
  autoPrint,
}: {
  item: Warranty;
  autoPrint: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 500);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <main className={styles.documentShell}>
      <div className={styles.documentActions}>
        <button type="button" onClick={() => window.print()}>
          PDF 다운로드
        </button>
        <a href="/warranty">조회 페이지</a>
      </div>
      <WarrantyCertificate item={item} isPublic />
    </main>
  );
}
