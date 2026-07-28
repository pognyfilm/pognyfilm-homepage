import {
  PG_FILM_PRODUCTS,
  type FilmProduct,
} from "../../app/film-recommendation-data";
import { getRecommendationLabel } from "./questions";
import type {
  FilmRecommendation,
  RecommendationAnswers,
} from "./types";

const spaceMap: Record<string, string> = {
  apartment: "home",
  house: "home",
  office: "office",
  store: "store",
  hospital: "public",
  factory: "factory",
};

const byId = (id: FilmProduct["id"]) => {
  const product = PG_FILM_PRODUCTS.find((item) => item.id === id);
  if (!product) throw new Error(`Film product not found: ${id}`);
  return product;
};

function scoreInteriorProduct(
  product: FilmProduct,
  answers: RecommendationAnswers,
) {
  let score = 0;
  const mappedSpace = spaceMap[answers.space] || "home";

  if (product.installType !== "interior") return Number.NEGATIVE_INFINITY;
  if (product.recommendedSpaces.includes(mappedSpace)) score += 12;

  if (answers.concern === "heat" || answers.concern === "energy") {
    if (product.id === "air") score += 11;
    if (product.id === "x") score += 9;
    if (product.id === "pro") score += 7;
  }
  if (answers.concern === "glare") {
    if (product.glareReduction === "high") score += 13;
    else score += 5;
  }
  if (answers.concern === "privacy") {
    if (product.privacy === "medium") score += 12;
    if (product.privacy === "low") score -= 4;
  }
  if (answers.concern === "unknown") score += 3;

  if (answers.direction === "south" || answers.direction === "west") {
    if (product.id === "pro") score += 8;
    if (product.id === "x") score += 6;
    if (product.id === "air") score += 5;
  }
  if (answers.direction === "north" && product.brightness === "bright") score += 7;

  if (answers.privacy === "high") {
    if (product.privacy === "medium") score += 11;
    if (product.privacy === "low") score -= 6;
  }
  if (answers.privacy === "medium" && product.privacy === "medium") score += 6;

  if (answers.brightness === "high") {
    if (product.brightness === "bright") score += 14;
    if (product.brightness === "dark") score -= 8;
  }
  if (answers.brightness === "medium" && product.brightness === "balanced") score += 9;
  if (answers.brightness === "low" && product.brightness === "dark") score += 10;

  if (answers.installation === "interior") score += 3;
  if (answers.installation === "unknown") score += 1;

  return score - product.priority * 0.01;
}

const buildReason = (
  product: FilmProduct,
  answers: RecommendationAnswers,
) => {
  const space = getRecommendationLabel("space", answers.space);
  const direction = getRecommendationLabel("direction", answers.direction);
  const concern = getRecommendationLabel("concern", answers.concern);
  const brightness = getRecommendationLabel("brightness", answers.brightness);

  if (product.installType === "exterior") {
    return `${space}의 ${direction} 창에서 외부 시공이 필요할 수 있다는 조건을 우선 반영했습니다. PG XO는 기존 제품 정보상 외부 전용 라인으로, 실제 유리와 접근 환경을 확인한 뒤 적용 여부를 확정해야 합니다.`;
  }

  return `${space}의 ${direction} 창에서 ${concern} 고민을 줄이면서, 실내 밝기 선호도(${brightness})를 함께 고려한 결과입니다.`;
};

export function recommendFilm(
  answers: RecommendationAnswers,
): FilmRecommendation {
  const product =
    answers.installation === "exterior"
      ? byId("xo")
      : [...PG_FILM_PRODUCTS]
          .filter((item) => item.installType === "interior")
          .sort(
            (a, b) =>
              scoreInteriorProduct(b, answers) -
              scoreInteriorProduct(a, answers),
          )[0] || byId("x");

  const notices: string[] = [];
  if (answers.privacy !== "none" || answers.concern === "privacy") {
    notices.push(
      "사생활 보호 효과는 낮 시간 기준이며, 야간에는 실내 조명 때문에 제한될 수 있습니다.",
    );
  }
  if (answers.concern === "safety") {
    notices.push(
      "유리 파손 안전 요구는 유리 종류와 필름 구조를 현장에서 별도로 확인해야 합니다.",
    );
  }
  if (answers.installation === "unknown") {
    notices.push(
      "시공 위치는 현장 접근 조건과 유리 종류를 확인한 뒤 내부용·외부용을 확정합니다.",
    );
  }

  return {
    product,
    reason: buildReason(product, answers),
    advantages: [...product.strengths],
    notices,
  };
}

export function verifyAllRecommendationCombinations() {
  const values = {
    space: ["apartment", "house", "office", "store", "hospital", "factory"],
    concern: ["heat", "glare", "energy", "privacy", "safety", "unknown"],
    direction: ["south", "west", "east", "north", "unknown"],
    privacy: ["high", "medium", "none"],
    brightness: ["high", "medium", "low"],
    installation: ["interior", "exterior", "unknown"],
  } as const;

  let checked = 0;
  for (const space of values.space)
    for (const concern of values.concern)
      for (const direction of values.direction)
        for (const privacy of values.privacy)
          for (const brightness of values.brightness)
            for (const installation of values.installation) {
              const result = recommendFilm({
                space,
                concern,
                direction,
                privacy,
                brightness,
                installation,
              });
              if (!result.product) {
                throw new Error("A recommendation combination returned no product.");
              }
              if (
                installation === "exterior" &&
                result.product.installType !== "exterior"
              ) {
                throw new Error("Exterior condition returned an interior product.");
              }
              checked += 1;
            }
  return checked;
}
