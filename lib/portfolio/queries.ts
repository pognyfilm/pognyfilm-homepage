import { createClient } from "../supabase/server";
import type { PortfolioImage, PortfolioItem } from "./types";

const BUCKET = "portfolio-images";

async function attachPublicUrls(items: PortfolioItem[]) {
  const supabase = await createClient();
  if (!supabase) return items;

  const publicUrl = (path: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  return items.map((item) => ({
    ...item,
    cover_public_url: item.cover_image_path
      ? publicUrl(item.cover_image_path)
      : undefined,
    portfolio_images: (item.portfolio_images || []).map((image) => ({
      ...image,
      public_url: publicUrl(image.storage_path),
    })),
  }));
}

const normalizeItem = (row: Record<string, unknown>): PortfolioItem => {
  const tagLinks = (row.portfolio_item_tags || []) as Array<{
    portfolio_tags: { name: string } | Array<{ name: string }> | null;
  }>;
  const tags = tagLinks
    .flatMap((link) =>
      Array.isArray(link.portfolio_tags)
        ? link.portfolio_tags.map((tag) => tag.name)
        : link.portfolio_tags?.name
          ? [link.portfolio_tags.name]
          : [],
    )
    .filter(Boolean);

  return {
    ...(row as unknown as PortfolioItem),
    portfolio_images: (
      (row.portfolio_images as PortfolioImage[] | undefined) || []
    ).sort((a, b) => a.sort_order - b.sort_order),
    tags,
  };
};

const portfolioSelect = `
  *,
  portfolio_images (
    id,
    storage_path,
    alt_text,
    stage,
    caption,
    sort_order
  ),
  portfolio_item_tags (
    portfolio_tags (name)
  )
`;

export async function getAdminPortfolioItems() {
  const supabase = await createClient();
  if (!supabase) {
    return { items: [] as PortfolioItem[], error: "Supabase 연결이 필요합니다." };
  }
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(portfolioSelect)
    .order("updated_at", { ascending: false });
  if (error) return { items: [] as PortfolioItem[], error: error.message };
  return {
    items: await attachPublicUrls(
      (data || []).map((row) => normalizeItem(row as Record<string, unknown>)),
    ),
    error: null,
  };
}

export async function getAdminPortfolioItem(id: string) {
  const supabase = await createClient();
  if (!supabase) return { item: null, error: "Supabase 연결이 필요합니다." };
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(portfolioSelect)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    return { item: null, error: error?.message || "포트폴리오를 찾을 수 없습니다." };
  }
  const [item] = await attachPublicUrls([
    normalizeItem(data as Record<string, unknown>),
  ]);
  return { item, error: null };
}

export async function getPublishedPortfolioItems() {
  const supabase = await createClient();
  if (!supabase) return { items: null, error: "Supabase 연결이 필요합니다." };
  const { data, error } = await supabase
    .from("portfolio_items")
    .select(portfolioSelect)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  if (error) return { items: null, error: error.message };
  return {
    items: await attachPublicUrls(
      (data || []).map((row) => normalizeItem(row as Record<string, unknown>)),
    ),
    error: null,
  };
}

export async function getPortfolioDashboardData() {
  const supabase = await createClient();
  if (!supabase) {
    return {
      counts: { published: null, draft: null, hidden: null },
      recent: [] as PortfolioItem[],
      error: "Supabase 연결이 필요합니다.",
    };
  }

  const statuses = ["published", "draft", "hidden"] as const;
  const countResults = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("portfolio_items")
        .select("*", { count: "exact", head: true })
        .eq("status", status),
    ),
  );
  const { data: recentData, error: recentError } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(5);
  const firstError =
    countResults.find((result) => result.error)?.error || recentError;

  return {
    counts: {
      published: countResults[0].count,
      draft: countResults[1].count,
      hidden: countResults[2].count,
    },
    recent: (recentData || []).map((row) =>
      normalizeItem(row as Record<string, unknown>),
    ),
    error: firstError?.message || null,
  };
}
