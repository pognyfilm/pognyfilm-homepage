import type {
  RecommendationAnswers,
  RecommendationQuestion,
  RecommendationQuestionKey,
} from "./types";

export const recommendationQuestions: RecommendationQuestion[] = [
  {
    key: "space",
    title: "어떤 공간에 시공할 예정인가요?",
    shortLabel: "공간",
    options: [
      { value: "apartment", label: "아파트" },
      { value: "house", label: "단독주택" },
      { value: "office", label: "사무실" },
      { value: "store", label: "매장·카페" },
      { value: "hospital", label: "병원" },
      { value: "factory", label: "공장·기타" },
    ],
  },
  {
    key: "concern",
    title: "가장 크게 고민되는 점은 무엇인가요?",
    shortLabel: "주요 고민",
    options: [
      { value: "heat", label: "실내가 너무 더움" },
      { value: "glare", label: "눈부심" },
      { value: "energy", label: "냉난방비 부담" },
      { value: "privacy", label: "주간 사생활 보호" },
      { value: "safety", label: "유리 파손 시 안전" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
  {
    key: "direction",
    title: "창문은 어느 방향을 향하고 있나요?",
    shortLabel: "방향",
    options: [
      { value: "south", label: "남향" },
      { value: "west", label: "서향" },
      { value: "east", label: "동향" },
      { value: "north", label: "북향" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
  {
    key: "privacy",
    title: "낮 시간 사생활 보호가 얼마나 필요한가요?",
    shortLabel: "사생활 필요도",
    options: [
      { value: "high", label: "매우 필요" },
      { value: "medium", label: "조금 필요" },
      { value: "none", label: "필요 없음" },
    ],
  },
  {
    key: "brightness",
    title: "실내 밝기를 유지하는 것이 얼마나 중요한가요?",
    shortLabel: "밝기 중요도",
    options: [
      { value: "high", label: "매우 중요" },
      { value: "medium", label: "어느 정도 중요" },
      { value: "low", label: "어두워져도 괜찮음" },
    ],
  },
  {
    key: "installation",
    title: "필름을 시공할 위치를 알려주세요.",
    shortLabel: "시공 위치",
    options: [
      { value: "interior", label: "실내 시공 가능" },
      { value: "exterior", label: "외부 시공이 필요할 수 있음" },
      { value: "unknown", label: "잘 모르겠음" },
    ],
  },
];

export const emptyRecommendationAnswers = (): RecommendationAnswers => ({
  space: "",
  concern: "",
  direction: "",
  privacy: "",
  brightness: "",
  installation: "",
});

export const getRecommendationLabel = (
  key: RecommendationQuestionKey,
  value: string,
) =>
  recommendationQuestions
    .find((question) => question.key === key)
    ?.options.find((option) => option.value === value)?.label || value;

export const getRecommendationSummary = (answers: RecommendationAnswers) =>
  recommendationQuestions.map((question) => ({
    key: question.key,
    label: question.shortLabel,
    value: getRecommendationLabel(question.key, answers[question.key]),
  }));
