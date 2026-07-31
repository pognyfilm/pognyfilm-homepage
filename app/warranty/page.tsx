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
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="/" aria-label="포그니필름 홈페이지">
          <img src="/assets/pogny-logo-gold.png" alt="POGNY FILM" />
        </a>
        <a className={styles.homeLink} href="/">
          홈페이지
        </a>
      </header>
      <main className={styles.main}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>SUPPORT</p>
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
        <WarrantyLookupClient />
      </main>
    </div>
  );
}
