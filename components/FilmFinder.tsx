"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { GLASS_TYPES, PG_FILM_PRODUCTS, type FilmProduct } from "../app/film-recommendation-data";

type FinderState = {
  space: string;
  functions: string[];
  directions: string[];
  preference: string;
  access: string;
  floor: string;
  glass: string;
};

type Step = {
  key: keyof FinderState;
  question: string;
  type: "single" | "multi";
  max?: number;
  options: { value: string; label: string }[];
  helper?: string;
};

const INITIAL_STATE: FinderState = {
  space: "",
  functions: [],
  directions: [],
  preference: "",
  access: "",
  floor: "",
  glass: "",
};

const STEPS: Step[] = [
  {
    key: "space",
    question: "어떤 공간에 시공할 예정인가요?",
    type: "single",
    options: [
      { value: "home", label: "아파트·주택" },
      { value: "office", label: "사무실" },
      { value: "store", label: "매장·상가" },
      { value: "factory", label: "공장" },
      { value: "public", label: "학교·병원·공공기관" },
      { value: "etc", label: "기타" },
    ],
  },
  {
    key: "functions",
    question: "어떤 기능이 가장 필요한가요?",
    type: "multi",
    max: 3,
    options: [
      { value: "heat", label: "강한 열차단" },
      { value: "glare", label: "눈부심 감소" },
      { value: "bright", label: "밝은 조망 유지" },
      { value: "privacy", label: "낮 시간 사생활 보호" },
      { value: "uv", label: "자외선 차단" },
      { value: "safety", label: "안전·비산 방지" },
      { value: "energy", label: "냉난방 효율 개선" },
    ],
  },
  {
    key: "directions",
    question: "창문은 어느 방향을 향하고 있나요?",
    type: "multi",
    options: [
      { value: "east", label: "동향" },
      { value: "west", label: "서향" },
      { value: "south", label: "남향" },
      { value: "north", label: "북향" },
      { value: "multi", label: "여러 방향" },
    ],
  },
  {
    key: "preference",
    question: "어떤 사용감을 가장 중요하게 생각하시나요?",
    type: "single",
    helper: "야간에는 실내 조명 때문에 사생활 보호 효과가 제한될 수 있습니다.",
    options: [
      { value: "bright", label: "최대한 밝은 실내와 조망 유지" },
      { value: "balance", label: "밝기와 열차단의 균형" },
      { value: "heat", label: "조금 어두워져도 열차단 우선" },
      { value: "privacy", label: "낮 시간 사생활 보호 우선" },
    ],
  },
  {
    key: "access",
    question: "실내에서 유리창 전체에 접근할 수 있나요?",
    type: "single",
    options: [
      { value: "all", label: "모든 유리창에 접근 가능" },
      { value: "partial", label: "일부 유리창만 접근 가능" },
      { value: "external", label: "외부 시공이 필요해 보임" },
    ],
  },
  {
    key: "glass",
    question: "유리 종류를 알고 계신가요?",
    type: "single",
    options: [
      { value: "single", label: GLASS_TYPES.single },
      { value: "double", label: GLASS_TYPES.double },
      { value: "lowE", label: GLASS_TYPES.lowE },
      { value: "tempered", label: GLASS_TYPES.tempered },
    ],
  },
];

const FLOOR_OPTIONS = [
  { value: "1-5", label: "1~5층" },
  { value: "6-15", label: "6~15층" },
  { value: "16+", label: "16층 이상" },
];

function getLabel(stepKey: keyof FinderState, value: string) {
  if (stepKey === "floor") return FLOOR_OPTIONS.find((item) => item.value === value)?.label || value;
  const step = STEPS.find((item) => item.key === stepKey);
  return step?.options.find((item) => item.value === value)?.label || value;
}

function scoreProduct(product: FilmProduct, state: FinderState) {
  const notes: string[] = [];
  let score = 20 - product.priority;

  if (state.access === "external" && product.installType !== "exterior") return null;
  if ((state.access === "all" || state.access === "partial") && product.installType === "exterior") score -= 8;
  if (state.glass && !product.glassTypes.includes(state.glass)) return null;

  if (product.recommendedSpaces.includes(state.space)) {
    score += 12;
    notes.push(`${getLabel("space", state.space)} 공간에 자주 제안되는 라인입니다.`);
  }
  if (state.space === "etc") score += 2;

  if (state.directions.includes("west") || state.directions.includes("south")) {
    if (product.heatPerformance.includes("99") || product.heatPerformance.includes("98")) score += 10;
    if (product.glareReduction === "high") score += 5;
    notes.push("서향·남향 창문의 강한 햇빛과 열 유입 조건을 반영했습니다.");
  }

  if (state.functions.includes("heat") || state.functions.includes("energy")) {
    if (product.heatPerformance.includes("99") || product.heatPerformance.includes("98")) score += 10;
    else score += 5;
  }
  if (state.functions.includes("glare") && product.glareReduction === "high") score += 8;
  if (state.functions.includes("bright") && product.brightness === "bright") score += 10;
  if (state.functions.includes("privacy")) score += product.privacy === "high" ? 10 : product.privacy === "medium" ? 6 : 0;
  if (state.functions.includes("uv")) score += 6;
  if (state.functions.includes("safety") && product.safety) score += 8;

  if (state.preference === "bright" && product.brightness === "bright") {
    score += 12;
    notes.push("밝은 실내감과 조망 유지 선호를 반영했습니다.");
  }
  if (state.preference === "balance" && product.brightness === "balanced") {
    score += 10;
    notes.push("밝기와 열차단의 균형을 중요하게 본 조건을 반영했습니다.");
  }
  if (state.preference === "heat" && (product.heatPerformance.includes("99") || product.glareReduction === "high")) {
    score += 10;
    notes.push("조금 어두워져도 열차단을 우선하는 조건을 반영했습니다.");
  }
  if (state.preference === "privacy" && product.privacy !== "low") {
    score += product.privacy === "high" ? 12 : 7;
    notes.push("낮 시간 사생활 보호 선호를 반영했습니다.");
  }

  if (state.floor === "16+" || state.access === "partial" || !state.glass) {
    notes.push("층수, 접근 조건, 유리 종류는 방문 실측 시 최종 확인이 필요합니다.");
  }

  return { product, score, notes: [...notes, ...product.strengths].slice(0, 3) };
}

export default function FilmFinder() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FinderState>(INITIAL_STATE);
  const [showResult, setShowResult] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById("film-finder-root"));
  }, []);

  const currentStep = STEPS[stepIndex];
  const stepLabels = ["공간", "기능", "방향", "사용감", "시공 조건", "유리"];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const currentValue = answers[currentStep.key];
  const canProceed = Array.isArray(currentValue) ? currentValue.length > 0 : Boolean(currentValue);

  const result = useMemo(() => {
    const candidates = PG_FILM_PRODUCTS.map((product) => scoreProduct(product, answers))
      .filter((item): item is NonNullable<ReturnType<typeof scoreProduct>> => Boolean(item))
      .sort((a, b) => b.score - a.score);
    const uncertain = !answers.glass || !answers.access || candidates.length === 0;
    return { candidates, primary: candidates[0], uncertain };
  }, [answers]);

  const selectOption = (value: string) => {
    const key = currentStep.key;
    if (currentStep.type === "single") {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setAnswers((prev) => {
      const selected = prev[key] as string[];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value].slice(0, currentStep.max || 6);
      return { ...prev, [key]: next };
    });
  };

  const reset = () => {
    setAnswers(INITIAL_STATE);
    setStepIndex(0);
    setShowResult(false);
  };

  const fillQuote = () => {
    const primary = result.primary?.product.name || "현장 확인 후 안내";
    const message = `[PG FILM 추천 진단 결과]\n\n공간: ${getLabel("space", answers.space)}\n방향: ${answers.directions.map((item) => getLabel("directions", item)).join(", ")}\n중요 기능: ${answers.functions.map((item) => getLabel("functions", item)).join(", ")}\n밝기 선호: ${getLabel("preference", answers.preference)}\n실내 접근: ${getLabel("access", answers.access)}\n층수: ${getLabel("floor", answers.floor)}\n유리 종류: ${getLabel("glass", answers.glass)}\n추천 제품: ${primary}\n\n본 결과는 1차 추천이며, 실제 유리 종류와 현장 환경에 따라 최종 제품은 방문 실측 후 달라질 수 있습니다.`;
    const textarea = document.querySelector<HTMLTextAreaElement>('.quote-form textarea[name="message"]');
    if (textarea) {
      textarea.value = message;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderProductCard = (item: NonNullable<ReturnType<typeof scoreProduct>>, rank: string) => (
    <article className="finder-result-card">
      <span className="finder-rank">{rank}</span>
      <h4>{item.product.name}</h4>
      <p>{item.product.summary}</p>
      <ul>
        {item.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <dl>
        <div><dt>밝기 성향</dt><dd>{item.product.visibleLight}</dd></div>
        <div><dt>열차단 성향</dt><dd>{item.product.heatPerformance}</dd></div>
        <div><dt>프라이버시</dt><dd>{item.product.privacy === "high" ? "높음" : item.product.privacy === "medium" ? "중간" : "낮음"}</dd></div>
        <div><dt>시공 구분</dt><dd>{item.product.installType === "exterior" ? "외부형" : "내부형"}</dd></div>
        <div><dt>적용 유리</dt><dd>{item.product.glassTypes.map((type) => GLASS_TYPES[type as keyof typeof GLASS_TYPES]).join(", ")}</dd></div>
        <div><dt>품질보증</dt><dd>{item.product.warranty}</dd></div>
      </dl>
      <a href="#cases">관련 시공 사례 보기</a>
    </article>
  );

  const content = (
    <section className="section film-finder" id="film-finder" aria-labelledby="film-finder-title">
      <div className="finder-shell">
        <div className="finder-head">
          <div>
            <p className="eyebrow">PG FILM MATCH</p>
            <h2 id="film-finder-title">내 공간에 맞는 필름,<br />포그니가 찾아드립니다.</h2>
          </div>
          <p>여섯 가지 항목에 답변을 선택하면 PG FILM Series 중 가장 적합한 제품을 포그니가 추천해드립니다.</p>
        </div>

        {!showResult ? (
          <div className="finder-card">
            <div className="finder-progress" aria-label={`진행 단계 ${stepIndex + 1} / ${STEPS.length}`}>
              <div className="finder-progress-meta">
                <strong>STEP {stepIndex + 1} / {STEPS.length}</strong>
                <em>{stepLabels[stepIndex]}</em>
              </div>
              <span><i style={{ width: `${progress}%` }} /></span>
            </div>
            <div className="finder-step" key={currentStep.key}>
              <h3>{currentStep.question}</h3>
              {currentStep.helper ? <p className="finder-helper">{currentStep.helper}</p> : null}
              <div className="finder-options">
                {currentStep.options.map((option) => {
                  const selected = Array.isArray(currentValue)
                    ? currentValue.includes(option.value)
                    : currentValue === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={selected ? "selected" : ""}
                      aria-pressed={selected}
                      onClick={() => selectOption(option.value)}
                    >
                      <span aria-hidden="true">{selected ? "✓" : ""}</span>
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {currentStep.key === "access" ? (
                <div className="finder-floor">
                  <h4>층수도 함께 선택해주세요.</h4>
                  <div className="finder-options compact">
                    {FLOOR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={answers.floor === option.value ? "selected" : ""}
                        aria-pressed={answers.floor === option.value}
                        onClick={() => setAnswers((prev) => ({ ...prev, floor: option.value }))}
                      >
                        <span aria-hidden="true">{answers.floor === option.value ? "✓" : ""}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="finder-actions">
              <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
                이전
              </button>
              <button
                type="button"
                className="primary"
                disabled={!canProceed || (currentStep.key === "access" && !answers.floor)}
                onClick={() => {
                  if (stepIndex === STEPS.length - 1) setShowResult(true);
                  else setStepIndex((value) => value + 1);
                }}
              >
                {stepIndex === STEPS.length - 1 ? "결과 보기" : "다음"}
              </button>
            </div>
          </div>
        ) : (
          <div className="finder-result">
            <div className="finder-result-head">
              <p className="eyebrow">MATCH RESULT</p>
              <h3>고객님의 공간에 적합한 PG FILM을 찾았습니다</h3>
              <div className="finder-summary">
                <span>공간: {getLabel("space", answers.space)}</span>
                <span>방향: {answers.directions.map((item) => getLabel("directions", item)).join(", ")}</span>
                <span>중요 기능: {answers.functions.map((item) => getLabel("functions", item)).join(", ")}</span>
                <span>실내 접근: {getLabel("access", answers.access)}</span>
                <span>유리 종류: {getLabel("glass", answers.glass)}</span>
              </div>
            </div>

            {result.uncertain ? (
              <div className="finder-notice">
                현재 선택하신 정보만으로는 제품을 확정하기 어렵습니다. 유리 종류와 시공 환경을 확인한 후 정확한 제품을 안내해드리겠습니다.
              </div>
            ) : null}

            <div className="finder-result-grid">
              {result.primary ? renderProductCard(result.primary, "추천 제품") : null}
            </div>

            <p className="finder-disclaimer">
              본 결과는 고객님이 선택한 조건을 바탕으로 한 추천 결과입니다. 실제 유리 종류와 현장 환경에 따라 최종 제품은 방문 실측 후 달라질 수 있습니다.
            </p>

            <div className="finder-actions result-actions">
              <button type="button" className="primary" onClick={fillQuote}>이 조건으로 무료 방문 실측 신청</button>
              <button type="button" onClick={reset}>다시 진단하기</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );

  return portalRoot ? createPortal(content, portalRoot) : null;
}
