import QRCode from "qrcode";
import type { GeneratorDesign, LogoSettings } from "./types";

export interface QRBitmap {
  size: number;
  modules: boolean[];
  logo: LoadedLogo | null;
}

interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
  image: HTMLImageElement;
}

const EC_LEVEL = {
  L: "L", M: "M", Q: "Q", H: "H",
} as const;

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

/** Downscale the logo to at most ~40% of the QR pixel size and cache as data URL. */
async function prepareLogo(
  logo: LogoSettings,
  targetPx: number
): Promise<LoadedLogo | null> {
  if (!logo.src) return null;
  try {
    const img = await loadImage(logo.src);
    const maxDim = Math.max(1, Math.round(targetPx * 0.4));
    const scale = Math.min(
      1,
      maxDim / Math.max(img.naturalWidth, img.naturalHeight)
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

export async function buildBitmap(
  payload: string,
  design: GeneratorDesign,
  logo: LogoSettings
): Promise<QRBitmap> {
  const { size, modules } = generateMatrix(payload, design.errorCorrection);
  const pxPerModule = design.size / size;
  const logoPx = Math.round(pxPerModule * 6);
  const loaded = await prepareLogo(logo, logoPx);
  return { size, modules, logo: loaded };
}

function isFinder(size: number, x: number, y: number): boolean {
  return (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawEyesCanvas(
  ctx: CanvasRenderingContext2D,
  size: number,
  modulePx: number,
  margin: number,
  design: GeneratorDesign
) {
  const origins: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  for (const [ox, oy] of origins) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const onRing = x === 0 || y === 0 || x === 6 || y === 6;
        if (!onRing) continue;
        const px = margin + (ox + x) * modulePx;
        const py = margin + (oy + y) * modulePx;
        if (design.eyeStyle === "square") {
          ctx.fillRect(px, py, modulePx, modulePx);
        } else {
          const isCorner =
            (x === 0 && y === 0) ||
            (x === 6 && y === 0) ||
            (x === 0 && y === 6) ||
            (x === 6 && y === 6);
          if (isCorner) {
            roundedRectPath(ctx, px, py, modulePx, modulePx, modulePx * 0.4);
            ctx.fill();
          } else {
            ctx.fillRect(px, py, modulePx, modulePx);
          }
        }
      }
    }
    for (let y = 2; y < 5; y++) {
      for (let x = 2; x < 5; x++) {
        const px = margin + (ox + x) * modulePx;
        const py = margin + (oy + y) * modulePx;
        if (design.eyeStyle === "leaf") {
          ctx.beginPath();
          ctx.arc(
            px + modulePx / 2,
            py + modulePx / 2,
            modulePx * 0.55,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (design.eyeStyle === "rounded") {
          roundedRectPath(ctx, px, py, modulePx, modulePx, modulePx * 0.3);
          ctx.fill();
        } else {
          ctx.fillRect(px, py, modulePx, modulePx);
        }
      }
    }
  }
}

function drawLogoAreaCanvas(
  ctx: CanvasRenderingContext2D,
  logo: LoadedLogo,
  total: number,
  logoSettings: LogoSettings,
  modulePx: number
) {
  const aspect = logo.width / logo.height;
  let boxW: number;
  let boxH: number;
  if (aspect >= 1) {
    boxW = total * logoSettings.sizeRatio;
    boxH = boxW / aspect;
  } else {
    boxH = total * logoSettings.sizeRatio;
    boxW = boxH * aspect;
  }
  const pad = Math.max(0, logoSettings.padding);
  const cx = total / 2;
  const cy = total / 2;
  const bgW = boxW + pad * 2;
  const bgH = boxH + pad * 2;
  if (logoSettings.background && logoSettings.background !== "transparent") {
    ctx.fillStyle = logoSettings.background;
    if (logoSettings.roundedBg) {
      roundedRectPath(
        ctx,
        cx - bgW / 2,
        cy - bgH / 2,
        bgW,
        bgH,
        modulePx * 1.5
      );
      ctx.fill();
    } else {
      ctx.fillRect(cx - bgW / 2, cy - bgH / 2, bgW, bgH);
    }
  }
  ctx.drawImage(logo.image, cx - boxW / 2, cy - boxH / 2, boxW, boxH);
}

/** Render the QR bitmap to a canvas (supports PNG and WebP exports). */
export function renderToCanvas(
  bitmap: QRBitmap,
  design: GeneratorDesign,
  logoSettings: LogoSettings,
  canvas: HTMLCanvasElement,
  ready?: () => void
) {
  const { size, modules, logo } = bitmap;
  const modulePx = design.size / size;
  const marginPx = Math.round(design.margin * modulePx);
  const frameHeight =
    design.frame && design.frameText ? Math.round(modulePx * 3) : 0;
  const total = design.size + marginPx * 2;
  const canvasSize = total + frameHeight;

  const scale = 2;
  canvas.width = canvasSize * scale;
  canvas.height = canvasSize * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  if (!design.transparentBg) {
    ctx.fillStyle = design.bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }
  ctx.fillStyle = design.fgColor;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!modules[y * size + x] || isFinder(size, x, y)) continue;
      const px = marginPx + x * modulePx;
      const py = marginPx + y * modulePx;
      if (design.dotStyle === "square") {
        ctx.fillRect(px, py, modulePx + 0.5, modulePx + 0.5);
      } else if (design.dotStyle === "dots") {
        ctx.beginPath();
        ctx.arc(
          px + modulePx / 2,
          py + modulePx / 2,
          modulePx * 0.48,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        roundedRectPath(
          ctx,
          px + modulePx * 0.12,
          py + modulePx * 0.12,
          modulePx * 0.76,
          modulePx * 0.76,
          modulePx * 0.3
        );
        ctx.fill();
      }
    }
  }

  drawEyesCanvas(ctx, size, modulePx, marginPx, design);

  if (logo) {
    drawLogoAreaCanvas(ctx, logo, total, logoSettings, modulePx);
  }

  if (frameHeight > 0) {
    ctx.fillStyle = design.fgColor;
    ctx.font = `600 ${Math.round(modulePx * 1.1)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      design.frameText,
      total / 2,
      total + frameHeight / 2,
      total - marginPx
    );
  }

  // Allow async logo image paint to complete before capture.
  if (ready) {
    if (logo) setTimeout(ready, 60);
    else ready();
  }
}

// ----------------------------- SVG rendering --------------------------------

function svgEyePath(
  ox: number,
  oy: number,
  modulePx: number,
  style: EyeStyle
): string {
  const x = ox * modulePx;
  const y = oy * modulePx;
  const s = 7 * modulePx;
  const t = modulePx;
  const outerR = style === "square" ? 0 : t * 0.6;
  // A filled outer rounded rect with an even-odd inner cutout gives the ring.
  const frameThickness = t * 1.05;
  const frame = `<path d="${roundedFrameSvg(x, y, s, s, outerR, frameThickness)}" fill-rule="evenodd"/>`;
  const px = x + 2 * t;
  const py = y + 2 * t;
  const ps = 3 * t;
  let pupil: string;
  if (style === "leaf") {
    pupil = `<circle cx="${px + ps / 2}" cy="${py + ps / 2}" r="${ps * 0.55}"/>`;
  } else {
    const pr = style === "rounded" ? t * 0.4 : 0;
    pupil = `<path d="${rectSvg(px, py, ps, ps, pr)}"/>`;
  }
  return frame + pupil;
}

function roundedFrameSvg(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  thickness: number
): string {
  // Outer rounded rectangle path (clockwise)
  const outer = rectSvg(x, y, w, h, r);
  // Inner hole (counter-clockwise for even-odd)
  const ix = x + thickness;
  const iy = y + thickness;
  const iw = w - thickness * 2;
  const ih = h - thickness * 2;
  const ir = Math.max(0, r - thickness);
  const inner = rectSvgCCW(ix, iy, iw, ih, ir);
  return outer + " " + inner;
}

function rectSvg(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}h-${w - 2 * r}a${r},${r} 0 0 1 -${r},-${r}v-${h - 2 * r}a${r},${r} 0 0 1 ${r},-${r}z`;
}

function rectSvgCCW(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  return `M${x + r},${y}v${h - 2 * r}a${r},${r} 0 0 0 ${r},${r}h${w - 2 * r}a${r},${r} 0 0 0 ${r},-${r}v-${h - 2 * r}a${r},${r} 0 0 0 -${r},-${r}h-${w - 2 * r}a${r},${r} 0 0 0 -${r},${r}z`;
}

type EyeStyle = GeneratorDesign["eyeStyle"];

/** Build an SVG string. Logo is embedded as a base64 image when present. */
export function renderToSvg(
  bitmap: QRBitmap,
  design: GeneratorDesign,
  logoSettings: LogoSettings
): string {
  const { size, modules, logo } = bitmap;
  const modulePx = design.size / size;
  const marginPx = design.margin * modulePx;
  const frameHeight =
    design.frame && design.frameText ? modulePx * 3 : 0;
  const total = design.size + marginPx * 2;
  const viewBox = total + frameHeight;
  const bg = design.transparentBg ? "transparent" : design.bgColor;

  const modulePaths: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!modules[y * size + x] || isFinder(size, x, y)) continue;
      const px = marginPx + x * modulePx;
      const py = marginPx + y * modulePx;
      if (design.dotStyle === "square") {
        modulePaths.push(
          `<rect x="${px}" y="${py}" width="${modulePx}" height="${modulePx}"/>`
        );
      } else if (design.dotStyle === "dots") {
        modulePaths.push(
          `<circle cx="${px + modulePx / 2}" cy="${py + modulePx / 2}" r="${modulePx * 0.48}"/>`
        );
      } else {
        const d = rectSvg(
          px + modulePx * 0.12,
          py + modulePx * 0.12,
          modulePx * 0.76,
          modulePx * 0.76,
          modulePx * 0.25
        );
        modulePaths.push(`<path d="${d}"/>`);
      }
    }
  }

  const eyePaths = [
    svgEyePath(0, 0, modulePx, design.eyeStyle),
    svgEyePath(size - 7, 0, modulePx, design.eyeStyle),
    svgEyePath(0, size - 7, modulePx, design.eyeStyle),
  ];

  let logoSvg = "";
  if (logo) {
    const aspect = logo.width / logo.height;
    let boxW: number;
    let boxH: number;
    if (aspect >= 1) {
      boxW = total * logoSettings.sizeRatio;
      boxH = boxW / aspect;
    } else {
      boxH = total * logoSettings.sizeRatio;
      boxW = boxH * aspect;
    }
    const pad = Math.max(0, logoSettings.padding);
    const cx = total / 2;
    const cy = total / 2;
    const bgW = boxW + pad * 2;
    const bgH = boxH + pad * 2;
    if (logoSettings.background && logoSettings.background !== "transparent") {
      if (logoSettings.roundedBg) {
        logoSvg += `<rect x="${cx - bgW / 2}" y="${cy - bgH / 2}" width="${bgW}" height="${bgH}" rx="${modulePx * 1.5}" fill="${logoSettings.background}"/>`;
      } else {
        logoSvg += `<rect x="${cx - bgW / 2}" y="${cy - bgH / 2}" width="${bgW}" height="${bgH}" fill="${logoSettings.background}"/>`;
      }
    }
    logoSvg += `<image href="${logo.dataUrl}" x="${cx - boxW / 2}" y="${cy - boxH / 2}" width="${boxW}" height="${boxH}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  let frameSvg = "";
  if (frameHeight > 0) {
    frameSvg = `<text x="${total / 2}" y="${total + frameHeight / 2}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="${modulePx * 1.1}" fill="${design.fgColor}">${escapeXml(design.frameText)}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" width="${viewBox}" height="${viewBox}" role="img" aria-label="QR code">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g fill="${design.fgColor}">
    ${modulePaths.join("")}
    ${eyePaths.map((d) => `<path d="${d}"/>`).join("")}
  </g>
  ${logoSvg}
  ${frameSvg}
</svg>`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
