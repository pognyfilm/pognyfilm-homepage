const MAX_SIZE = 10 * 1024 * 1024;
const MAX_EDGE = 1920;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function optimizePortfolioImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`${file.name}: JPG, PNG, WebP 파일만 업로드할 수 있습니다.`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`${file.name}: 이미지 크기는 10MB 이하여야 합니다.`);
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error("이미지를 처리할 수 없습니다.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("WebP 변환에 실패했습니다.")),
      "image/webp",
      0.83,
    );
  });

  return {
    blob,
    width,
    height,
    extension: "webp",
    contentType: "image/webp",
  };
}
