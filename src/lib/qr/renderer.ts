import QRCode from "qrcode";
import { computeLayout, round3, type QRLayout } from "./layout";
import {
  buildScene,
  type LoadedLogo,
  type QRBitmap,
  type QRScene,
  type Shape,
} from "./scene";
import type { GeneratorDesign, LogoSettings } from "./types";

export type { QRBitmap, QRScene, Shape } from "./scene";
export { buildScene, sceneBounds, shapeBounds } from "./scene";
export {
  computeLayout,
  computeLogoBox,
  finderOrigins,
  isFinderZone,
  moduleOrigin,
  type QRLayout,
} from "./layout";

const EC_LEVEL = { L: "L", M: "M", Q: "Q", H: "H" } as const;

/** Generate the boolean QR matrix for a payload. */
export function generateMatrix(
  payload: string,
  ec: GeneratorDesign["errorCorrection"]
): { size: number; modules: boolean[] } {
  const text = payload.length ? payload : " ";
  const created = QRCode.create(text, {
    errorCorrectionLevel: EC_LEVEL[ec],
  });
  const matrix = created.modules;
  const size = matrix.size;
  const modules = new Array<boolean>(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      modules[y * size + x] = !!matrix.get(x, y);
    }
  }
  return { size, modules };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Image loading requires a browser"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Downscale the logo so the embedded raster is never much larger than the box
 * it is painted into, and cache it as a data URL (needed for SVG export).
 */
async function prepareLogo(
  logo: LogoSettings,
  targetPx: number
): Promise<LoadedLogo | null> {
  if (!logo.src) return null;
  try {
    const img = await loadImage(logo.src);
    const maxDim = Math.max(16, Math.round(targetPx));
    const scale = Math.min(
      1,
      maxDim / Math.max(1, img.naturalWidth, img.naturalHeight)
    );
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/png");
    const mini = new Image();
    mini.src = dataUrl;
    // Wait for the small data-URL image to decode so drawImage is synchronous.
    await mini.decode().catch(() => undefined);
    return { dataUrl, width: w, height: h, image: mini };
  } catch {
    return null;
  }
}

/** Build the matrix (+ optional decoded logo) used by every renderer. */
export async function buildBitmap(
  payload: string,
  design: GeneratorDesign,
  logo: LogoSettings
): Promise<QRBitmap> {
  const { size, modules } = generateMatrix(payload, design.errorCorrection);
  const layout = computeLayout(size, design);
  // Rasterise the logo at ~2x the painted box for crisp exports.
  const targetPx = layout.matrixSize * layout.moduleSize * 0.35 * 2;
  const loaded = await prepareLogo(logo, targetPx);
  return { size, modules, logo: loaded };
}

// ----------------------------- geometry helpers -----------------------------

function roundedRectPathData(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  clockwise = true
): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const ix = w - 2 * radius;
  const iy = h - 2 * radius;
  if (clockwise) {
    return (
      `M${round3(x + radius)},${round3(y)}` +
      `h${round3(ix)}` +
      (radius ? `a${round3(radius)},${round3(radius)} 0 0 1 ${round3(radius)},${round3(radius)}` : "") +
      `v${round3(iy)}` +
      (radius ? `a${round3(radius)},${round3(radius)} 0 0 1 ${round3(-radius)},${round3(radius)}` : "") +
      `h${round3(-ix)}` +
      (radius ? `a${round3(radius)},${round3(radius)} 0 0 1 ${round3(-radius)},${round3(-radius)}` : "") +
      `v${round3(-iy)}` +
      (radius ? `a${round3(radius)},${round3(radius)} 0 0 1 ${round3(radius)},${round3(-radius)}` : "") +
      "z"
    );
  }
  return (
    `M${round3(x + radius)},${round3(y)}` +
    (radius ? `a${round3(radius)},${round3(radius)} 0 0 0 ${round3(-radius)},${round3(radius)}` : "") +
    `v${round3(iy)}` +
    (radius ? `a${round3(radius)},${round3(radius)} 0 0 0 ${round3(radius)},${round3(radius)}` : "") +
    `h${round3(ix)}` +
    (radius ? `a${round3(radius)},${round3(radius)} 0 0 0 ${round3(radius)},${round3(-radius)}` : "") +
    `v${round3(-iy)}` +
    (radius ? `a${round3(radius)},${round3(radius)} 0 0 0 ${round3(-radius)},${round3(-radius)}` : "") +
    `h${round3(-ix)}` +
    "z"
  );
}

function ringPathData(shape: Extract<Shape, { kind: "ring" }>): string {
  const t = Math.max(
    0.01,
    Math.min(shape.thickness, shape.width / 2 - 0.01, shape.height / 2 - 0.01)
  );
  const outer = roundedRectPathData(
    shape.x,
    shape.y,
    shape.width,
    shape.height,
    shape.rx,
    true
  );
  const inner = roundedRectPathData(
    shape.x + t,
    shape.y + t,
    shape.width - 2 * t,
    shape.height - 2 * t,
    Math.max(0, shape.rx - t),
    false
  );
  return `${outer} ${inner}`;
}

// ------------------------------- SVG rendering ------------------------------

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function shapeToSvg(shape: Shape): string {
  switch (shape.kind) {
    case "rect":
      return `<rect x="${round3(shape.x)}" y="${round3(shape.y)}" width="${round3(
        shape.width
      )}" height="${round3(shape.height)}"${
        shape.rx > 0 ? ` rx="${round3(shape.rx)}"` : ""
      } fill="${escapeXml(shape.fill)}"/>`;
    case "circle":
      return `<circle cx="${round3(shape.cx)}" cy="${round3(shape.cy)}" r="${round3(
        shape.r
      )}" fill="${escapeXml(shape.fill)}"/>`;
    case "ring":
      return `<path d="${ringPathData(shape)}" fill-rule="evenodd" fill="${escapeXml(
        shape.fill
      )}"/>`;
    case "image":
      return `<image href="${escapeXml(shape.href)}" x="${round3(shape.x)}" y="${round3(
        shape.y
      )}" width="${round3(shape.width)}" height="${round3(
        shape.height
      )}" preserveAspectRatio="xMidYMid meet"/>`;
    case "text":
      return `<text x="${round3(shape.x)}" y="${round3(
        shape.y
      )}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="${round3(
        shape.fontSize
      )}" textLength="${round3(
        Math.min(shape.maxWidth, shape.text.length * shape.fontSize * 0.62)
      )}" lengthAdjust="spacingAndGlyphs" fill="${escapeXml(shape.fill)}">${escapeXml(
        shape.text
      )}</text>`;
  }
}

/** Serialize a scene to a standalone SVG document. */
export function sceneToSvg(scene: QRScene): string {
  const { layout } = scene;
  const w = round3(layout.outputWidth);
  const h = round3(layout.outputHeight);
  const bg = scene.background
    ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${escapeXml(scene.background)}"/>`
    : "";
  const body = scene.shapes.map(shapeToSvg).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision" style="overflow:hidden" role="img" aria-label="QR code">${bg}${body}</svg>`;
}

/** Build an SVG string. Logo is embedded as a base64 image when present. */
export function renderToSvg(
  bitmap: QRBitmap,
  design: GeneratorDesign,
  logoSettings: LogoSettings
): string {
  return sceneToSvg(buildScene(bitmap, design, logoSettings));
}

// ------------------------------ Canvas rendering ----------------------------

function tracePath(ctx: CanvasRenderingContext2D, shape: Shape) {
  if (shape.kind !== "rect") return;
  const radius = Math.max(0, Math.min(shape.rx, shape.width / 2, shape.height / 2));
  const { x, y, width: w, height: h } = shape;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  clockwise: boolean
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (clockwise) {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x, y, x, y + h, radius);
    ctx.arcTo(x, y + h, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x + w, y, radius);
    ctx.arcTo(x + w, y, x, y, radius);
  }
  ctx.closePath();
}

/**
 * Paint a scene onto a 2D context that has already been scaled so that one
 * scene unit equals one CSS pixel.
 */
export function paintScene(
  ctx: CanvasRenderingContext2D,
  scene: QRScene,
  pixelScale = 1
) {
  const { layout } = scene;
  ctx.clearRect(0, 0, layout.outputWidth, layout.outputHeight);
  if (scene.background) {
    ctx.fillStyle = scene.background;
    ctx.fillRect(0, 0, layout.outputWidth, layout.outputHeight);
  }

  const snap = (v: number) => Math.round(v * pixelScale) / pixelScale;

  for (const shape of scene.shapes) {
    switch (shape.kind) {
      case "rect": {
        ctx.fillStyle = shape.fill;
        if (shape.rx <= 0) {
          // Snap axis-aligned squares to device pixels: identical geometry,
          // but no antialiased hairline seams between neighbouring modules.
          const x0 = shape.crisp ? snap(shape.x) : shape.x;
          const y0 = shape.crisp ? snap(shape.y) : shape.y;
          const x1 = shape.crisp ? snap(shape.x + shape.width) : shape.x + shape.width;
          const y1 = shape.crisp ? snap(shape.y + shape.height) : shape.y + shape.height;
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        } else {
          tracePath(ctx, shape);
          ctx.fill();
        }
        break;
      }
      case "circle": {
        ctx.fillStyle = shape.fill;
        ctx.beginPath();
        ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "ring": {
        const t = Math.max(
          0.01,
          Math.min(shape.thickness, shape.width / 2 - 0.01, shape.height / 2 - 0.01)
        );
        ctx.fillStyle = shape.fill;
        ctx.beginPath();
        traceRoundedRect(ctx, shape.x, shape.y, shape.width, shape.height, shape.rx, true);
        traceRoundedRect(
          ctx,
          shape.x + t,
          shape.y + t,
          shape.width - 2 * t,
          shape.height - 2 * t,
          Math.max(0, shape.rx - t),
          false
        );
        ctx.fill("evenodd");
        break;
      }
      case "image": {
        if (shape.image) {
          ctx.drawImage(shape.image, shape.x, shape.y, shape.width, shape.height);
        }
        break;
      }
      case "text": {
        ctx.fillStyle = shape.fill;
        ctx.font = `600 ${shape.fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shape.text, shape.x, shape.y, shape.maxWidth);
        break;
      }
    }
  }
}

export interface CanvasRenderResult {
  layout: QRLayout;
  scale: number;
}

/**
 * Render the QR bitmap to a canvas (used for PNG and WebP exports).
 * The canvas backing store is `outputSize * scale` device pixels while the CSS
 * size stays `outputSize`, so the export honours devicePixelRatio without
 * changing the coordinate system.
 */
export function renderToCanvas(
  bitmap: QRBitmap,
  design: GeneratorDesign,
  logoSettings: LogoSettings,
  canvas: HTMLCanvasElement,
  ready?: () => void,
  scaleOverride?: number
): CanvasRenderResult | undefined {
  const scene = buildScene(bitmap, design, logoSettings);
  const { layout } = scene;
  const dpr =
    typeof window !== "undefined" && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1;
  const scale = Math.max(1, scaleOverride ?? Math.max(2, Math.min(4, dpr * 2)));

  canvas.width = Math.round(layout.outputWidth * scale);
  canvas.height = Math.round(layout.outputHeight * scale);
  canvas.style.width = `${layout.outputWidth}px`;
  canvas.style.height = `${layout.outputHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  paintScene(ctx, scene, scale);

  if (ready) ready();
  return { layout, scale };
}

/** Trigger a browser download for a Blob with a meaningful filename. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
