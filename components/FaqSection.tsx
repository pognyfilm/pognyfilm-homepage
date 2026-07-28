"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const FAQS = [
  {
    question: "단열필름 시공으로 유리가 깨질 수 있나요?",
    answer: (
      <>
        유리 종류와 상태를 확인하지 않고 부적합한 필름을 시공하면 열응력으로 인해 파손 위험이 높아질 수 있습니다.
        <br />
        포그니필름은 현장 실측에서 유리 사양과 설치 환경을 확인한 뒤 적합한 제품과 시공 방법을 안내합니다.
      </>
    ),
  },
  {
    question: "밤에도 사생활 보호가 되나요?",
    answer: (
      <>
        주간에는 외부 시선을 효과적으로 차단하지만, 실내 조명이 더 밝은 밤에는 내부가 보일 수 있습니다.
        <br />
        야간 사생활 보호가 필요하다면 커튼이나 블라인드를 함께 사용하는 것을 권장합니다.
      </>
    ),
  },
  {
    question: "어떤 필름을 선택해야 하나요?",
    answer: (
      <>
        창문의 방향과 유리 종류, 열·눈부심·밝기·사생활 보호 중 어떤 기능을 우선하는지에 따라 적합한 필름이 달라집니다.
        <br />
        상담과 현장 실측을 통해 공간에 맞는 제품을 안내해드립니다.
      </>
    ),
  },
  {
    question: "품질보증은 어떻게 받을 수 있나요?",
    answer: (
      <>
        시공 완료 후 적용 제품과 보증기간을 확인할 수 있는 정품 품질보증서를 발급해드립니다.
        <br />
        보증 범위에 해당하는 사항은 품질보증 내용을 기준으로 본사 직영팀이 책임 있게 안내하고 지원합니다.
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
