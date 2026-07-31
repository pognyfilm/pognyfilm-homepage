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
    { icon: "15", label: "최대 15년 품질보증" },
    { icon: "10K+", label: "10,000건 이상 시공 경험" },
    { icon: "PG", label: "정품 필름 사용" },
    { icon: "LOCK", label: "고객 정보 안전 보호" },
  ];
  const values = [
    {
      icon: "01",
      title: "정품 시공의 확실한 증명",
      description:
        "등록된 시공 정보와 제품 내역을 공식 품질보증서로 투명하게 확인할 수 있습니다.",
    },
    {
      icon: "02",
      title: "오래도록 이어지는 책임",
      description:
        "시공이 끝난 뒤에도 보증 정보를 안전하게 보관하고 필요한 순간 다시 확인할 수 있습니다.",
    },
    {
      icon: "03",
      title: "본사 직영팀의 사후관리",
      description:
        "검증된 정품 필름과 본사 직영 시공 이력을 기반으로 책임 있는 서비스를 제공합니다.",
    },
  ];
  const steps = [
    ["01", "고객 정보 입력", "시공 당시 등록한 고객명과 연락처를 입력합니다."],
    ["02", "등록 정보 확인", "고객명과 연락처가 등록 정보와 일치하는지 안전하게 확인합니다."],
    ["03", "보증서 미리보기", "보증번호와 시공 제품, 보증기간 등 주요 내용을 확인합니다."],
    ["04", "PDF 저장", "필요할 때 품질보증서를 PDF로 저장하거나 출력합니다."],
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="/" aria-label="포그니필름 홈페이지">
          <img src="/assets/pogny-logo-gold.png" alt="POGNY FILM" />
        </a>
        <nav className={styles.headerNav} aria-label="품질보증서 메뉴">
          <a href="/warranty" aria-current="page">품질보증서</a>
        </nav>
        <a className={styles.headerCall} href="tel:18334236">
          <span>무료 방문 실측</span>
          <strong>1833-4236</strong>
        </a>
      </header>
      <main className={styles.main}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>SUPPORT</p>
          <strong className={styles.series}>PG FILM Series</strong>
          <h1>품질보증서 조회</h1>
          <p className={styles.introText}>
            시공 완료 고객님은 성함과 연락처를 입력해
            <br />
            포그니필름 품질보증서를 확인하실 수 있습니다.
            <br />
            등록된 정보와 일치할 경우 보증서 미리보기와 다운로드가
            제공됩니다.
          </p>
        </section>

        <section className={styles.trustStrip} aria-label="포그니필름 품질보증 신뢰 지표">
          {trustItems.map((item) => (
            <article key={item.label}>
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </article>
          ))}
        </section>

        <WarrantyLookupClient />

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

        <section className={styles.supportSection} aria-labelledby="warranty-support-title">
          <div>
            <p>고객센터</p>
            <h2 id="warranty-support-title">조회에 도움이 필요하신가요?</h2>
            <span>포그니필름 본사 담당자가 품질보증서 확인을 도와드립니다.</span>
          </div>
          <div className={styles.supportActions}>
            <a href="tel:18334236">
              <span>전화 상담</span>
              <strong>1833-4236</strong>
            </a>
            <a
              href="https://pf.kakao.com/_aYxmxmG/chat"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오 상담
            </a>
          </div>
        </section>

        <section className={styles.closingBanner}>
          <div>
            <p>POGNY FILM QUALITY PROMISE</p>
            <h2>시공 이후까지 책임지는 품질보증</h2>
            <span>
              검증된 정품 필름과 본사 직영 시공 경험을 바탕으로 고객님의
              공간에 오래도록 신뢰할 수 있는 기준을 제공합니다.
            </span>
          </div>
          <strong>
            최대 15년 품질보증
            <span>10,000건 이상의 시공 경험</span>
          </strong>
        </section>
      </main>
    </div>
  );
}
