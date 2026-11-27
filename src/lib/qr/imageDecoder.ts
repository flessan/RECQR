import jsQR from "jsqr";

export type ImageSource =
  | File
  | Blob
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | ImageData
  | string;

export interface DecodeOptions {
  /** Largest working dimension. The source is never enlarged beyond this cap. */
  maxDimension?: number;
  /** Enable crop and contrast passes after the fast full-image decode. */
  preprocess?: boolean;
}

export interface DecodeResult {
  data: string;
  width: number;
  height: number;
}

interface Drawable {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  dispose?: () => void;
}

interface NativeBarcodeResult {
  rawValue: string;
  format?: string;
}

interface NativeBarcodeDetector {
  detect(source: HTMLCanvasElement): Promise<NativeBarcodeResult[]>;
}

interface NativeBarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): NativeBarcodeDetector;
}

/**
 * A bounded, local-only decoding pipeline:
 * 1. Fast full-image decode.
 * 2. Native QR detection where available.
 * 3. Inversion and alternate image scales.
 * 4. Nine overlapping crop windows for small or off-centre codes.
 * 5. Grayscale/contrast recovery as a final pass.
 *
 * No image bytes are uploaded or sent to a remote service.
 */
export async function decodeQrFromImage(
  source: ImageSource,
  options: DecodeOptions = {}
): Promise<DecodeResult | null> {
  const maxDimension = Math.max(256, Math.min(options.maxDimension ?? 2000, 4096));
  const preprocess = options.preprocess ?? true;

  let drawable: Drawable;
  try {
    drawable = await toDrawable(source);
  } catch {
    return null;
  }

  try {
    const { width, height } = drawable;
    if (!width || !height) return null;

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    drawable.draw(context, targetWidth, targetHeight);

    let data = decodeCanvas(context, targetWidth, targetHeight);
    if (data) return { data, width: targetWidth, height: targetHeight };
    if (!preprocess) return null;

    // Native BarcodeDetector is an optional enhancement. A short timeout keeps
    // it from holding up the local jsQR fallback on slower browser engines.
    data = await detectWithNativeBarcodeDetector(canvas);
    if (data) return { data, width: targetWidth, height: targetHeight };

    data = decodeCanvas(context, targetWidth, targetHeight, true);
    if (data) return { data, width: targetWidth, height: targetHeight };

    // Alternate sampling scales can recover codes blurred by image resizing.
    for (const ratio of [0.75, 0.5]) {
      const scaledWidth = Math.max(1, Math.round(targetWidth * ratio));
      const scaledHeight = Math.max(1, Math.round(targetHeight * ratio));
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = scaledWidth;
      scaledCanvas.height = scaledHeight;
      const scaledContext = scaledCanvas.getContext("2d", { willReadFrequently: true });
      if (!scaledContext) continue;
      drawable.draw(scaledContext, scaledWidth, scaledHeight);
      data = decodeCanvas(scaledContext, scaledWidth, scaledHeight, true);
      if (data) return { data, width: scaledWidth, height: scaledHeight };
    }

    // Keep one copy at the original working resolution for the crop passes.
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = targetWidth;
    fullCanvas.height = targetHeight;
    const fullContext = fullCanvas.getContext("2d", { willReadFrequently: true });
    if (!fullContext) return null;
    drawable.draw(fullContext, targetWidth, targetHeight);

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = targetWidth;
    cropCanvas.height = targetHeight;
    const cropContext = cropCanvas.getContext("2d", { willReadFrequently: true });
    if (!cropContext) return null;

    // Overlapping windows cover the centre, edges and corners. Scaling each
    // crop back to the working canvas makes a QR in a busy screenshot easier
    // for the decoder to isolate.
    const cropRatio = 0.72;
    const cropWidth = Math.max(1, Math.round(targetWidth * cropRatio));
    const cropHeight = Math.max(1, Math.round(targetHeight * cropRatio));
    const offsets = [0, 0.14, 0.28];

    for (const yRatio of offsets) {
      for (const xRatio of offsets) {
        const sx = Math.min(targetWidth - cropWidth, Math.round(targetWidth * xRatio));
        const sy = Math.min(targetHeight - cropHeight, Math.round(targetHeight * yRatio));
        cropContext.clearRect(0, 0, targetWidth, targetHeight);
        cropContext.drawImage(
          fullCanvas,
          sx,
          sy,
          cropWidth,
          cropHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );
        data = decodeCanvas(cropContext, targetWidth, targetHeight, true);
        if (data) return { data, width: targetWidth, height: targetHeight };
      }
    }

    // Final recovery pass for faded or low-contrast screenshots.
    cropContext.clearRect(0, 0, targetWidth, targetHeight);
    cropContext.drawImage(fullCanvas, 0, 0);
    const imageData = cropContext.getImageData(0, 0, targetWidth, targetHeight);
    enhanceContrast(imageData);
    const result = jsQR(imageData.data, targetWidth, targetHeight, {
      inversionAttempts: "attemptBoth",
    });
    return result?.data
      ? { data: result.data, width: targetWidth, height: targetHeight }
      : null;
  } catch {
    // Malformed images and memory-constrained canvas implementations fail cleanly.
    return null;
  } finally {
    drawable.dispose?.();
  }
}

async function detectWithNativeBarcodeDetector(
  canvas: HTMLCanvasElement
): Promise<string | null> {
  const Detector = (
    globalThis as typeof globalThis & {
      BarcodeDetector?: NativeBarcodeDetectorConstructor;
    }
  ).BarcodeDetector;
  if (!Detector) return null;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const detector = new Detector({ formats: ["qr_code"] });
    const detection = detector.detect(canvas);
    const timeout = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => resolve(null), 650);
    });
    const results = await Promise.race([detection, timeout]);
    if (!results) return null;
    return results.find((item) => item.format === "qr_code" && item.rawValue)?.rawValue ?? null;
  } catch {
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function decodeCanvas(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  attemptBothInversions = false
): string | null {
  try {
    const imageData = context.getImageData(0, 0, width, height);
    const result = jsQR(imageData.data, width, height, {
      inversionAttempts: attemptBothInversions ? "attemptBoth" : "dontInvert",
    });
    return result?.data ?? null;
  } catch {
    return null;
  }
}

async function toDrawable(source: ImageSource): Promise<Drawable> {
  if (typeof source === "string") {
    const image = await loadImage(source);
    return imageDrawable(image);
  }

  if (typeof Blob !== "undefined" && source instanceof Blob) {
    // Reject known non-image MIME types before asking browser decoders to open them.
    // Some browser test environments do not settle createImageBitmap for text blobs.
    if (source.type && !source.type.toLowerCase().startsWith("image/")) {
      throw new Error("Source is not an image");
    }

    // ImageBitmap avoids an object-URL decode round trip on modern browsers.
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(source);
        return {
          width: bitmap.width,
          height: bitmap.height,
          draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height),
          dispose: () => bitmap.close(),
        };
      } catch {
        // Continue with the HTMLImageElement fallback.
      }
    }

    const url = URL.createObjectURL(source);
    try {
      const image = await loadImage(url);
      return imageDrawable(image);
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
      draw: (context, width, height) => context.drawImage(source, 0, 0, width, height),
    };
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return {
      width: source.width,
      height: source.height,
      draw: (context, width, height) => context.drawImage(source, 0, 0, width, height),
    };
  }
  if (typeof ImageData !== "undefined" && source instanceof ImageData) {
    const stagingCanvas = document.createElement("canvas");
    stagingCanvas.width = source.width;
    stagingCanvas.height = source.height;
    const stagingContext = stagingCanvas.getContext("2d");
    if (!stagingContext) {
      return { width: 0, height: 0, draw: () => undefined };
    }
    stagingContext.putImageData(source, 0, 0);
    return {
      width: source.width,
      height: source.height,
      draw: (context, width, height) =>
        context.drawImage(stagingCanvas, 0, 0, width, height),
    };
  }

  if (source && typeof (source as HTMLImageElement).src === "string") {
    const image = await loadImage((source as HTMLImageElement).src);
    return imageDrawable(image);
  }

  return { width: 0, height: 0, draw: () => undefined };
}

function imageDrawable(image: HTMLImageElement): Drawable {
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    draw: (context, width, height) => context.drawImage(image, 0, 0, width, height),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Image load timed out"));
    }, 6000);

    image.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error("Invalid or unreadable image"));
    };
    image.src = src;
  });
}

/** Grayscale and contrast stretch without mutating the source image. */
function enhanceContrast(imageData: ImageData) {
  const data = imageData.data;
  let min = 255;
  let max = 0;

  for (let index = 0; index < data.length; index += 4) {
    const luminance =
      0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
    min = Math.min(min, luminance);
    max = Math.max(max, luminance);
  }

  const range = Math.max(1, max - min);
  for (let index = 0; index < data.length; index += 4) {
    const luminance =
      0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
    const value = Math.max(0, Math.min(255, ((luminance - min) / range) * 255));
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }
}

/** Extract the first image/* Blob from a ClipboardEvent. */
export function blobFromClipboard(
  event: ClipboardEvent
): { blob: Blob; name: string } | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
    const blob = item.getAsFile();
    if (blob) {
      const fileName = "name" in blob ? String((blob as File).name || "") : "";
      return { blob, name: fileName || "Clipboard screenshot" };
    }
  }
  return null;
}

/** Extract the first image File from a DragEvent. */
export function fileFromDragEvent(event: DragEvent): File | null {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return null;

  for (let index = 0; index < files.length; index++) {
    if (files[index].type.startsWith("image/")) return files[index];
  }
  return null;
}
