"use client";

import { useEffect } from "react";
import type { Warranty } from "../../lib/warranty/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

export default function WarrantyPrintDocument({ item }: { item: Warranty }) {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const rows = [
    ["품질보증번호", item.warranty_number],
    ["고객명", item.customer_name],
    ["연락처", item.phone],
    ["시공지역", item.region],
    ["시공장소", item.place],
    ["시공일", formatDate(`${item.installation_date}T00:00:00+09:00`)],
    ["제품명", item.product_name],
    ["보증기간", item.warranty_period],
    ["시공담당자", item.installer],
    ["발급일", formatDate(item.created_at)],
  ];

  return (
    <section className="warranty-print-screen">
      <div className="warranty-print-actions">
        <button type="button" onClick={() => window.print()}>PDF 출력</button>
        <button type="button" onClick={() => window.close()}>닫기</button>
      </div>

      <article className="warranty-print-page" aria-label="포그니필름 품질보증서">
        <header className="warranty-print-header">
          <img src="/assets/pogny-logo.png" alt="포그니필름" />
          <div>
            <span>QUALITY WARRANTY</span>
            <h1>품질보증서</h1>
            <p>POGNY FILM QUALITY ASSURANCE</p>
          </div>
        </header>

        <div className="warranty-print-number">
          <span>WARRANTY NO.</span>
          <strong>{item.warranty_number}</strong>
        </div>

        <p className="warranty-print-intro">
          포그니필름은 아래 시공 내역에 대하여 명시된 기간 동안 품질을 보증합니다.
        </p>

        <dl className="warranty-print-details">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <footer className="warranty-print-footer">
          <div>
            <span>POGNY FILM</span>
            <p>창문필름 전문기업 포그니필름</p>
            <p>대표전화 1833-4236</p>
          </div>
          <div className="warranty-print-seal">
            <span>POGNY</span>
            <strong>품질보증</strong>
          </div>
        </footer>
      </article>
    </section>
  );
}
