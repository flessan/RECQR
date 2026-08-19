/**
 * Single source of truth for QR geometry.
 *
 * Every renderer (SVG, Canvas, PNG/WebP export, on-screen preview) derives its
 * coordinates from {@link QRLayout} so the outputs can never diverge.
 *
 * Coordinate system (all values in output units, top-left origin):
 *
 *   totalModules = matrixSize + quietZone * 2
 *   moduleSize   = targetSize / totalModules
 *   qrPixelSize  = totalModules * moduleSize        (== targetSize)
 *   offsetX/Y    = quietZone * moduleSize           (first data module)
 *   outputWidth  = qrPixelSize
 *   outputHeight = qrPixelSize + frameHeight
 *
 * Invariant: every painted element satisfies
 *   0 <= x <= outputWidth and 0 <= y <= outputHeight.
 */
import type { GeneratorDesign, LogoSettings } from "./types";

export interface QRLayout {
  /** Number of QR modules per side (21, 25, 29, ...). */
  matrixSize: number;
  /** Size of one module in output units. */
  moduleSize: number;
  /** Quiet zone width expressed in modules. */
  quietZone: number;
  /** Width/height of the QR square including its quiet zone. */
  qrPixelSize: number;
  /** Extra band under the QR used by the optional label frame (0 when off). */
  frameHeight: number;
  outputWidth: number;
  outputHeight: number;
  /** Pixel offset of matrix cell (0,0) — i.e. the quiet zone. */
  offsetX: number;
  offsetY: number;
}

export const MIN_OUTPUT_SIZE = 64;
export const MAX_OUTPUT_SIZE = 4096;
export const MAX_QUIET_ZONE = 16;
/** Largest fraction of the QR data area a logo (incl. padding) may cover. */
export const MAX_LOGO_COVERAGE = 0.3;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Round to 3 decimals — enough precision for sub-pixel accurate output. */
export function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Build the layout for a matrix of `matrixSize` modules rendered at
 * `design.size` output pixels (the requested size always includes the quiet
 * zone, so the QR never grows past the size the user asked for).
 */
export function computeLayout(
  matrixSize: number,
  design: Pick<GeneratorDesign, "size" | "margin" | "frame" | "frameText">
): QRLayout {
  const safeMatrix = Math.max(1, Math.round(matrixSize));
  const quietZone = Math.round(clamp(design.margin ?? 0, 0, MAX_QUIET_ZONE));
  const target = clamp(design.size ?? 320, MIN_OUTPUT_SIZE, MAX_OUTPUT_SIZE);

  const totalModules = safeMatrix + quietZone * 2;
  const moduleSize = target / totalModules;
  const qrPixelSize = target;
  const hasFrame = !!design.frame && !!design.frameText?.trim();
  const frameHeight = hasFrame ? moduleSize * 4 : 0;

  return {
    matrixSize: safeMatrix,
    moduleSize,
    quietZone,
    qrPixelSize,
    frameHeight,
    outputWidth: qrPixelSize,
    outputHeight: qrPixelSize + frameHeight,
    offsetX: quietZone * moduleSize,
    offsetY: quietZone * moduleSize,
  };
}

/** Top-left output coordinate of matrix cell (x, y). */
export function moduleOrigin(
  layout: QRLayout,
  x: number,
  y: number
): { x: number; y: number } {
  return {
    x: layout.offsetX + x * layout.moduleSize,
    y: layout.offsetY + y * layout.moduleSize,
  };
}

/** True for the 8x8 finder + separator zones, which are drawn separately. */
export function isFinderZone(matrixSize: number, x: number, y: number): boolean {
  return (
    (x < 8 && y < 8) ||
    (x >= matrixSize - 8 && y < 8) ||
    (x < 8 && y >= matrixSize - 8)
  );
}

/** Matrix coordinates of the three finder pattern origins (7x7 each). */
export function finderOrigins(matrixSize: number): Array<[number, number]> {
  return [
    [0, 0],
    [matrixSize - 7, 0],
    [0, matrixSize - 7],
  ];
}

export interface LogoBox {
  /** Image rect. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Padded backdrop rect (always contains the image rect). */
  bgX: number;
  bgY: number;
  bgWidth: number;
  bgHeight: number;
  /** Effective padding actually applied. */
  padding: number;
  /** Corner radius for the backdrop when rounded. */
  radius: number;
}

/**
 * Geometry for an embedded logo, in the same coordinate system as the modules.
 *
 * Guarantees:
 *  - the padded box never leaves the QR data area (so it never touches the
 *    quiet zone),
 *  - the padded box never overlaps the 8x8 finder pattern zones,
 *  - the covered area stays under {@link MAX_LOGO_COVERAGE} of the data area,
 *  - the image aspect ratio is preserved.
 */
export function computeLogoBox(
  layout: QRLayout,
  logo: Pick<LogoSettings, "sizeRatio" | "padding">,
  aspect: number
): LogoBox {
  const { moduleSize, matrixSize } = layout;
  const dataSize = matrixSize * moduleSize;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  // Never reach the finder patterns: a centred square of side S touches them
  // when S > (matrixSize - 16) * moduleSize.
  const finderLimit = Math.max(moduleSize * 3, (matrixSize - 16) * moduleSize);
  const coverageLimit = dataSize * MAX_LOGO_COVERAGE;
  const outerMax = Math.min(finderLimit, coverageLimit);

  const ratio = clamp(logo.sizeRatio ?? 0.2, 0.05, MAX_LOGO_COVERAGE);
  const padding = clamp(logo.padding ?? 0, 0, outerMax * 0.15);
  const outer = Math.min(dataSize * ratio + padding * 2, outerMax);
  const inner = Math.max(1, outer - padding * 2);

  let width: number;
  let height: number;
  if (safeAspect >= 1) {
    width = inner;
    height = inner / safeAspect;
  } else {
    height = inner;
    width = inner * safeAspect;
  }

  const cx = layout.offsetX + dataSize / 2;
  const cy = layout.offsetY + dataSize / 2;
  const bgWidth = width + padding * 2;
  const bgHeight = height + padding * 2;

  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
    bgX: cx - bgWidth / 2,
    bgY: cy - bgHeight / 2,
    bgWidth,
    bgHeight,
    padding,
    radius: Math.min(moduleSize * 1.5, bgWidth / 2, bgHeight / 2),
  };
}

/**
 * Centre coordinates of the alignment patterns for the QR version implied by
 * `matrixSize` (ISO/IEC 18004 table E.1 generation rule).
 */
export function alignmentCenters(matrixSize: number): number[] {
  const version = (matrixSize - 17) / 4;
  if (!Number.isInteger(version) || version < 2) return [];
  const intervals = Math.floor(version / 7) + 1;
  const distance = matrixSize - 13;
  const step = Math.ceil(distance / intervals / 2) * 2;
  const centers = [6];
  for (let i = intervals - 1; i >= 0; i--) centers.push(matrixSize - 7 - i * step);
  return centers;
}

/**
 * True for timing patterns and alignment patterns. These carry the geometry a
 * decoder uses to lock onto the module grid, so they are always painted as
 * solid squares even in "dots"/"rounded" styles — separated shapes there break
 * real-world decoding.
 */
export function isStructuralModule(
  matrixSize: number,
  x: number,
  y: number
): boolean {
  if (x === 6 || y === 6) return true; // timing patterns
  const centers = alignmentCenters(matrixSize);
  for (const cx of centers) {
    for (const cy of centers) {
      const isFinderCorner =
        (cx === 6 && cy === 6) ||
        (cx === 6 && cy === matrixSize - 7) ||
        (cx === matrixSize - 7 && cy === 6);
      if (isFinderCorner) continue;
      if (Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 2) return true;
    }
  }
  return false;
}
