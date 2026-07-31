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

export default function WarrantyPage() {
  const trustItems = [
    { icon: "15Y", label: "최대 15년 품질보증" },
    { icon: "10K", label: "10,000건 이상의 시공 경험" },
    { icon: "PG", label: "정품 PG FILM Series 사용" },
    { icon: "SEC", label: "고객 정보 안전 보호" },
  ];
  const values = [
    {
      icon: "01",
      title: "정품 시공의 확실한 증명",
      description: "등록된 시공 정보와 제품 내역을 공식 품질보증서로 투명하게 확인할 수 있습니다.",
    },
    {
      icon: "02",
      title: "제품별 최대 15년 품질보증",
      description: "적용 제품과 보증 기준에 따라 최대 15년까지 품질보증을 제공합니다.",
    },
    {
      icon: "03",
      title: "본사 직영 전문 시공",
      description: "외주·하청이 아닌 본사 직영 시공팀이 상담부터 시공, 사후관리까지 책임집니다.",
    },
    {
      icon: "04",
      title: "언제든 다시 확인 가능",
      description: "시공이 끝난 후에도 고객명과 연락처로 보증 정보를 안전하게 다시 확인할 수 있습니다.",
    },
  ];
  const steps = [
    ["01", "고객 정보 입력", "시공 당시 등록한 고객명을 입력합니다."],
    ["02", "연락처 입력", "시공 당시 등록한 연락처를 입력합니다."],
    ["03", "보증서 조회", "등록 정보가 일치하면 보증서를 확인합니다."],
    ["04", "미리보기 및 저장", "품질보증서를 확인하고 필요 시 PDF로 저장합니다."],
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerSpacer} aria-hidden="true" />
        <nav className={styles.headerNav} aria-label="품질보증서 메뉴">
          <a className={styles.brandLink} href="/" aria-label="포그니필름 홈페이지">
            <img src="/favicon-32x32.png" alt="" />
            <strong>포그니필름</strong>
          </a>
          <span className={styles.navDivider} aria-hidden="true" />
          <a className={styles.currentLink} href="/warranty" aria-current="page">
            품질보증서
          </a>
        </nav>
        <a className={styles.headerCall} href="tel:18334236">
          <span>무료 방문 실측</span>
          <strong>1833-4236</strong>
        </a>
      </header>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.heroSupport}>SUPPORT</span>
              <p>PG FILM Series</p>
              <h1>품질보증서 조회</h1>
              <span className={styles.heroDescription}>
                포그니필름은 정품 PG FILM Series와
                <br />
                본사 직영 전문 시공을 기반으로
                <br />
                제품별 최대 15년 품질보증을 제공합니다.
              </span>
              <div className={styles.heroTrust} aria-label="포그니필름 품질보증 신뢰 지표">
                {trustItems.map((item) => (
                  <article key={item.label}>
                    <span>{item.icon}</span>
                    <strong>{item.label}</strong>
                  </article>
                ))}
              </div>
            </div>
            <div className={styles.heroVisual} aria-label="포그니필름 품질보증서 인증 비주얼">
              <div className={styles.certificateBack} aria-hidden="true" />
              <article className={styles.certificate}>
                <header>
                  <img src="/favicon-32x32.png" alt="" />
                  <span>POGNY FILM</span>
                </header>
                <p>QUALITY WARRANTY</p>
                <h2>품질보증서</h2>
                <div className={styles.certificateLine} />
                <dl>
                  <div><dt>WARRANTY</dt><dd>PG FILM SERIES</dd></div>
                  <div><dt>PRODUCT</dt><dd>GENUINE FILM</dd></div>
                  <div><dt>SERVICE</dt><dd>DIRECT TEAM</dd></div>
                </dl>
                <strong>15 YEAR</strong>
              </article>
            </div>
          </div>
        </section>

        <div className={styles.lookupFloat}>
          <WarrantyLookupClient />
        </div>

        <section className={styles.valueSection} aria-labelledby="warranty-value-title">
          <div className={styles.sectionHeading}>
            <p>POGNY WARRANTY</p>
            <h2 id="warranty-value-title">PG FILM Series 품질보증의 가치</h2>
            <span>제품의 성능부터 시공 이후의 책임까지, 포그니필름의 기준을 확인하세요.</span>
          </div>
          <div className={styles.valueGrid}>
            {values.map((value) => (
              <article key={value.title} className={styles.valueCard}>
                <span>{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.stepsSection} aria-labelledby="warranty-steps-title">
          <div className={styles.sectionHeading}>
            <p>HOW TO CHECK</p>
            <h2 id="warranty-steps-title">품질보증 조회 방법</h2>
          </div>
          <ol className={styles.steps}>
            {steps.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.informationGrid} aria-label="품질보증서 안내 및 고객센터">
          <article className={styles.noticeCard}>
            <p>INFORMATION</p>
            <h2>안내사항</h2>
            <ul>
              <li>시공 시 등록된 고객명과 연락처를 정확히 입력해주세요.</li>
              <li>조회되지 않을 경우 입력 정보를 다시 확인해주세요.</li>
              <li>계속 조회되지 않을 경우 고객센터로 문의해주세요.</li>
              <li>보증기간과 보증 범위는 제품 및 시공 조건에 따라 다를 수 있습니다.</li>
              <li>품질보증서 내용은 임의로 변경할 수 없습니다.</li>
            </ul>
          </article>
          <article className={styles.customerCard} aria-labelledby="warranty-support-title">
            <p>CONTACT CENTER</p>
            <h2 id="warranty-support-title">고객센터</h2>
            <a className={styles.customerPhone} href="tel:18334236">1833-4236</a>
            <span>평일 09:00 - 18:00<br />주말 및 공휴일 휴무</span>
            <div className={styles.customerActions}>
              <a className={styles.phoneButton} href="tel:18334236">전화 상담</a>
              <a
                className={styles.kakaoButton}
                href="https://pf.kakao.com/_aYxmxmG/chat"
                target="_blank"
                rel="noopener noreferrer"
              >
                카카오톡 상담
              </a>
            </div>
          </article>
        </section>

        <section className={styles.closingBanner}>
          <div>
            <p>POGNY FILM QUALITY PROMISE</p>
            <h2>최대 15년 품질보증<br />10,000건 이상의 시공 경험</h2>
            <span>
              포그니필름은 PG FILM Series의 제품 공급부터
              본사 직영 시공과 사후관리까지 책임지는 윈도우필름 전문 브랜드입니다.
            </span>
          </div>
          <div className={styles.closingStats}>
            <article><strong>15년</strong><span>최대 품질보증</span></article>
            <article><strong>10,000+</strong><span>누적 시공 경험</span></article>
            <article><strong>100%</strong><span>본사 직영 시공</span></article>
          </div>
        </section>
      </main>
    </div>
  );
}
