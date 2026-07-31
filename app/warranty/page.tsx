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
    { icon: "10K", label: "10,000건 이상 시공 경험" },
    { icon: "PG", label: "정품 필름 사용" },
    { icon: "SEC", label: "고객 정보 안전 보호" },
  ];
  const values = [
    {
      icon: "01",
      title: "정품 필름 사용 보증",
      description: "PG FILM Series 정품 필름만을 사용하여 시공되었음을 보증합니다.",
    },
    {
      icon: "02",
      title: "전문 시공 품질 보증",
      description: "전문 시공팀의 표준 시공으로 완성도 높은 품질을 보증합니다.",
    },
    {
      icon: "03",
      title: "최대 15년 품질보증",
      description: "제품별 보증 기간 동안 안심하고 사용하실 수 있습니다.",
    },
    {
      icon: "04",
      title: "공식 보증서 제공",
      description: "공식 품질보증서로 시공 이력과 제품 정보를 신뢰할 수 있습니다.",
    },
  ];
  const steps = [
    ["01", "고객명 입력", "시공 시 등록한 고객명을 정확히 입력합니다."],
    ["02", "연락처 입력", "등록된 휴대전화 번호를 숫자로 입력합니다."],
    ["03", "조회하기", "입력 정보와 등록된 보증 정보를 안전하게 확인합니다."],
    ["04", "보증서 확인 및 PDF 저장", "보증 내용을 확인하고 필요할 때 PDF로 저장합니다."],
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
              <p>PG FILM Series</p>
              <h1>품질보증서 조회</h1>
              <span>
                포그니필름은 정품 필름과 전문 시공으로
                <br />
                최대 15년 품질보증서를 발급해 드립니다.
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
            <h2 id="warranty-value-title">PG FILM Series 품질보증서의 가치</h2>
            <span>정품 자재와 전문 시공, 시공 이후의 책임까지 공식 보증서에 담았습니다.</span>
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
              <li>조회되지 않을 경우 고객센터로 문의해주세요.</li>
              <li>품질보증서는 제품별 기준에 따라 최대 15년 보증됩니다.</li>
              <li>발급된 보증서 내용은 임의로 변경할 수 없습니다.</li>
            </ul>
          </article>
          <article className={styles.customerCard} aria-labelledby="warranty-support-title">
            <p>CONTACT CENTER</p>
            <h2 id="warranty-support-title">고객센터</h2>
            <a className={styles.customerPhone} href="tel:18334236">1833-4236</a>
            <span>평일 09:00 - 18:00<br />주말 및 공휴일 휴무</span>
            <a
              className={styles.kakaoButton}
              href="https://pf.kakao.com/_aYxmxmG/chat"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오톡 상담
            </a>
          </article>
        </section>

        <section className={styles.closingBanner}>
          <div>
            <p>POGNY FILM QUALITY PROMISE</p>
            <h2>최대 15년 품질보증<br />10,000건 이상의 시공 경험</h2>
            <span>
              포그니필름은 자재 생산부터 시공까지 책임지는 전문 기업으로
              고객님의 만족을 최우선으로 합니다.
            </span>
          </div>
          <div className={styles.closingStats}>
            <article><strong>15년</strong><span>최대 보증 기간</span></article>
            <article><strong>10,000+</strong><span>시공 경험</span></article>
            <article><strong>정품</strong><span>PG FILM Series</span></article>
          </div>
        </section>
      </main>
    </div>
  );
}
