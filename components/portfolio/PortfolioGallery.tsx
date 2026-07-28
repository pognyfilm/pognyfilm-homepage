"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import type {
  PortfolioImageStage,
  PortfolioItem,
} from "../../lib/portfolio/types";

const categories = [
  ["all", "전체"],
  ["home", "주거"],
  ["office", "사무실"],
  ["factory", "공장"],
  ["public", "관공서"],
  ["school", "학교"],
  ["store", "상가"],
];
const categoryLabels = Object.fromEntries(categories);
const stageLabels: Record<PortfolioImageStage, string> = {
  before: "시공 전",
  during: "시공 중",
  after: "시공 후",
  general: "시공 이미지",
};

const stageContent = (
  item: PortfolioItem,
  stage: PortfolioImageStage,
) => {
  if (stage === "before") {
    return {
      title: item.before_title || stageLabels[stage],
      description: item.before_description,
    };
  }
  if (stage === "during") {
    return {
      title: item.during_title || stageLabels[stage],
      description: item.during_description,
    };
  }
  if (stage === "after") {
    return {
      title: item.after_title || stageLabels[stage],
      description: item.after_description,
    };
  }
  return { title: stageLabels[stage], description: null };
};

export default function PortfolioGallery({
  items,
}: {
  items: PortfolioItem[];
}) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const visible = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.category === filter),
    [filter, items],
  );

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(selected));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  const groupedImages = selected
    ? (["before", "during", "after", "general"] as PortfolioImageStage[])
        .map((stage) => ({
          stage,
          images: (selected.portfolio_images || []).filter(
            (image) => image.stage === stage,
          ).slice(0, 3),
          ...stageContent(selected, stage),
        }))
        .filter((group) => group.images.length)
    : [];

  return (
    <>
      <section className="section cases" id="cases" aria-labelledby="cases-title">
        <div className="section-head split">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2 id="cases-title">시공사례</h2>
          </div>
          <div className="filters" aria-label="시공사례 필터">
            {categories.map(([value, label]) => (
              <button
                className={filter === value ? "active" : ""}
                type="button"
                onClick={() => setFilter(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="case-grid">
          {visible.map((item) => (
            <button
              className="case-item"
              type="button"
              onClick={() => setSelected(item)}
              key={item.id}
            >
              {item.cover_public_url && (
                <img
                  src={item.cover_public_url}
                  alt={item.cover_image_alt_text || item.title}
                />
              )}
              <span>{categoryLabels[item.category || ""] || item.category || "시공"}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
      </section>

      <div className="case-modal" aria-hidden={selected ? "false" : "true"}>
        <button
          className="case-modal-backdrop"
          type="button"
          aria-label="시공사례 상세 닫기"
          onClick={() => setSelected(null)}
        />
        <section
          className="case-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-modal-title"
        >
          <button
            className="case-modal-close"
            type="button"
            aria-label="시공사례 상세 닫기"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          {selected && (
            <>
              <div className="case-modal-top">
                <div className="case-modal-head">
                  <p className="eyebrow">
                    {categoryLabels[selected.category || ""] || "Portfolio"}
                  </p>
                  <h2 id="portfolio-modal-title">{selected.title}</h2>
                  <p>{selected.summary}</p>
                </div>
                {(selected.blog_url || selected.youtube_url) && (
                  <div className="case-external-links">
                    {selected.blog_url && (
                      <a
                        href={selected.blog_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        블로그 보기
                      </a>
                    )}
                    {selected.youtube_url && (
                      <a
                        className="is-youtube"
                        href={selected.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        영상 보기
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="case-modal-meta">
                {selected.installation_type && (
                  <span className="case-meta-space">
                    <b>공간</b>
                    {selected.installation_type}
                  </span>
                )}
                {selected.product && (
                  <span className="case-meta-product">
                    <b>제품</b>
                    {selected.product}
                  </span>
                )}
                {selected.place && (
                  <span>
                    <b>시공 장소</b>
                    {selected.place}
                  </span>
                )}
              </div>
              <div className="case-stage-grid">
                {groupedImages.map((group) => (
                  <article
                    className="case-stage"
                    style={{ "--image-count": group.images.length } as CSSProperties}
                    key={group.stage}
                  >
                    <div className="case-stage-gallery">
                      {group.images.map((image, index) => (
                        <figure className="case-stage-image" key={image.id || image.storage_path}>
                          {image.public_url && (
                            <img
                              src={image.public_url}
                              alt={image.alt_text || `${selected.title} ${stageLabels[group.stage]} ${index + 1}`}
                            />
                          )}
                          <span>{index + 1}</span>
                          {image.caption && (
                            <figcaption>{image.caption}</figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                    <div>
                      <strong>{group.title}</strong>
                      <p>
                        {group.description ||
                          selected.description ||
                          selected.summary}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
