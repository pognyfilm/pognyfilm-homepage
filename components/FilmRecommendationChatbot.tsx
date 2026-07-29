"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackAnalyticsEvent } from "../app/analytics";
import { scrollToQuote } from "../lib/scroll-to-quote";
import {
  emptyRecommendationAnswers,
  getRecommendationSummary,
  recommendationQuestions,
} from "../lib/film-recommendation/questions";
import { recommendFilm } from "../lib/film-recommendation/recommend";
import type { RecommendationAnswers } from "../lib/film-recommendation/types";

type ChatbotView = "intro" | "questions" | "result";

export default function FilmRecommendationChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatbotView>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<RecommendationAnswers>(
    emptyRecommendationAnswers,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const question = recommendationQuestions[stepIndex];
  const selectedValue = question ? answers[question.key] : "";
  const result = useMemo(
    () => (view === "result" ? recommendFilm(answers) : null),
    [answers, view],
  );
  const summary = useMemo(() => getRecommendationSummary(answers), [answers]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  const openChatbot = () => {
    setIsOpen(true);
    trackAnalyticsEvent("chatbot_open", { chatbot_type: "guided_recommendation" });
  };

  const reset = () => {
    setAnswers(emptyRecommendationAnswers());
    setStepIndex(0);
    setView("intro");
  };

  const start = () => {
    setView("questions");
    setStepIndex(0);
    trackAnalyticsEvent("chatbot_start", { total_steps: recommendationQuestions.length });
  };

  const next = () => {
    if (!question || !selectedValue) return;
    trackAnalyticsEvent("chatbot_step_complete", {
      step_number: stepIndex + 1,
      step_key: question.key,
      option_value: selectedValue,
    });
    if (stepIndex === recommendationQuestions.length - 1) {
      const recommendation = recommendFilm(answers);
      setView("result");
      trackAnalyticsEvent("chatbot_recommendation_view", {
        recommended_product: recommendation.product.code,
        space_type: answers.space,
        installation_type: answers.installation,
      });
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const fillQuote = () => {
    if (!result) return;
    const message = [
      "[필름 추천 상담 요약]",
      "",
      "상담 경로: 필름 추천 상담봇",
      ...summary.map((item) => `${item.label}: ${item.value}`),
      `추천 제품: ${result.product.code}`,
      "",
      "선택 답변을 기준으로 한 예상 결과이며, 유리 종류와 현장 조건에 따라 무료 실측 후 최종 제품이 달라질 수 있습니다.",
    ].join("\n");
    const quoteForm =
      document.querySelector<HTMLFormElement>("[data-quote-form]");
    const textarea = quoteForm?.querySelector<HTMLTextAreaElement>(
      'textarea[name="message"]',
    );
    const spaceSelect =
      quoteForm?.querySelector<HTMLSelectElement>('select[name="space"]');
    const spaceValue =
      answers.space === "apartment" || answers.space === "house"
        ? "주거공간"
        : answers.space === "hospital"
          ? "공공기관"
          : answers.space === "factory"
            ? "기타"
            : "상업공간";

    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (spaceSelect) {
      spaceSelect.value = spaceValue;
      spaceSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (quoteForm) quoteForm.dataset.recommendedProduct = result.product.code;

    trackAnalyticsEvent("chatbot_lead_click", {
      recommended_product: result.product.code,
      space_type: answers.space,
    });
    setIsOpen(false);
    window.setTimeout(() => {
      scrollToQuote();
      textarea?.focus({ preventScroll: true });
    }, 50);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="film-chatbot-trigger"
        onClick={openChatbot}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="film-chatbot-panel"
      >
        <span aria-hidden="true">AI</span>
        <strong>포그니 AI 상담</strong>
      </button>

      {isOpen && (
        <div className="film-chatbot-layer">
          <button
            type="button"
            className="film-chatbot-backdrop"
            aria-label="상담창 닫기"
            onClick={() => setIsOpen(false)}
          />
          <section
            ref={panelRef}
            id="film-chatbot-panel"
            className="film-chatbot-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="film-chatbot-title"
          >
            <header className="film-chatbot-header">
              <div>
                <span>POGNY FILM GUIDE</span>
                <h2 id="film-chatbot-title">포그니 AI 상담</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="상담창 닫기"
              >
                ×
              </button>
            </header>

            <div className="film-chatbot-body">
              {view === "intro" && (
                <div className="film-chatbot-intro">
                  <span className="film-chatbot-avatar" aria-hidden="true">PG</span>
                  <div>
                    <h3>안녕하세요.<br />포그니 필름 추천 상담입니다.</h3>
                    <p>
                      몇 가지 항목을 선택하면 고객님의 공간에 적합한 PG FILM
                      Series 제품을 추천해드립니다.
                    </p>
                  </div>
                  <button type="button" onClick={start}>상담 시작하기</button>
                </div>
              )}

              {view === "questions" && question && (
                <div className="film-chatbot-question">
                  <div className="film-chatbot-progress">
                    <div>
                      <span>{stepIndex + 1} / {recommendationQuestions.length}</span>
                      <em>{question.shortLabel}</em>
                    </div>
                    <span aria-hidden="true">
                      <i
                        style={{
                          width: `${((stepIndex + 1) / recommendationQuestions.length) * 100}%`,
                        }}
                      />
                    </span>
                  </div>
                  <h3>{question.title}</h3>
                  <div className="film-chatbot-options">
                    {question.options.map((option) => {
                      const selected = selectedValue === option.value;
                      return (
                        <button
                          type="button"
                          key={option.value}
                          className={selected ? "is-selected" : ""}
                          aria-pressed={selected}
                          onClick={() =>
                            setAnswers((current) => ({
                              ...current,
                              [question.key]: option.value,
                            }))
                          }
                        >
                          <span aria-hidden="true">{selected ? "✓" : ""}</span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {question.key === "privacy" && (
                    <p className="film-chatbot-helper">
                      사생활 보호 효과는 낮 시간 기준이며 야간에는 제한될 수 있습니다.
                    </p>
                  )}
                  <div className="film-chatbot-nav">
                    <button
                      type="button"
                      onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
                      disabled={stepIndex === 0}
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      className="is-primary"
                      onClick={next}
                      disabled={!selectedValue}
                    >
                      {stepIndex === recommendationQuestions.length - 1
                        ? "추천 결과 보기"
                        : "다음"}
                    </button>
                  </div>
                  <button type="button" className="film-chatbot-reset" onClick={reset}>
                    처음부터 다시하기
                  </button>
                </div>
              )}

              {view === "result" && result && (
                <div className="film-chatbot-result">
                  <p className="film-chatbot-result-label">추천 제품</p>
                  <article className={`film-chatbot-product-card is-${result.product.id}`}>
                    <div className="film-chatbot-product-visual">
                      <img
                        src={result.product.image}
                        alt={`${result.product.name} 추천 공간`}
                      />
                      <span>
                        {result.product.code} · {result.product.tagline}
                      </span>
                    </div>
                    <div className="film-chatbot-product-copy">
                      <p>Premium Film Line-up</p>
                      <h3>{result.product.name}</h3>
                      <strong>{result.product.caseLabel}</strong>
                      <p className="film-chatbot-product-summary">
                        {result.product.summary}
                      </p>
                      <div className="film-chatbot-product-reason">
                        <span>추천 이유</span>
                        <p>{result.reason}</p>
                      </div>
                      <div className="film-chatbot-product-benefits">
                        <h4>주요 장점</h4>
                        <ul>
                          {result.advantages.map((advantage) => (
                            <li key={advantage}>{advantage}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        className="film-chatbot-product-cta"
                        onClick={fillQuote}
                      >
                        이 제품으로 무료 상담 신청
                      </button>
                    </div>
                  </article>

                  <section>
                    <h4>상담 답변 요약</h4>
                    <dl>
                      {summary.map((item) => (
                        <div key={item.key}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  {result.notices.map((notice) => (
                    <p className="film-chatbot-result-notice" key={notice}>{notice}</p>
                  ))}
                  <p className="film-chatbot-disclaimer">
                    이 추천은 선택하신 답변을 기준으로 한 예상 결과입니다. 유리
                    종류와 현장 조건에 따라 최종 제품은 무료 실측 후 달라질 수
                    있습니다.
                  </p>

                  <div className="film-chatbot-result-actions">
                    <a
                      href="tel:18334236"
                      onClick={() =>
                        trackAnalyticsEvent("chatbot_phone_click", {
                          recommended_product: result.product.code,
                        })
                      }
                    >
                      전화 상담 1833-4236
                    </a>
                    <button type="button" onClick={reset}>처음부터 다시하기</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
