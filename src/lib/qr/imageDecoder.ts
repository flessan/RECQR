import jsQR from "jsqr";

export type ImageSource =
  | File
  | Blob
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | ImageData
  | string; // data URL / object URL

export interface DecodeOptions {
  /** Largest dimension (px) used when downscaling before decoding. */
  maxDimension?: number;
  /** Try grayscale + contrast passes before giving up. */
  preprocess?: boolean;
}

export interface DecodeResult {
  data: string;
  /** Width/height of the image data that produced the match. */
  width: number;
  height: number;
}

/**
 * One reusable QR decoding pipeline for uploads, drag-and-drop, clipboard
 * paste and programmatic callers. All inputs are normalized to an
 * HTMLImageElement/ImageBitmap then drawn to a canvas and decoded with jsQR.
 *
 * Everything runs in the browser. No bytes leave the device.
 */
export async function decodeQrFromImage(
  source: ImageSource,
  options: DecodeOptions = {}
): Promise<DecodeResult | null> {
  const maxDim = options.maxDimension ?? 1600;
  const preprocess = options.preprocess ?? true;

  let drawable: Drawable;
  try {
    drawable = await toDrawable(source);
  } catch {
    return null;
  }
  const { width, height, draw } = drawable;
  if (!width || !height) return null;

  // Cap the working resolution to avoid huge allocations on 12 MP photos.
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  draw(ctx, targetW, targetH);

  // 1. Straight decode at full downscaled size.
  let imageData = ctx.getImageData(0, 0, targetW, targetH);
  let found = jsQR(imageData.data, targetW, targetH, {
    inversionAttempts: "attemptBoth",
  });
  if (found?.data) {
    return { data: found.data, width: targetW, height: targetH };
  }

  if (!preprocess) return null;

  // 2. Try several scale/crop strategies for partially-visible codes.
  const strategies = [0.75, 0.5, 1.5];
  for (const s of strategies) {
    const w = Math.max(1, Math.round(targetW * s));
    const h = Math.max(1, Math.round(targetH * s));
    if (w > maxDim || h > maxDim) continue;
    canvas.width = w;
    canvas.height = h;
    draw(ctx, w, h);
    imageData = ctx.getImageData(0, 0, w, h);
    found = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
    if (found?.data) return { data: found.data, width: w, height: h };
  }

  // 3. Center crop (helps when QR sits in the middle of a large photo).
  const full = document.createElement("canvas");
  full.width = targetW;
  full.height = targetH;
  const fctx = full.getContext("2d", { willReadFrequently: true });
  if (fctx) {
    draw(fctx, targetW, targetH);
    for (const ratio of [0.6, 0.4]) {
      const cw = Math.round(targetW * ratio);
      const ch = Math.round(targetH * ratio);
      const sx = (targetW - cw) / 2;
      const sy = (targetH - ch) / 2;
      canvas.width = cw;
      canvas.height = ch;
      ctx.drawImage(full, sx, sy, cw, ch, 0, 0, cw, ch);
      imageData = ctx.getImageData(0, 0, cw, ch);
      found = jsQR(imageData.data, cw, ch, { inversionAttempts: "attemptBoth" });
      if (found?.data) return { data: found.data, width: cw, height: ch };
    }
  }

  // 4. Grayscale + contrast enhancement.
  canvas.width = targetW;
  canvas.height = targetH;
  draw(ctx, targetW, targetH);
  imageData = ctx.getImageData(0, 0, targetW, targetH);
  enhanceContrast(imageData);
  found = jsQR(imageData.data, targetW, targetH, {
    inversionAttempts: "attemptBoth",
  });
  if (found?.data) {
    return { data: found.data, width: targetW, height: targetH };
  }

  return null;
}

interface Drawable {
  width: number;
  height: number;
  draw: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dx?: number,
    dy?: number
  ) => void;
}

async function toDrawable(source: ImageSource): Promise<Drawable> {
  if (typeof source === "string") {
    const img = await loadImage(source);
    return imageDrawable(img);
  }
  if (source instanceof File || source instanceof Blob) {
    const url = URL.createObjectURL(source);
    try {
      const img = await loadImage(url);
      return imageDrawable(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
    return imageDrawable(source);
  }
  if (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) {
    return {
      width: source.width,
      height: source.height,
      draw: (ctx, w, h, dx = 0, dy = 0) =>
        ctx.drawImage(source, dx, dy, w, h),
    };
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return {
      width: source.width,
      height: source.height,
      draw: (ctx, w, h, dx = 0, dy = 0) =>
        ctx.drawImage(source, dx, dy, w, h),
    };
  }
  if (source instanceof ImageData) {
    return {
      width: source.width,
      height: source.height,
      draw: (ctx) => {
        ctx.putImageData(source, 0, 0);
      },
    };
  }
  // Fallback: attempt to treat as image-like with a src.
  if (source && typeof (source as HTMLImageElement).src === "string") {
    const img = await loadImage((source as HTMLImageElement).src);
    return imageDrawable(img);
  }
  return { width: 0, height: 0, draw: () => undefined };
}

function imageDrawable(img: HTMLImageElement): Drawable {
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (ctx, w, h, dx = 0, dy = 0) => ctx.drawImage(img, dx, dy, w, h),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Image load timed out"));
      }
    }, 4000);
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error("Invalid or unreadable image"));
    };
    img.src = src;
  });
}

/** Simple contrast stretch on the luminance channel. */
function enhanceContrast(imageData: ImageData) {
  const d = imageData.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  const range = max - min || 1;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.max(0, Math.min(255, ((lum - min) / range) * 255));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
}

/** Extract the first image/* Blob from a ClipboardEvent. */
export function blobFromClipboard(
  e: ClipboardEvent
): { blob: Blob; name: string } | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const blob = item.getAsFile();
      if (blob) return { blob, name: blob.name || "clipboard.png" };
    }
  }
  return null;
}

/** Extract an image File from a DragEvent (first image/* found). */
export function fileFromDragEvent(e: DragEvent): File | null {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return null;
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith("image/")) return files[i];
  }
  return null;
}
