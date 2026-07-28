"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../../../lib/auth/require-admin";
import { createClient } from "../../../../lib/supabase/server";
import type {
  PortfolioSaveInput,
  PortfolioStatus,
} from "../../../../lib/portfolio/types";
import {
  createPortfolioSlug,
  createSlug,
  validatePortfolioInput,
} from "../../../../lib/portfolio/validation";

type ActionResult =
  | { success: true; warning?: string }
  | { success: false; error: string };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertPortfolioId = (id: string) => {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("포트폴리오 ID가 올바르지 않습니다.");
  }
};

const assertOwnedPaths = (portfolioId: string, paths: string[]) => {
  if (paths.some((path) => !path.startsWith(`${portfolioId}/`))) {
    throw new Error("다른 포트폴리오의 이미지 경로는 삭제할 수 없습니다.");
  }
};

async function getContext() {
  const session = await requireAdmin();
  const supabase = await createClient();
  if (session.status !== "authorized" || !supabase) {
    throw new Error("관리자 인증 연결을 확인해주세요.");
  }
  return { session, supabase };
}

const refreshPortfolio = () => {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/portfolio");
};

async function resolveTagIds(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  tags: string[],
) {
  if (!tags.length) return [] as string[];

  const tagRows = tags.map((name) => ({
    name,
    slug: createSlug(name) || crypto.randomUUID(),
  }));
  const { error: tagError } = await supabase
    .from("portfolio_tags")
    .upsert(tagRows, { onConflict: "name", ignoreDuplicates: true });
  if (tagError) throw tagError;

  const { data: savedTags, error: selectError } = await supabase
    .from("portfolio_tags")
    .select("id,name")
    .in("name", tags);
  if (selectError) throw selectError;

  return (savedTags || []).map((tag) => String(tag.id));
}

export async function savePortfolioAction(
  mode: "create" | "edit",
  rawInput: PortfolioSaveInput,
): Promise<ActionResult> {
  try {
    const input = validatePortfolioInput(rawInput);
    const { session, supabase } = await getContext();
    const now = new Date().toISOString();

    if (input.is_featured) {
      const { count, error: featuredCountError } = await supabase
        .from("portfolio_items")
        .select("id", { count: "exact", head: true })
        .eq("is_featured", true)
        .neq("id", input.id);
      if (featuredCountError) throw featuredCountError;
      if ((count || 0) >= 6) {
        throw new Error("대표 노출은 최대 6개까지 선택할 수 있습니다.");
      }
    }

    const item = {
      id: input.id,
      title: input.title,
      category: input.category,
      installation_type: input.installation_type,
      product: input.product,
      description: input.description,
      blog_url: input.blog_url,
      youtube_url: input.youtube_url,
      cover_image_path: input.cover_image_path,
      before_title: input.before_title,
      before_description: input.before_description,
      during_title: input.during_title,
      during_description: input.during_description,
      after_title: input.after_title,
      after_description: input.after_description,
      status: input.status,
      is_featured: input.is_featured,
      sort_order: input.sort_order,
      published_at: input.status === "published" ? now : null,
      updated_by: session.user.id,
    };

    const itemQuery =
      mode === "create"
        ? supabase.from("portfolio_items").insert({
            ...item,
            slug: createPortfolioSlug(input.title, input.id),
            created_by: session.user.id,
          })
        : supabase.from("portfolio_items").update(item).eq("id", input.id);
    const { error: itemError } = await itemQuery;
    if (itemError) throw itemError;

    const tagIds = await resolveTagIds(supabase, input.tags);
    const { error: childrenError } = await supabase.rpc(
      "replace_portfolio_children",
      {
        target_portfolio_id: input.id,
        image_rows: input.images,
        tag_ids: tagIds,
      },
    );
    if (childrenError) throw childrenError;

    let warning: string | undefined;
    if (input.removedStoragePaths.length) {
      assertOwnedPaths(input.id, input.removedStoragePaths);
      const { error: storageError } = await supabase.storage
        .from("portfolio-images")
        .remove(input.removedStoragePaths);
      if (storageError) {
        console.error("[Portfolio old image cleanup failed]", storageError);
        warning =
          "포트폴리오는 저장되었지만 기존 이미지 파일 정리에 실패했습니다. 잠시 후 다시 시도해주세요.";
      }
    }

    refreshPortfolio();
    return { success: true, ...(warning ? { warning } : {}) };
  } catch (error) {
    console.error("[Portfolio save failed]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "포트폴리오 저장에 실패했습니다.",
    };
  }
}

export async function changePortfolioStatusAction(
  id: string,
  status: PortfolioStatus,
): Promise<ActionResult> {
  try {
    assertPortfolioId(id);
    if (!["published", "hidden", "draft"].includes(status)) {
      throw new Error("상태 값이 올바르지 않습니다.");
    }
    const { session, supabase } = await getContext();
    const { error } = await supabase
      .from("portfolio_items")
      .update({
        status,
        updated_by: session.user.id,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) throw error;
    refreshPortfolio();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
    };
  }
}

export async function deletePortfolioAction(id: string): Promise<ActionResult> {
  try {
    assertPortfolioId(id);
    const { session, supabase } = await getContext();
    if (session.profile.role !== "admin") {
      throw new Error("삭제는 관리자만 할 수 있습니다.");
    }

    const { data: item, error: readError } = await supabase
      .from("portfolio_items")
      .select("cover_image_path,portfolio_images(storage_path)")
      .eq("id", id)
      .single();
    if (readError) throw readError;

    const paths = Array.from(
      new Set(
        [
          item.cover_image_path,
          ...((item.portfolio_images || []) as Array<{ storage_path: string }>).map(
            (image) => image.storage_path,
          ),
        ].filter(Boolean) as string[],
      ),
    );
    assertOwnedPaths(id, paths);

    const { error: deleteError } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    let warning: string | undefined;
    if (paths.length) {
      const { error: storageError } = await supabase.storage
        .from("portfolio-images")
        .remove(paths);
      if (storageError) {
        console.error("[Portfolio deleted image cleanup failed]", storageError);
        warning =
          "포트폴리오는 삭제되었지만 이미지 파일 정리에 실패했습니다. Storage에서 해당 UUID 경로를 확인해주세요.";
      }
    }

    refreshPortfolio();
    return { success: true, ...(warning ? { warning } : {}) };
  } catch (error) {
    console.error("[Portfolio delete failed]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "삭제에 실패했습니다.",
    };
  }
}
