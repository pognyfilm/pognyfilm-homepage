import type { Metadata } from "next";
import Link from "next/link";
import PortfolioGallery from "../../components/portfolio/PortfolioGallery";
import { getPublishedPortfolioItems } from "../../lib/portfolio/queries";

export const metadata: Metadata = {
  title: "시공사례 | 포그니필름",
  description: "포그니필름의 전체 단열필름 시공사례를 확인하세요.",
};

export default async function PortfolioPage() {
  const { items, error } = await getPublishedPortfolioItems();

  return (
    <main className="portfolio-public-page">
      <div className="portfolio-public-nav">
        <Link href="/">← 포그니필름 홈</Link>
      </div>
      {items === null ? (
        <section className="section">
          <div className="portfolio-public-empty">
            <strong>시공사례를 불러오지 못했습니다.</strong>
            <p>{error || "잠시 후 다시 시도해주세요."}</p>
          </div>
        </section>
      ) : (
        <PortfolioGallery items={items} />
      )}
    </main>
  );
}
