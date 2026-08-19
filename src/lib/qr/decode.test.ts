/**
 * Mandatory decoder round-trip: payload -> matrix -> renderer -> raster pixels
 * -> jsQR -> payload.
 *
 * The SVG produced by the app is rasterised with resvg (a real SVG renderer,
 * not a re-implementation of our own maths) and the resulting ImageData is fed
 * to jsQR, exactly like a phone camera would.
 */
import { describe, it, expect } from "vitest";
import { Resvg } from "@resvg/resvg-js";
import jsQR from "jsqr";
import { buildScene, generateMatrix, renderToSvg, sceneToSvg } from "./renderer";
import { buildPayload } from "./encoder";
import type { GeneratorContent, GeneratorDesign, LogoSettings } from "./types";

const design: GeneratorDesign = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  transparentBg: false,
  size: 512,
  margin: 4,
  errorCorrection: "M",
  dotStyle: "square",
  eyeStyle: "square",
  frame: false,
  frameText: "",
};

const noLogo: LogoSettings = {
  src: null,
  name: null,
  sizeRatio: 0.22,
  padding: 8,
  background: "#ffffff",
  roundedBg: true,
};

/** Rasterise an SVG string to RGBA ImageData, flattened onto white. */
function rasterize(svg: string, width = 1024) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const rendered = resvg.render();
  const { width: w, height: h } = rendered;
  const src = rendered.pixels;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const a = src[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) {
      data[i * 4 + c] = Math.round(src[i * 4 + c] * a + 255 * (1 - a));
    }
    data[i * 4 + 3] = 255;
  }
  return { data, width: w, height: h };
}

function decode(svg: string, width = 1024): string | null {
  const { data, width: w, height: h } = rasterize(svg, width);
  return jsQR(data, w, h)?.data ?? null;
}

const LONG_URL =
  "https://example.com/catalogue/products/2026/spring-summer?utm_source=qr&utm_medium=print&utm_campaign=recqr-launch&variant=44821&ref=poster-a3";

const PAYLOADS: Array<[string, string]> = [
  ["short text", "RECQR"],
  ["url", "https://recqr.example/start"],
  ["long url", LONG_URL],
  ["wifi", "WIFI:T:WPA;S:Guest Network;P:s3cr3t-pass;H:true;;"],
  [
    "vcard",
    "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane;;;\nFN:Jane Doe\nORG:RECQR Labs\nTITLE:Engineer\nTEL;TYPE=CELL:+15551234567\nEMAIL:jane@recqr.example\nURL:https://recqr.example\nEND:VCARD",
  ],
  ["unicode", "こんにちは世界 — Grüße, Ωμέγα ✅ 你好"],
];

describe("QR decode round-trip (SVG -> pixels -> jsQR)", () => {
  for (const [label, payload] of PAYLOADS) {
    it(`decodes ${label} back to the original payload`, () => {
      const { size, modules } = generateMatrix(payload, "M");
      const svg = renderToSvg({ size, modules, logo: null }, design, noLogo);
      expect(decode(svg)).toBe(payload);
    });
  }

  it("decodes every dot / eye style combination", () => {
    const payload = "https://recqr.example/styles";
    for (const dotStyle of ["square", "rounded", "dots"] as const) {
      for (const eyeStyle of ["square", "rounded", "leaf"] as const) {
        const { size, modules } = generateMatrix(payload, "Q");
        const svg = renderToSvg(
          { size, modules, logo: null },
          { ...design, dotStyle, eyeStyle },
          noLogo
        );
        expect(decode(svg), `${dotStyle}/${eyeStyle}`).toBe(payload);
      }
    }
  });

  it("decodes with the label frame enabled", () => {
    const payload = "https://recqr.example/framed";
    const { size, modules } = generateMatrix(payload, "M");
    const svg = renderToSvg(
      { size, modules, logo: null },
      { ...design, frame: true, frameText: "SCAN ME" },
      noLogo
    );
    expect(decode(svg)).toBe(payload);
  });

  it("decodes with a transparent background once flattened", () => {
    const payload = "https://recqr.example/transparent";
    const { size, modules } = generateMatrix(payload, "M");
    const svg = renderToSvg(
      { size, modules, logo: null },
      { ...design, transparentBg: true },
      noLogo
    );
    expect(decode(svg)).toBe(payload);
  });

  it("decodes for quiet zones of 1..8 modules", () => {
    const payload = "https://recqr.example/quiet";
    for (const margin of [1, 2, 4, 8]) {
      const { size, modules } = generateMatrix(payload, "M");
      const svg = renderToSvg({ size, modules, logo: null }, { ...design, margin }, noLogo);
      expect(decode(svg), `margin=${margin}`).toBe(payload);
    }
  });

  it("decodes several QR versions (matrix sizes)", () => {
    const seen = new Set<number>();
    for (const payload of ["A", "A".repeat(40), "A".repeat(120), "A".repeat(300), LONG_URL]) {
      const { size, modules } = generateMatrix(payload, "M");
      seen.add(size);
      const svg = renderToSvg({ size, modules, logo: null }, design, noLogo);
      expect(decode(svg, 1200), `matrix=${size}`).toBe(payload);
    }
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });
});

describe("QR decode round-trip with an embedded logo", () => {
  // 1x1 red PNG scaled up by the renderer — enough to occlude the centre.
  const RED_PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const logo: LogoSettings = {
    src: "blob:logo",
    name: "logo.png",
    sizeRatio: 0.3,
    padding: 12,
    background: "#ffffff",
    roundedBg: true,
  };

  for (const [label, payload] of PAYLOADS) {
    it(`still decodes ${label} with a logo (EC H)`, () => {
      const { size, modules } = generateMatrix(payload, "H");
      const svg = renderToSvg(
        { size, modules, logo: { dataUrl: RED_PNG, width: 256, height: 256 } },
        { ...design, errorCorrection: "H" },
        logo
      );
      expect(svg).toContain("<image");
      expect(decode(svg, 1200)).toBe(payload);
    });
  }

  it("keeps the logo inside the QR bounds in the rendered SVG", () => {
    const { size, modules } = generateMatrix(LONG_URL, "H");
    const scene = buildScene(
      { size, modules, logo: { dataUrl: RED_PNG, width: 512, height: 256 } },
      { ...design, errorCorrection: "H" },
      logo
    );
    const svg = sceneToSvg(scene);
    const m = svg.match(
      /<image [^>]*x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/
    );
    expect(m).not.toBeNull();
    const [x, y, w, h] = m!.slice(1).map(Number);
    expect(x).toBeGreaterThanOrEqual(scene.layout.offsetX);
    expect(y).toBeGreaterThanOrEqual(scene.layout.offsetY);
    expect(x + w).toBeLessThanOrEqual(
      scene.layout.offsetX + scene.layout.matrixSize * scene.layout.moduleSize + 0.01
    );
    expect(y + h).toBeLessThanOrEqual(
      scene.layout.offsetY + scene.layout.matrixSize * scene.layout.moduleSize + 0.01
    );
    // Aspect ratio preserved (2:1 source).
    expect(w / h).toBeCloseTo(2, 3);
  });
});

describe("generator payload -> QR -> decode -> parse", () => {
  it("round-trips a generated Wi-Fi payload through the renderer", () => {
    const content: GeneratorContent = {
      preset: "wifi",
      data: { ssid: "My;Net", password: 'p"ass', encryption: "WPA", hidden: "true" },
    };
    const payload = buildPayload(content);
    const { size, modules } = generateMatrix(payload, "M");
    const svg = renderToSvg({ size, modules, logo: null }, design, noLogo);
    expect(decode(svg)).toBe(payload);
  });
});
