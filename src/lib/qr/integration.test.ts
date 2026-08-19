import { describe, it, expect } from "vitest";
import { buildPayload } from "./encoder";
import { generateMatrix, renderToSvg } from "./renderer";
import { parseQR } from "./parser";
import type { GeneratorContent, GeneratorDesign, LogoSettings } from "./types";

const design: GeneratorDesign = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  transparentBg: false,
  size: 256,
  margin: 4,
  errorCorrection: "M",
  dotStyle: "rounded",
  eyeStyle: "rounded",
  frame: false,
  frameText: "",
};
const noLogo: LogoSettings = {
  src: null, name: null, sizeRatio: 0.2, padding: 8, background: "#fff", roundedBg: true,
};

describe("generator round-trip", () => {
  it("builds a wifi payload that parses back", () => {
    const content: GeneratorContent = {
      preset: "wifi",
      data: { ssid: "My;Net", password: 'p"ass', encryption: "WPA", hidden: "true" },
    };
    const raw = buildPayload(content);
    const result = parseQR(raw);
    expect(result.type).toBe("wifi");
    expect(result.parsed?.kind).toBe("wifi");
    if (result.parsed?.kind === "wifi") {
      expect(result.parsed.ssid).toBe("My;Net");
      expect(result.parsed.password).toBe('p"ass');
      expect(result.parsed.hidden).toBe(true);
    }
  });

  it("produces a non-empty SVG containing modules for each dot style", () => {
    const content: GeneratorContent = { preset: "link", data: { url: "https://recqr.example" } };
    const raw = buildPayload(content);
    for (const dotStyle of ["square", "rounded", "dots"] as const) {
      const { size, modules } = generateMatrix(raw, "M");
      const svg = renderToSvg(
        { size, modules, logo: null },
        { ...design, dotStyle },
        noLogo
      );
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      // Every QR matrix has finder patterns; SVG must contain at least some paths/rects.
      expect(svg.length).toBeGreaterThan(500);
    }
  });

  it("escapes frame text to prevent XML injection", () => {
    const { size, modules } = generateMatrix("hi", "M");
    const svg = renderToSvg(
      { size, modules, logo: null },
      { ...design, frame: true, frameText: '<script>alert(1)</script>' },
      noLogo
    );
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
