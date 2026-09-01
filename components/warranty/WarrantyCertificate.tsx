import type { Warranty } from "../../lib/warranty/types";
import { maskCustomerName } from "../../lib/warranty/client-mask";
import { POGNY_COMPANY, WARRANTY_NOTICES } from "../../lib/warranty/certificate";
import styles from "./WarrantyCertificate.module.css";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatArea = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? "—"
    : `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value)}㎡`;

export default function WarrantyCertificate({
  item,
  isPublic = false,
}: {
  item: Warranty;
  isPublic?: boolean;
}) {
  return (
    <article className={styles.certificate} aria-label="포그니필름 품질보증서">
      <div className={styles.topRibbon} aria-hidden="true">
        <span />
      </div>

      <header className={styles.header}>
        <div className={styles.emblem}>
          <img src="/assets/pogny-warranty-emblem.png" alt="포그니필름" />
        </div>
        <p>QUALITY WARRANTY</p>
        <h1>품질보증서</h1>
        <span>POGNY FILM QUALITY ASSURANCE</span>
      </header>

      <div className={styles.body}>
        <div className={styles.warrantyNumber}>
          <span>WARRANTY NO.</span>
          <strong>{item.warranty_number}</strong>
        </div>

        <section className={styles.partyTable} aria-label="고객 및 시공사 정보">
          <div className={styles.partyLabel}><strong>고 객</strong><span aria-hidden="true">◇</span></div>
          <dl>
            <div><dt>성명</dt><dd>{isPublic ? maskCustomerName(item.customer_name) : item.customer_name}</dd></div>
            <div><dt>전화번호</dt><dd>{isPublic ? "비공개" : item.phone}</dd></div>
            <div><dt>시공지역</dt><dd>{item.region}</dd></div>
            <div><dt>시공장소</dt><dd>{item.place}</dd></div>
          </dl>
          <div className={styles.partyLabel}><strong>시공사</strong><span aria-hidden="true">◇</span></div>
          <dl>
            <div><dt>상호명</dt><dd>{POGNY_COMPANY.name}</dd></div>
            <div><dt>대표전화</dt><dd>{POGNY_COMPANY.phone}</dd></div>
            <div><dt>주소</dt><dd>{POGNY_COMPANY.address}</dd></div>
          </dl>
        </section>

        <dl className={styles.installationTable}>
          <div><dt>시공일자</dt><dd>{formatDate(`${item.installation_date}T00:00:00+09:00`)}</dd></div>
          <div><dt>보증기간</dt><dd>{item.warranty_period}</dd></div>
          <div><dt>제품명</dt><dd>{item.product_name}</dd></div>
          <div><dt>시공면적</dt><dd>{formatArea(item.installation_area)}</dd></div>
          <div><dt>시공담당자</dt><dd>{item.installer || "포그니필름 본사 직영팀"}</dd></div>
          <div><dt>발급일</dt><dd>{formatDate(item.created_at)}</dd></div>
        </dl>

        <section className={styles.notice}>
          <h2>※ 품질보증 및 취급주의사항</h2>
          <p>
            포그니필름은 본사가 공인한 대리점을 통하여 POGNY Window Film을 구입·시공한
            고객의 이익 보호를 위해 다음과 같이 품질을 보증합니다.
          </p>
          <ol>
            {WARRANTY_NOTICES.map((notice) => <li key={notice}>{notice}</li>)}
          </ol>
        </section>

        <div className={styles.signature}>
          <div className={styles.companySign}>
            <strong>{POGNY_COMPANY.name}</strong>
            <span>대표 {POGNY_COMPANY.representative}</span>
          </div>
          <div className={styles.seal}>
            <img src="/assets/pogny-company-seal.png" alt="포그니필름 직인" />
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <strong>POGNY FILM</strong><i />
        <span>{POGNY_COMPANY.address}</span><i />
        <span>TEL {POGNY_COMPANY.phone}</span>
      </footer>
    </article>
  );
}
