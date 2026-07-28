export type FilmProduct = {
  id: "air" | "x" | "pro" | "xo";
  name: string;
  code: string;
  installType: "interior" | "exterior";
  recommendedSpaces: string[];
  glassTypes: string[];
  visibleLight: string;
  uvBlocking: string;
  heatPerformance: string;
  brightness: "bright" | "balanced" | "dark";
  privacy: "low" | "medium" | "high";
  glareReduction: "medium" | "high";
  safety: boolean;
  warranty: string;
  caseLabel: string;
  image: string;
  tagline: string;
  priority: number;
  summary: string;
  strengths: string[];
};

export const GLASS_TYPES = {
  single: "단판유리",
  double: "복층유리",
  lowE: "로이유리",
  tempered: "강화유리",
} as const;

export const PG_FILM_PRODUCTS: FilmProduct[] = [
  {
    id: "air",
    name: "PG AIR FILM",
    code: "PG AIR",
    installType: "interior",
    recommendedSpaces: ["home"],
    glassTypes: ["single", "double", "lowE", "tempered"],
    visibleLight: "밝은 실내감과 조망 유지 중심",
    uvBlocking: "자외선 차단율 99%",
    heatPerformance: "열차단율 99%",
    brightness: "bright",
    privacy: "low",
    glareReduction: "medium",
    safety: false,
    warranty: "최대 10년 정품 품질보증서",
    caseLabel: "주거공간 밝은 조망 라인",
    image: "/assets/product-pg-air.webp",
    tagline: "Bright Comfort",
    priority: 3,
    summary: "밝은 조망을 유지하면서 열과 자외선을 줄이고 싶은 주거 공간에 적합합니다.",
    strengths: ["밝은 실내감 유지", "자외선 99% 차단", "주거공간 추천"],
  },
  {
    id: "x",
    name: "PG X FILM",
    code: "PG X",
    installType: "interior",
    recommendedSpaces: ["office", "store", "home"],
    glassTypes: ["single", "double", "lowE", "tempered"],
    visibleLight: "밝기와 차분한 사용감의 균형",
    uvBlocking: "자외선 차단율 99%",
    heatPerformance: "열차단율 98%",
    brightness: "balanced",
    privacy: "medium",
    glareReduction: "medium",
    safety: false,
    warranty: "최대 10년 정품 품질보증서",
    caseLabel: "사무실·매장 밸런스 라인",
    image: "/assets/product-pg-x.webp",
    tagline: "Premium Balance",
    priority: 2,
    summary: "열차단, 눈부심, 프라이버시, 시야의 균형을 원하는 공간에 적합합니다.",
    strengths: ["텅스텐 스퍼터링", "자연스러운 반사감", "업무공간 추천"],
  },
  {
    id: "pro",
    name: "PG PRO FILM",
    code: "PG PRO",
    installType: "interior",
    recommendedSpaces: ["office", "store", "factory", "public"],
    glassTypes: ["single", "double", "lowE", "tempered"],
    visibleLight: "강한 햇빛과 큰 유리면 대응",
    uvBlocking: "자외선 차단율 99%",
    heatPerformance: "열차단율 90%",
    brightness: "dark",
    privacy: "medium",
    glareReduction: "high",
    safety: false,
    warranty: "최대 10년 정품 품질보증서",
    caseLabel: "대형 유리·강한 일사 대응 라인",
    image: "/assets/product-pg-pro.webp",
    tagline: "Professional Grade",
    priority: 1,
    summary: "강한 햇빛과 눈부심이 큰 대형 유리 공간에 적합합니다.",
    strengths: ["나노 세라믹 메탈", "강한 눈부심 감소", "상업·공공공간 추천"],
  },
  {
    id: "xo",
    name: "PG XO FILM",
    code: "PG XO",
    installType: "exterior",
    recommendedSpaces: ["office", "store", "factory", "public"],
    glassTypes: ["single", "double", "lowE", "tempered"],
    visibleLight: "외부 전용 프라이버시와 열 관리",
    uvBlocking: "자외선 차단율 99%",
    heatPerformance: "열차단율 98%",
    brightness: "balanced",
    privacy: "high",
    glareReduction: "high",
    safety: false,
    warranty: "최대 10년 정품 품질보증서",
    caseLabel: "외부 전용 스퍼터링 라인",
    image: "/assets/product-pg-xo.webp",
    tagline: "Premium Privacy",
    priority: 0,
    summary: "실내 접근이 어렵거나 외부 유리면에서 열을 먼저 제어해야 하는 공간에 적합합니다.",
    strengths: ["외부 전용 시공", "3.5MIL 하드코팅 구조", "대형 통유리 추천"],
  },
];
