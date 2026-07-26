"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BenefitIconType = "cost" | "heat" | "shield";

type BenefitCard = {
  point: string;
  title: string;
  icon: BenefitIconType;
  description: string;
  placeholderTitle: string;
  placeholderText: string;
};

const benefitCards: BenefitCard[] = [
  {
    point: "Point.1",
    title: "냉난방비 절감",
    icon: "cost",
    description:
      "창을 통해 들어오는 열 부담을 줄여 공간의 냉난방 효율 변화를 확인할 수 있습니다.",
    placeholderTitle: "절감 그래프 영역",
    placeholderText: "다음 단계에서 냉난방비 절감 그래프를 연결할 예정입니다.",
  },
  {
    point: "Point.2",
    title: "열차단 성능",
    icon: "heat",
    description:
      "태양열 유입을 낮춰 창가 체감 온도와 실내 쾌적성 변화를 비교합니다.",
    placeholderTitle: "성능 비교 영역",
    placeholderText: "다음 단계에서 열차단 성능 비교 애니메이션을 넣을 수 있습니다.",
  },
  {
    point: "Point.3",
    title: "자외선·적외선 차단",
    icon: "shield",
    description:
      "자외선과 적외선이 필름에서 반사되고, 필요한 빛만 통과하는 흐름을 보여줍니다.",
    placeholderTitle: "빛 반사 애니메이션 영역",
    placeholderText: "다음 단계에서 UV/IR 반사 애니메이션을 확장할 예정입니다.",
  },
];

function BenefitIcon({ type }: { type: BenefitIconType }) {
  if (type === "cost") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M15 41c6 7 14 10 24 7 8-3 13-9 14-18" />
        <path d="M49 17v13h-13" />
        <path d="M21 21h22" />
        <path d="M21 30h16" />
        <path d="M21 39h10" />
      </svg>
    );
  }

  if (type === "heat") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M33 7 17 35h14l-3 22 19-31H33z" />
        <path d="M49 13c5 5 8 12 8 19s-3 14-8 19" />
        <path d="M15 51C10 46 7 39 7 32s3-14 8-19" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6 52 14v16c0 13-8 23-20 28C20 53 12 43 12 30V14z" />
      <path d="m22 32 7 7 14-16" />
      <path d="M8 10 2 4" />
      <path d="M56 10 62 4" />
    </svg>
  );
}

function InteractiveBenefitContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section interactive-benefits" aria-labelledby="interactive-benefits-title">
      <div className="interactive-benefits-head">
        <p className="eyebrow">Performance Check</p>
        <h2 id="interactive-benefits-title">단열필름 핵심 효과</h2>
        <p>카드를 눌러 포그니필름 시공 후 달라지는 3가지 포인트를 하나씩 확인해보세요.</p>
      </div>

      <div className="interactive-benefit-grid">
        {benefitCards.map((card, index) => {
          const isOpen = openIndex === index;

          return (
            <article
              className={`interactive-benefit-card${isOpen ? " is-open" : ""}`}
              key={card.point}
            >
              <button
                className="interactive-benefit-trigger"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="interactive-benefit-point">{card.point}</span>
                <span className="interactive-benefit-icon">
                  <BenefitIcon type={card.icon} />
                </span>
                <strong>{card.title}</strong>
                <em>{isOpen ? "접기" : "더보기"}</em>
              </button>

              <div className="interactive-benefit-panel" aria-hidden={!isOpen}>
                <p>{card.description}</p>
                <div className={`interactive-benefit-visual visual-${card.icon}`}>
                  <span>{card.placeholderTitle}</span>
                  <i />
                  <i />
                  <i />
                </div>
                <small>{card.placeholderText}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function InteractiveBenefitSection({ mountId }: { mountId: string }) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountNode(document.getElementById(mountId));
  }, [mountId]);

  if (!mountNode) {
    return null;
  }

  return createPortal(<InteractiveBenefitContent />, mountNode);
}
