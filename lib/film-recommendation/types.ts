import type { FilmProduct } from "../../app/film-recommendation-data";

export type RecommendationQuestionKey =
  | "space"
  | "concern"
  | "direction"
  | "privacy"
  | "brightness"
  | "installation";

export type RecommendationAnswers = Record<RecommendationQuestionKey, string>;

export type RecommendationOption = {
  value: string;
  label: string;
};

export type RecommendationQuestion = {
  key: RecommendationQuestionKey;
  title: string;
  shortLabel: string;
  options: RecommendationOption[];
};

export type FilmRecommendation = {
  product: FilmProduct;
  reason: string;
  advantages: string[];
  notices: string[];
};
