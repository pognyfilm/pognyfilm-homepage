import { getPublishedPortfolioItems } from "../../lib/portfolio/queries";
import PortfolioGallery from "./PortfolioGallery";

function LegacyPortfolioFallback() {
  return (
    <>
      <section className="section cases" id="cases" aria-labelledby="cases-title">
        <div className="section-head split">
          <div><p className="eyebrow">Portfolio</p><h2 id="cases-title">시공사례</h2></div>
          <div className="filters" aria-label="시공사례 필터">
            <button className="active" data-filter="all" type="button">전체</button>
            <button data-filter="home" type="button">주거</button>
            <button data-filter="office" type="button">사무실</button>
            <button data-filter="factory" type="button">공장</button>
            <button data-filter="public" type="button">관공서</button>
            <button data-filter="school" type="button">학교</button>
            <button data-filter="store" type="button">상가</button>
          </div>
        </div>
        <div className="case-grid" data-case-grid />
      </section>
      <div className="case-modal" data-case-modal aria-hidden="true">
        <div className="case-modal-backdrop" data-case-close />
        <section className="case-modal-panel" role="dialog" aria-modal="true" aria-labelledby="case-modal-title">
          <button className="case-modal-close" data-case-close type="button" aria-label="시공사례 상세 닫기">×</button>
          <div className="case-modal-head">
            <p className="eyebrow" data-case-category />
            <h2 id="case-modal-title" data-case-title />
            <p data-case-summary />
          </div>
          <div className="case-modal-meta" data-case-meta />
          <div className="case-external-links case-external-links-legacy">
            <a data-case-blog href="#" target="_blank" rel="noopener noreferrer">블로그 보기</a>
            <a className="is-youtube" data-case-youtube href="#" target="_blank" rel="noopener noreferrer">영상 보기</a>
          </div>
          <div className="case-stage-grid" data-case-stages />
        </section>
      </div>
    </>
  );
}

export default async function PublicPortfolioSection() {
  const { items } = await getPublishedPortfolioItems();
  if (items === null || !items.length) return <LegacyPortfolioFallback />;
  return <PortfolioGallery items={items} />;
}
