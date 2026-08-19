/**
 * Browser harness entry point (bundled by scripts/browser-render-check.mjs).
 *
 * Exposes the real application renderer + jsQR inside a page so the Canvas /
 * PNG export path can be exercised in an actual browser and decoded back.
 */
import jsQR from "jsqr";
import {
  buildScene,
  generateMatrix,
  renderToCanvas,
  renderToSvg,
  sceneBounds,
} from "../src/lib/qr/renderer";
import type { GeneratorDesign, LogoSettings } from "../src/lib/qr/types";

declare global {
  interface Window {
    __RECQR__: typeof api;
  }
}

const api = {
  jsQR,
  buildScene,
  generateMatrix,
  renderToCanvas,
  renderToSvg,
  sceneBounds,
  async renderPngAndDecode(
    payload: string,
    design: GeneratorDesign,
    logo: LogoSettings,
    logoDataUrl?: string
  ) {
    const { size, modules } = generateMatrix(payload, design.errorCorrection);
    let loaded = null as null | {
      dataUrl: string;
      width: number;
      height: number;
      image: HTMLImageElement;
    };
    if (logoDataUrl) {
      const img = new Image();
      img.src = logoDataUrl;
      await img.decode();
      loaded = {
        dataUrl: logoDataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        image: img,
      };
    }
    const bitmap = { size, modules, logo: loaded };
    const canvas = document.createElement("canvas");
    const result = renderToCanvas(bitmap, design, logo, canvas);
    if (!result) throw new Error("canvas render failed");
    const ctx = canvas.getContext("2d")!;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(image.data, image.width, image.height);

    // Detect dark pixels touching the outer border (i.e. content that spilled
    // out of the intended coordinate system).
    let borderInk = 0;
    const isInk = (x: number, y: number) => {
      const i = (y * image.width + x) * 4;
      return image.data[i] < 128 && image.data[i + 3] > 16;
    };
    for (let x = 0; x < image.width; x++) {
      if (isInk(x, 0)) borderInk++;
      if (isInk(x, image.height - 1)) borderInk++;
    }
    for (let y = 0; y < image.height; y++) {
      if (isInk(0, y)) borderInk++;
      if (isInk(image.width - 1, y)) borderInk++;
    }

    const scene = buildScene(bitmap, design, logo);
    const bounds = sceneBounds(scene)!;
    const pngDataUrl = canvas.toDataURL("image/png");

    return {
      decoded: decoded?.data ?? null,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      cssWidth: canvas.style.width,
      cssHeight: canvas.style.height,
      scale: result.scale,
      layout: result.layout,
      bounds,
      borderInk,
      pngBytes: pngDataUrl.length,
      svgLength: renderToSvg(bitmap, design, logo).length,
    };
  },
  /** Rasterise an SVG string in the browser and decode it with jsQR. */
  async decodeSvg(svg: string, width = 900) {
    const blobUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const img = new Image();
    img.src = blobUrl;
    await img.decode();
    const ratio = img.naturalHeight / img.naturalWidth || 1;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = Math.round(width * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(image.data, image.width, image.height)?.data ?? null;
  },
};

window.__RECQR__ = api;
