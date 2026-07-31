"use client";

import { useEffect } from "react";
import type { Warranty } from "../../lib/warranty/types";
import { maskCustomerName } from "../../lib/warranty/client-mask";
import styles from "../../app/warranty/WarrantyPage.module.css";

const formatDate = (value: string, includeTime = false) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));

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

  const rows = [
    ["품질보증번호", item.warranty_number],
    ["고객명", maskCustomerName(item.customer_name)],
    ["시공지역", item.region],
    ["시공장소", item.place],
    ["시공일", formatDate(`${item.installation_date}T00:00:00+09:00`)],
    ["제품명", item.product_name],
    ["보증기간", item.warranty_period],
    ["시공담당자", item.installer || "포그니필름 본사 직영팀"],
    ["보증상태", "발급 완료"],
    ["발급일", formatDate(item.created_at, true)],
  ];

  return (
    <main className={styles.documentShell}>
      <div className={styles.documentActions}>
        <button type="button" onClick={() => window.print()}>
          PDF 다운로드
        </button>
        <a href="/warranty">조회 페이지</a>
      </div>
      <article className={styles.documentPage} aria-label="포그니필름 품질보증서">
        <header className={styles.documentHeader}>
          <img src="/assets/pogny-logo.png" alt="포그니필름" />
          <div className={styles.documentTitle}>
            <span>QUALITY WARRANTY</span>
            <h1>품질보증서</h1>
            <p>POGNY FILM QUALITY ASSURANCE</p>
          </div>
        </header>
        <div className={styles.documentNumber}>
          <span>WARRANTY NO.</span>
          <strong>{item.warranty_number}</strong>
        </div>
        <p className={styles.documentIntro}>
          포그니필름은 아래 시공 내역에 대하여 명시된 기간 동안 품질을
          보증합니다.
        </p>
        <dl className={styles.documentDetails}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <footer className={styles.documentFooter}>
          <div>
            <strong>POGNY FILM</strong>
            <p>창문필름 전문기업 포그니필름</p>
            <p>대표전화 1833-4236</p>
          </div>
          <div className={styles.seal}>POGNY<br />품질보증</div>
        </footer>
      </article>
    </main>
  );
}
