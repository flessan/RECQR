/**
 * Renderer-agnostic draw list.
 *
 * `buildScene` turns a QR bitmap + design into a flat list of primitive shapes
 * expressed in {@link QRLayout} coordinates. The SVG serializer, the canvas
 * painter and the raster exporters all consume this same list, which is what
 * guarantees the preview and the download are pixel-identical geometry.
 */
import {
  computeLayout,
  computeLogoBox,
  finderOrigins,
  isFinderZone,
  isStructuralModule,
  moduleOrigin,
  type QRLayout,
} from "./layout";
import type { GeneratorDesign, LogoSettings } from "./types";

export interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
  image?: CanvasImageSource;
}

export interface QRBitmap {
  size: number;
  modules: boolean[];
  logo: LoadedLogo | null;
}

export type Shape =
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      /** Corner radius (0 = sharp). */
      rx: number;
      fill: string;
      /** Snap to whole device pixels when rasterising (avoids hairline seams). */
      crisp?: boolean;
    }
  | { kind: "circle"; cx: number; cy: number; r: number; fill: string }
  | {
      /** Rounded rectangular ring (finder pattern frame). */
      kind: "ring";
      x: number;
      y: number;
      width: number;
      height: number;
      rx: number;
      thickness: number;
      fill: string;
    }
  | {
      kind: "image";
      x: number;
      y: number;
      width: number;
      height: number;
      href: string;
      image?: CanvasImageSource;
    }
  | {
      kind: "text";
      /** Horizontal centre of the text. */
      x: number;
      /** Vertical centre (middle baseline) of the text. */
      y: number;
      text: string;
      fontSize: number;
      maxWidth: number;
      fill: string;
    };

export interface QRScene {
  layout: QRLayout;
  /** Background colour, or null for a transparent background. */
  background: string | null;
  shapes: Shape[];
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Conservative bounding box of a shape (text uses its clamped max width). */
export function shapeBounds(shape: Shape): Bounds {
  switch (shape.kind) {
    case "rect":
    case "ring":
    case "image":
      return {
        left: shape.x,
        top: shape.y,
        right: shape.x + shape.width,
        bottom: shape.y + shape.height,
      };
    case "circle":
      return {
        left: shape.cx - shape.r,
        top: shape.cy - shape.r,
        right: shape.cx + shape.r,
        bottom: shape.cy + shape.r,
      };
    case "text":
      return {
        left: shape.x - shape.maxWidth / 2,
        top: shape.y - shape.fontSize * 0.75,
        right: shape.x + shape.maxWidth / 2,
        bottom: shape.y + shape.fontSize * 0.75,
      };
  }
}

/** Bounding box of the whole scene (excluding the background rect). */
export function sceneBounds(scene: QRScene): Bounds | null {
  let box: Bounds | null = null;
  for (const shape of scene.shapes) {
    const b = shapeBounds(shape);
    box = box
      ? {
          left: Math.min(box.left, b.left),
          top: Math.min(box.top, b.top),
          right: Math.max(box.right, b.right),
          bottom: Math.max(box.bottom, b.bottom),
        }
      : b;
  }
  return box;
}

function moduleShape(
  design: GeneratorDesign,
  layout: QRLayout,
  x: number,
  y: number
): Shape {
  const m = layout.moduleSize;
  const { x: px, y: py } = moduleOrigin(layout, x, y);
  // Timing/alignment patterns stay solid so decoders keep their grid lock.
  const structural = isStructuralModule(layout.matrixSize, x, y);
  if (design.dotStyle === "dots" && !structural) {
    return {
      kind: "circle",
      cx: px + m / 2,
      cy: py + m / 2,
      r: m * 0.5,
      fill: design.fgColor,
    };
  }
  if (design.dotStyle === "rounded" && !structural) {
    return {
      kind: "rect",
      x: px,
      y: py,
      width: m,
      height: m,
      rx: m * 0.35,
      fill: design.fgColor,
    };
  }
  return {
    kind: "rect",
    x: px,
    y: py,
    width: m,
    height: m,
    rx: 0,
    fill: design.fgColor,
    crisp: true,
  };
}

function finderShapes(design: GeneratorDesign, layout: QRLayout): Shape[] {
  const m = layout.moduleSize;
  const shapes: Shape[] = [];
  for (const [ox, oy] of finderOrigins(layout.matrixSize)) {
    const { x, y } = moduleOrigin(layout, ox, oy);
    const side = 7 * m;
    const outerR =
      design.eyeStyle === "square" ? 0 : design.eyeStyle === "leaf" ? m * 1.8 : m * 0.9;
    shapes.push({
      kind: "ring",
      x,
      y,
      width: side,
      height: side,
      rx: outerR,
      thickness: m,
      fill: design.fgColor,
    });

    const px = x + 2 * m;
    const py = y + 2 * m;
    const ps = 3 * m;
    shapes.push({
      kind: "rect",
      x: px,
      y: py,
      width: ps,
      height: ps,
      rx:
        design.eyeStyle === "leaf"
          ? m * 0.9
          : design.eyeStyle === "rounded"
            ? m * 0.6
            : 0,
      fill: design.fgColor,
      crisp: design.eyeStyle === "square",
    });
  }
  return shapes;
}

function logoShapes(
  logo: LoadedLogo,
  logoSettings: LogoSettings,
  layout: QRLayout
): Shape[] {
  const box = computeLogoBox(
    layout,
    logoSettings,
    logo.height > 0 ? logo.width / logo.height : 1
  );
  const shapes: Shape[] = [];
  const bg = logoSettings.background;
  if (bg && bg !== "transparent") {
    shapes.push({
      kind: "rect",
      x: box.bgX,
      y: box.bgY,
      width: box.bgWidth,
      height: box.bgHeight,
      rx: logoSettings.roundedBg ? box.radius : 0,
      fill: bg,
    });
  }
  shapes.push({
    kind: "image",
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    href: logo.dataUrl,
    image: logo.image,
  });
  return shapes;
}

function frameShape(design: GeneratorDesign, layout: QRLayout): Shape | null {
  if (layout.frameHeight <= 0) return null;
  const text = design.frameText.trim();
  if (!text) return null;
  const maxWidth = Math.max(layout.moduleSize, layout.qrPixelSize - layout.offsetX * 2);
  // Keep the label inside the frame band: shrink the font when the estimated
  // advance width (~0.62em per character) would exceed the available width.
  const fontSize = Math.min(
    layout.moduleSize * 2,
    maxWidth / Math.max(1, text.length * 0.62)
  );
  return {
    kind: "text",
    x: layout.outputWidth / 2,
    y: layout.qrPixelSize + layout.frameHeight / 2,
    text,
    fontSize,
    maxWidth,
    fill: design.fgColor,
  };
}

/** Build the complete draw list for a QR bitmap. */
export function buildScene(
  bitmap: QRBitmap,
  design: GeneratorDesign,
  logoSettings: LogoSettings
): QRScene {
  const layout = computeLayout(bitmap.size, design);
  const shapes: Shape[] = [];

  for (let y = 0; y < layout.matrixSize; y++) {
    for (let x = 0; x < layout.matrixSize; x++) {
      if (!bitmap.modules[y * bitmap.size + x]) continue;
      if (isFinderZone(layout.matrixSize, x, y)) continue;
      shapes.push(moduleShape(design, layout, x, y));
    }
  }

  shapes.push(...finderShapes(design, layout));

  if (bitmap.logo) {
    shapes.push(...logoShapes(bitmap.logo, logoSettings, layout));
  }

  const frame = frameShape(design, layout);
  if (frame) shapes.push(frame);

  return {
    layout,
    background: design.transparentBg ? null : design.bgColor,
    shapes,
  };
}
