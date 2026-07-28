"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { optimizePortfolioImage } from "../../lib/portfolio/image-processing";
import type {
  PortfolioImage,
  PortfolioImageStage,
  PortfolioItem,
  PortfolioSaveInput,
  PortfolioStatus,
} from "../../lib/portfolio/types";
import { savePortfolioAction } from "../../app/admin/(protected)/portfolio/actions";

type StructuredStage = Exclude<PortfolioImageStage, "general">;
type EditableImage = PortfolioImage & {
  localId: string;
  file?: File;
  previewUrl?: string;
};

const stages: Array<{
  value: StructuredStage;
  label: string;
  titleName: "beforeTitle" | "duringTitle" | "afterTitle";
  descriptionName:
    | "beforeDescription"
    | "duringDescription"
    | "afterDescription";
  defaultTitle: string;
}> = [
  {
    value: "before",
    label: "시공 전",
    titleName: "beforeTitle",
    descriptionName: "beforeDescription",
    defaultTitle: "시공 전",
  },
  {
    value: "during",
    label: "시공 중",
    titleName: "duringTitle",
    descriptionName: "duringDescription",
    defaultTitle: "시공 중",
  },
  {
    value: "after",
    label: "시공 후",
    titleName: "afterTitle",
    descriptionName: "afterDescription",
    defaultTitle: "시공 후",
  },
];

const initialSectionValue = (
  item: PortfolioItem | null | undefined,
  key: (typeof stages)[number]["titleName" | "descriptionName"],
) => {
  const fieldMap = {
    beforeTitle: item?.before_title,
    beforeDescription: item?.before_description,
    duringTitle: item?.during_title,
    duringDescription: item?.during_description,
    afterTitle: item?.after_title,
    afterDescription: item?.after_description,
  };
  return fieldMap[key] || "";
};

export default function PortfolioForm({
  mode,
  portfolioId,
  initialItem,
}: {
  mode: "create" | "edit";
  portfolioId: string;
  initialItem?: PortfolioItem | null;
}) {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(
    initialItem?.cover_public_url || "",
  );
  const [images, setImages] = useState<EditableImage[]>(
    (initialItem?.portfolio_images || []).map((image) => ({
      ...image,
      localId: image.id || crypto.randomUUID(),
    })),
  );
  const [removedStoragePaths, setRemovedStoragePaths] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSubmitting) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, isSubmitting]);

  const structuredImages = useMemo(
    () =>
      [
        ...stages.flatMap(({ value }) =>
          images
            .filter((image) => image.stage === value)
            .map((image, index) => ({ ...image, sort_order: index })),
        ),
        ...images
          .filter((image) => image.stage === "general")
          .map((image, index) => ({ ...image, sort_order: index })),
      ],
    [images],
  );

  const uploadFile = async (file: File) => {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase 연결을 확인해주세요.");
    const optimized = await optimizePortfolioImage(file);
    const path = `${portfolioId}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, optimized.blob, {
        contentType: optimized.contentType,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) throw error;
    return path;
  };

  const selectCover = (file: File | undefined) => {
    if (!file) return;
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const addImages = (stage: StructuredStage, files: FileList | null) => {
    if (!files?.length) return;
    const currentCount = images.filter((image) => image.stage === stage).length;
    const available = Math.max(0, 3 - currentCount);
    const accepted = Array.from(files).slice(0, available);
    if (!accepted.length) {
      setMessage(`${stages.find((item) => item.value === stage)?.label} 이미지는 최대 3장까지 등록할 수 있습니다.`);
      return;
    }
    setImages((current) => [
      ...current,
      ...accepted.map((file, index) => ({
        localId: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        storage_path: "",
        alt_text: "",
        stage,
        caption: "",
        sort_order: currentCount + index,
      })),
    ]);
    if (accepted.length < files.length) {
      setMessage("단계별 이미지는 최대 3장까지만 추가됩니다.");
    } else {
      setMessage("");
    }
    setIsDirty(true);
  };

  const replaceImage = (localId: string, file: File | undefined) => {
    if (!file) return;
    setImages((current) =>
      current.map((image) => {
        if (image.localId !== localId) return image;
        if (image.storage_path) {
          setRemovedStoragePaths((paths) =>
            paths.includes(image.storage_path)
              ? paths
              : [...paths, image.storage_path],
          );
        }
        if (image.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }
        return {
          ...image,
          file,
          storage_path: "",
          previewUrl: URL.createObjectURL(file),
        };
      }),
    );
    setIsDirty(true);
  };

  const removeImage = (localId: string) => {
    setImages((current) => {
      const target = current.find((image) => image.localId === localId);
      if (target?.storage_path) {
        setRemovedStoragePaths((paths) =>
          paths.includes(target.storage_path)
            ? paths
            : [...paths, target.storage_path],
        );
      }
      if (target?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((image) => image.localId !== localId);
    });
    setIsDirty(true);
  };

  const moveImage = (
    stage: StructuredStage,
    index: number,
    direction: -1 | 1,
  ) => {
    const stageImages = images.filter((image) => image.stage === stage);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= stageImages.length) return;
    const currentId = stageImages[index].localId;
    const targetId = stageImages[nextIndex].localId;
    setImages((current) => {
      const currentPosition = current.findIndex(
        (image) => image.localId === currentId,
      );
      const targetPosition = current.findIndex(
        (image) => image.localId === targetId,
      );
      const next = [...current];
      [next[currentPosition], next[targetPosition]] = [
        next[targetPosition],
        next[currentPosition],
      ];
      return next;
    });
    setIsDirty(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const newlyUploaded: string[] = [];
    const pathsToRemove = [...removedStoragePaths];
    setIsSubmitting(true);
    setMessage("");

    try {
      const uploadCount =
        (coverFile ? 1 : 0) +
        structuredImages.filter((image) => image.file).length;
      let completed = 0;
      let coverPath = initialItem?.cover_image_path || "";

      if (coverFile) {
        setProgress(`대표 이미지 처리 중 · ${completed}/${uploadCount}`);
        const nextCoverPath = await uploadFile(coverFile);
        newlyUploaded.push(nextCoverPath);
        completed += 1;
        if (coverPath) pathsToRemove.push(coverPath);
        coverPath = nextCoverPath;
      }

      const savedImages: PortfolioImage[] = [];
      for (const image of structuredImages) {
        let path = image.storage_path;
        if (image.file) {
          setProgress(`이미지 업로드 중 · ${completed}/${uploadCount}`);
          path = await uploadFile(image.file);
          newlyUploaded.push(path);
          completed += 1;
        }
        savedImages.push({
          ...(image.id ? { id: image.id } : {}),
          storage_path: path,
          alt_text: image.alt_text,
          stage: image.stage,
          caption: image.caption,
          sort_order: image.sort_order,
        });
      }

      const input: PortfolioSaveInput = {
        id: portfolioId,
        title: String(formData.get("title") || ""),
        category: String(formData.get("category") || ""),
        installationType: String(formData.get("installationType") || ""),
        product: String(formData.get("product") || ""),
        description: String(formData.get("description") || ""),
        blogUrl: String(formData.get("blogUrl") || ""),
        youtubeUrl: String(formData.get("youtubeUrl") || ""),
        coverImagePath: coverPath,
        beforeTitle: String(formData.get("beforeTitle") || ""),
        beforeDescription: String(
          formData.get("beforeDescription") || "",
        ),
        duringTitle: String(formData.get("duringTitle") || ""),
        duringDescription: String(
          formData.get("duringDescription") || "",
        ),
        afterTitle: String(formData.get("afterTitle") || ""),
        afterDescription: String(formData.get("afterDescription") || ""),
        status: String(formData.get("status") || "draft") as PortfolioStatus,
        isFeatured: formData.get("isFeatured") === "on",
        sortOrder: Number(formData.get("sortOrder") || 0),
        tags: String(formData.get("tags") || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: savedImages,
        removedStoragePaths: Array.from(new Set(pathsToRemove)),
      };

      setProgress("포트폴리오 저장 중...");
      const result = await savePortfolioAction(mode, input);
      if (!result.success) throw new Error(result.error);

      setIsDirty(false);
      setProgress("");
      if (result.warning) {
        setMessage(result.warning);
        router.refresh();
        return;
      }
      router.push("/admin/portfolio");
      router.refresh();
    } catch (error) {
      if (newlyUploaded.length) {
        const supabase = createClient();
        await supabase?.storage.from("portfolio-images").remove(newlyUploaded);
      }
      setMessage(
        error instanceof Error ? error.message : "저장에 실패했습니다.",
      );
      setProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="admin-portfolio-form"
      onSubmit={handleSubmit}
      onChange={() => setIsDirty(true)}
    >
      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div>
            <span className="admin-form-step">STEP 1</span>
            <h2>기본 정보</h2>
          </div>
          <span>* 필수 입력</span>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field-full">
            <span>제목 *</span>
            <input
              name="title"
              required
              maxLength={160}
              defaultValue={initialItem?.title || ""}
            />
          </label>
          <label>
            <span>카테고리</span>
            <select
              name="category"
              defaultValue={initialItem?.category || "home"}
            >
              <option value="home">주거</option>
              <option value="office">사무실</option>
              <option value="factory">공장</option>
              <option value="public">관공서</option>
              <option value="school">학교</option>
              <option value="store">상가</option>
            </select>
          </label>
          <label>
            <span>공간</span>
            <input
              name="installationType"
              defaultValue={initialItem?.installation_type || ""}
              placeholder="예: 아파트 · 거실/베란다"
            />
            <small>공개 상세 화면의 공간 배너에 표시됩니다.</small>
          </label>
          <label>
            <span>사용 제품</span>
            <input
              name="product"
              defaultValue={initialItem?.product || ""}
              placeholder="예: PG PRO 1590"
            />
          </label>
          <label className="admin-field-full">
            <span>상세 설명</span>
            <textarea
              name="description"
              rows={7}
              maxLength={10000}
              defaultValue={initialItem?.description || ""}
            />
          </label>
          <label className="admin-field-full">
            <span>태그</span>
            <input
              name="tags"
              defaultValue={(initialItem?.tags || []).join(", ")}
              placeholder="사무실, 열차단, PG AIR"
            />
            <small>쉼표로 구분해주세요.</small>
          </label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div>
            <span className="admin-form-step">STEP 2</span>
            <h2>외부 링크</h2>
          </div>
          <span>입력한 버튼만 공개됩니다.</span>
        </div>
        <div className="admin-form-grid">
          <label>
            <span>블로그 URL</span>
            <input
              type="url"
              inputMode="url"
              name="blogUrl"
              placeholder="https://blog.naver.com/..."
              defaultValue={initialItem?.blog_url || ""}
            />
          </label>
          <label>
            <span>유튜브 URL</span>
            <input
              type="url"
              inputMode="url"
              name="youtubeUrl"
              placeholder="https://www.youtube.com/..."
              defaultValue={initialItem?.youtube_url || ""}
            />
          </label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div>
            <span className="admin-form-step">STEP 3</span>
            <h2>대표 이미지</h2>
          </div>
          <span>1장 · 자동 WebP 변환 · 최대 1920px</span>
        </div>
        <label className="admin-upload-field">
          <span>대표 이미지</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => selectCover(event.target.files?.[0])}
          />
          {coverPreview && (
            <img
              src={coverPreview}
              alt={
                initialItem?.cover_image_alt_text || "대표 이미지 미리보기"
              }
            />
          )}
        </label>
      </section>

      {stages.map((stage, stageIndex) => {
        const stageImages = images.filter(
          (image) => image.stage === stage.value,
        );
        const step = stageIndex + 4;
        return (
          <section className="admin-form-section admin-stage-section" key={stage.value}>
            <div className="admin-form-section-head">
              <div>
                <span className="admin-form-step">STEP {step}</span>
                <h2>{stage.label}</h2>
              </div>
              <span className="admin-image-count">
                {stageImages.length}/3
              </span>
            </div>
            <div className="admin-form-grid admin-stage-copy">
              <label className="admin-field-full">
                <span>{stage.label} 제목</span>
                <input
                  name={stage.titleName}
                  maxLength={160}
                  defaultValue={
                    initialSectionValue(initialItem, stage.titleName) ||
                    stage.defaultTitle
                  }
                />
              </label>
              <label className="admin-field-full">
                <span>{stage.label} 설명</span>
                <textarea
                  name={stage.descriptionName}
                  rows={4}
                  maxLength={2000}
                  defaultValue={initialSectionValue(
                    initialItem,
                    stage.descriptionName,
                  )}
                />
              </label>
            </div>
            <label
              className={`admin-upload-field admin-stage-upload ${
                stageImages.length >= 3 ? "is-disabled" : ""
              }`}
            >
              <span>{stage.label} 이미지 추가</span>
              <small>JPG, PNG, WebP · 최대 {3 - stageImages.length}장 추가 가능</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={stageImages.length >= 3}
                onChange={(event) => {
                  addImages(stage.value, event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <div className="admin-image-editor-list">
              {stageImages.map((image, index) => (
                <article className="admin-image-editor" key={image.localId}>
                  {(image.previewUrl || image.public_url) && (
                    <img
                      src={image.previewUrl || image.public_url}
                      alt={image.alt_text || ""}
                    />
                  )}
                  <div>
                    <span className="admin-image-order">이미지 {index + 1}</span>
                  </div>
                  <div className="admin-image-actions">
                    <button
                      type="button"
                      onClick={() => moveImage(stage.value, index, -1)}
                      disabled={index === 0}
                      aria-label={`${stage.label} 이미지 ${index + 1} 앞으로 이동`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(stage.value, index, 1)}
                      disabled={index === stageImages.length - 1}
                      aria-label={`${stage.label} 이미지 ${index + 1} 뒤로 이동`}
                    >
                      ↓
                    </button>
                    <label className="admin-image-replace">
                      교체
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          replaceImage(
                            image.localId,
                            event.target.files?.[0],
                          );
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => removeImage(image.localId)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="admin-form-section">
        <div className="admin-form-section-head">
          <div>
            <span className="admin-form-step">STEP 7</span>
            <h2>게시 설정</h2>
          </div>
          <span>저장 후 홈페이지에 반영됩니다.</span>
        </div>
        <div className="admin-form-grid">
          <label>
            <span>상태</span>
            <select name="status" defaultValue={initialItem?.status || "draft"}>
              <option value="draft">임시저장</option>
              <option value="published">게시</option>
              <option value="hidden">숨김</option>
            </select>
          </label>
          <label>
            <span>노출 순서</span>
            <input
              type="number"
              name="sortOrder"
              defaultValue={initialItem?.sort_order || 0}
            />
          </label>
          <label className="admin-feature-toggle admin-field-full">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initialItem?.is_featured === true}
            />
            <span>
              <strong>메인 대표 노출</strong>
              <small>메인 홈페이지에 노출합니다. 최대 6개까지 선택할 수 있습니다.</small>
            </span>
          </label>
        </div>
      </section>

      {(message || progress) && (
        <p
          className={message ? "admin-data-error" : "admin-save-progress"}
          role="status"
        >
          {message || progress}
        </p>
      )}
      <div className="admin-form-actions">
        <Link href="/admin/portfolio">취소</Link>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
