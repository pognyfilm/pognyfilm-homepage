import type { Metadata } from "next";
import WarrantyLookupClient from "../../components/warranty/WarrantyLookupClient";
import styles from "./WarrantyPage.module.css";

export const metadata: Metadata = {
  title: "품질보증서 조회 | 포그니필름",
  description:
    "고객명과 연락처로 포그니필름 품질보증서를 안전하게 조회하고 PDF로 저장할 수 있습니다.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const principles = [
  {
    title: "정품 제품 확인",
    description:
      "등록된 PG FILM Series 제품과 시공 정보를 공식 문서로 확인할 수 있습니다.",
  },
  {
    title: "본사 직영 시공 이력",
    description:
      "외주·하청이 아닌 본사 직영 시공 정보를 기반으로 품질보증서를 제공합니다.",
  },
  {
    title: "제품별 보증기간 확인",
    description:
      "적용 제품과 시공 조건에 따라 정확한 보증기간을 확인할 수 있습니다.",
  },
  {
    title: "언제든 안전하게 재조회",
    description:
      "시공 완료 후에도 등록된 정보가 일치하면 품질보증서를 다시 확인할 수 있습니다.",
  },
];

export default function WarrantyPage() {
  return (
    <div className={styles.systemPage}>
      <header className={styles.systemHeader}>
        <div className={styles.headerInner}>
          <a className={styles.systemBrand} href="/" aria-label="포그니필름 홈페이지">
            <img src="/assets/pogny-logo.png" alt="포그니필름" />
          </a>
          <nav className={styles.systemNav} aria-label="품질보증서 메뉴">
            <a className={styles.systemCurrent} href="/warranty" aria-current="page">
              품질보증서
            </a>
          </nav>
          <a
            className={styles.systemPhone}
            href="tel:18334236"
            aria-label="상담 및 조회 문의 1833-4236"
          >
            <span className={styles.phoneIcon} aria-hidden="true">☎</span>
            <span className={styles.phoneCopy}>
              <small>상담 및 조회 문의</small>
              <strong>1833-4236</strong>
            </span>
          </a>
        </div>
      </header>

      <main className={styles.systemMain}>
        <section className={styles.lookupMain} aria-labelledby="warranty-main-title">
          <div className={styles.lookupIntro}>
            <span className={styles.officialBadge}>OFFICIAL WARRANTY SERVICE</span>
            <h1 id="warranty-main-title">
              <span>PG FILM Series</span>
              공식 품질보증서 조회
            </h1>
            <p>
              시공 당시 등록된 고객명과 연락처를 입력하면<br />
              발급된 품질보증서와 보증 정보를 확인할 수 있습니다.
            </p>
          </div>
          <WarrantyLookupClient />
        </section>

        <section className={styles.serviceOverview} aria-labelledby="warranty-service-title">
          <div className={styles.serviceCopy}>
            <h2 id="warranty-service-title">PG FILM Series 정품 보증</h2>
            <p>
              포그니필름은 시공 제품과 고객 정보를 등록하고<br />
              제품별 보증 기준에 따라 공식 품질보증서를 제공합니다.
            </p>
          </div>
          <dl className={styles.serviceStats} aria-label="포그니필름 품질보증 주요 수치">
            <div>
              <dt>최대 15년</dt>
              <dd>제품별 품질보증</dd>
            </div>
            <div>
              <dt>10,000건+</dt>
              <dd>누적 시공 경험</dd>
            </div>
            <div>
              <dt>100%</dt>
              <dd>본사 직영 시공</dd>
            </div>
          </dl>
        </section>

        <section className={styles.guidanceSection} aria-labelledby="warranty-principles-title">
          <div className={styles.principlesHeader}>
            <h2 id="warranty-principles-title">포그니필름 품질보증 원칙</h2>
          </div>
          <div className={styles.principlesList}>
            {principles.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>

          <aside className={styles.infoBox} aria-labelledby="warranty-info-title">
            <span className={styles.infoIcon} aria-hidden="true">i</span>
            <div>
              <h2 id="warranty-info-title">조회 전 확인해주세요</h2>
              <ul>
                <li>시공 당시 등록한 고객명과 연락처를 입력해주세요.</li>
                <li>연락처는 하이픈 없이 입력해도 조회할 수 있습니다.</li>
                <li>보증기간과 보증 범위는 제품 및 시공 조건에 따라 다릅니다.</li>
                <li>조회가 계속되지 않을 경우 고객센터로 문의해주세요.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section className={styles.supportBar} aria-labelledby="warranty-support-title">
          <div>
            <h2 id="warranty-support-title">품질보증서 조회가 어려우신가요?</h2>
            <p>포그니필름 고객센터에서 확인을 도와드립니다.</p>
          </div>
          <div className={styles.supportActions}>
            <a
              className={styles.supportPhone}
              href="tel:18334236"
              aria-label="전화 상담 1833-4236"
            >
              <span>상담 문의</span>
              <strong>1833-4236</strong>
            </a>
            <a
              className={styles.supportKakao}
              href="https://pf.kakao.com/_aYxmxmG/chat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="카카오톡으로 품질보증서 상담하기"
            >
              카카오톡 상담
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
