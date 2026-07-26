"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FAQS = [
  {
    question: "시공은 얼마나 걸리나요?",
    answer: (
      <>
        평균 아파트 기준 2~4시간 정도 소요됩니다.
        <br />
        면적과 창문의 수에 따라 달라질 수 있으며, 대부분 하루 안에 시공이 완료됩니다.
      </>
    ),
  },
  {
    question: "밤에도 사생활 보호가 되나요?",
    answer: (
      <>
        주간에는 외부 시선을 효과적으로 차단하지만, 실내 조명이 더 밝은 밤에는 내부가 보일 수 있습니다.
        <br />
        필요에 따라 농도와 용도에 맞는 제품을 추천드립니다.
      </>
    ),
  },
  {
    question: "시공하면 집이 너무 어두워지나요?",
    answer: (
      <>
        아닙니다.
        <br />
        공간에 맞는 제품을 선택하면 열차단 성능은 유지하면서도 실내 밝기를 최대한 유지할 수 있습니다.
        <br />
        공간별 용도에 맞는 농도를 상담 후 추천드립니다.
      </>
    ),
  },
  {
    question: "시공 후 A/S도 가능한가요?",
    answer: (
      <>
        네.
        <br />
        포그니필름은 정품 품질보증서를 발급하며, 보증 기간 동안 책임 있게 A/S를 지원합니다.
      </>
    ),
  },
];

export default function FaqSection() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById("faq-root"));
  }, []);

  const content = (
    <section className="faq" aria-labelledby="faq-title">
      <div className="faq-shell">
        <header className="faq-head">
          <p className="eyebrow">Contact</p>
          <h2 id="faq-title"><span>내 공간에 맞는 필름,</span><span>전문가에게 문의하세요</span></h2>
          <p>포그니필름이 실제 상담에서 가장 많이 받은 질문을 정리했습니다.</p>
        </header>

        <div className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index + 1}`;

            return (
              <article className={`faq-item${isOpen ? " is-open" : ""}`} key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="faq-q" aria-hidden="true">Q</span>
                  <strong>{item.question}</strong>
                  <span className="faq-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                <div className="faq-answer" id={answerId} aria-hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );

  return portalRoot ? createPortal(content, portalRoot) : null;
}
