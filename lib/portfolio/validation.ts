import type {
  PortfolioImageStage,
  PortfolioSaveInput,
  PortfolioStatus,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedStatuses = new Set<PortfolioStatus>([
  "draft",
  "published",
  "hidden",
]);
const allowedStages = new Set<PortfolioImageStage>([
  "before",
  "during",
  "after",
  "general",
]);

const text = (value: unknown, maxLength: number) =>
  (typeof value === "string" ? value : "").trim().slice(0, maxLength);

const optionalUrl = (value: unknown) => {
  const normalized = text(value, 1000);
  if (!normalized) return "";
  const url = new URL(normalized);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("URL은 http 또는 https 주소만 입력할 수 있습니다.");
  }
  return url.toString();
};

const storagePath = (value: unknown, portfolioId: string) => {
  const normalized = text(value, 500);
  const segments = normalized.split("/");
  if (
    segments.length !== 2 ||
    segments[0] !== portfolioId ||
    !/^[0-9a-f-]+\.webp$/i.test(segments[1])
  ) {
    throw new Error("허용되지 않은 이미지 저장 경로입니다.");
  }
  return normalized;
};

export function validatePortfolioInput(raw: PortfolioSaveInput) {
  const id = text(raw.id, 36);
  if (!UUID_PATTERN.test(id)) throw new Error("포트폴리오 ID가 올바르지 않습니다.");

  const title = text(raw.title, 160);
  if (!title) throw new Error("제목을 입력해주세요.");
  if (!allowedStatuses.has(raw.status)) throw new Error("상태 값이 올바르지 않습니다.");

  const coverImagePath = raw.coverImagePath
    ? storagePath(raw.coverImagePath, id)
    : "";
  if (raw.status === "published" && !coverImagePath) {
    throw new Error("게시하려면 대표 이미지가 필요합니다.");
  }

  const images = raw.images.slice(0, 30).map((image, index) => {
    if (!allowedStages.has(image.stage)) {
      throw new Error("이미지 구분 값이 올바르지 않습니다.");
    }
    return {
      id: image.id && UUID_PATTERN.test(image.id) ? image.id : undefined,
      storage_path: storagePath(image.storage_path, id),
      alt_text: text(image.alt_text, 240) || null,
      stage: image.stage,
      caption: text(image.caption, 500) || null,
      sort_order: Number.isFinite(image.sort_order)
        ? Math.max(0, Math.trunc(image.sort_order))
        : index,
    };
  });
  for (const stage of ["before", "during", "after"] as const) {
    if (images.filter((image) => image.stage === stage).length > 3) {
      throw new Error(`${stage === "before" ? "시공 전" : stage === "during" ? "시공 중" : "시공 후"} 이미지는 최대 3장까지 등록할 수 있습니다.`);
    }
  }

  return {
    id,
    title,
    category: text(raw.category, 80) || null,
    installation_type: text(raw.installationType, 120) || null,
    product: text(raw.product, 120) || null,
    description: text(raw.description, 10000) || null,
    blog_url: optionalUrl(raw.blogUrl) || null,
    youtube_url: optionalUrl(raw.youtubeUrl) || null,
    cover_image_path: coverImagePath || null,
    before_title: text(raw.beforeTitle, 160) || null,
    before_description: text(raw.beforeDescription, 2000) || null,
    during_title: text(raw.duringTitle, 160) || null,
    during_description: text(raw.duringDescription, 2000) || null,
    after_title: text(raw.afterTitle, 160) || null,
    after_description: text(raw.afterDescription, 2000) || null,
    status: raw.status,
    is_featured: raw.isFeatured === true,
    sort_order: Number.isFinite(raw.sortOrder)
      ? Math.trunc(raw.sortOrder)
      : 0,
    tags: Array.from(
      new Set(raw.tags.map((tag) => text(tag, 50)).filter(Boolean)),
    ).slice(0, 20),
    images,
    removedStoragePaths: raw.removedStoragePaths.map((path) =>
      storagePath(path, id),
    ),
  };
}

export const createSlug = (value: string) => {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) return normalized;

  const encoded = Array.from(value.trim())
    .map((character) => character.codePointAt(0)?.toString(36) || "")
    .filter(Boolean)
    .join("-")
    .slice(0, 120);
  return encoded ? `portfolio-${encoded}` : "";
};

export const createPortfolioSlug = (title: string, id: string) => {
  const base = (createSlug(title) || "portfolio").slice(0, 120);
  return `${base}-${id.replace(/-/g, "")}`;
};
