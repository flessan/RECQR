import { describe, it, expect } from "vitest";
import {
  buildScene,
  generateMatrix,
  renderToSvg,
  sceneToSvg,
  shapeBounds,
} from "./renderer";
import { computeLayout, computeLogoBox, finderOrigins } from "./layout";
import type { GeneratorDesign, LogoSettings } from "./types";

const baseDesign: GeneratorDesign = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  transparentBg: false,
  size: 320,
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

const EPS = 0.01;

function syntheticBitmap(size: number) {
  const modules = new Array<boolean>(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Full finder patterns plus a deterministic data pattern.
      const inFinder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      modules[y * size + x] = inFinder ? true : (x * 31 + y * 17) % 3 === 0;
    }
  }
  return { size, modules, logo: null };
}

describe("generateMatrix", () => {
  it("produces a square boolean matrix for a url", () => {
    const { size, modules } = generateMatrix("https://example.com", "M");
    expect(size).toBeGreaterThan(0);
    expect(modules.length).toBe(size * size);
    expect(modules.some(Boolean)).toBe(true);
  });
  it("uses higher error correction for longer payload", () => {
    const a = generateMatrix("a", "L");
    const b = generateMatrix("a".repeat(200), "H");
    expect(b.size).toBeGreaterThanOrEqual(a.size);
  });
  it("does not throw on empty payload (uses a space)", () => {
    expect(() => generateMatrix("", "M")).not.toThrow();
  });
});

describe("computeLayout", () => {
  for (const matrixSize of [21, 25, 29, 33, 45, 57, 77, 101, 177]) {
    it(`is internally consistent for a ${matrixSize}-module matrix`, () => {
      const layout = computeLayout(matrixSize, baseDesign);
      const totalModules = matrixSize + layout.quietZone * 2;
      expect(layout.matrixSize).toBe(matrixSize);
      expect(layout.quietZone).toBe(4);
      expect(layout.moduleSize).toBeCloseTo(baseDesign.size / totalModules, 10);
      expect(layout.qrPixelSize).toBeCloseTo(layout.moduleSize * totalModules, 6);
      expect(layout.outputWidth).toBeCloseTo(baseDesign.size, 6);
      expect(layout.outputHeight).toBeCloseTo(baseDesign.size, 6);
      expect(layout.offsetX).toBeCloseTo(layout.quietZone * layout.moduleSize, 10);
      expect(layout.offsetY).toBe(layout.offsetX);
      // Quiet zone actually exists on both sides.
      expect(layout.offsetX).toBeGreaterThan(0);
      expect(
        layout.outputWidth - (layout.offsetX + matrixSize * layout.moduleSize)
      ).toBeCloseTo(layout.offsetX, 6);
    });
  }

  it("adds a frame band to the height only when a label is set", () => {
    const plain = computeLayout(25, baseDesign);
    expect(plain.frameHeight).toBe(0);

    const framed = computeLayout(25, {
      ...baseDesign,
      frame: true,
      frameText: "SCAN ME",
    });
    expect(framed.frameHeight).toBeCloseTo(framed.moduleSize * 4, 10);
    expect(framed.outputWidth).toBeCloseTo(baseDesign.size, 6);
    expect(framed.outputHeight).toBeCloseTo(baseDesign.size + framed.frameHeight, 6);

    const emptyLabel = computeLayout(25, { ...baseDesign, frame: true, frameText: "  " });
    expect(emptyLabel.frameHeight).toBe(0);
  });

  it("clamps the requested size and quiet zone", () => {
    expect(computeLayout(21, { ...baseDesign, size: 1 }).outputWidth).toBe(64);
    expect(computeLayout(21, { ...baseDesign, size: 99999 }).outputWidth).toBe(4096);
    expect(computeLayout(21, { ...baseDesign, margin: -5 }).quietZone).toBe(0);
    expect(computeLayout(21, { ...baseDesign, margin: 999 }).quietZone).toBe(16);
  });
});

describe("scene geometry stays inside the output", () => {
  const dotStyles = ["square", "rounded", "dots"] as const;
  const eyeStyles = ["square", "rounded", "leaf"] as const;

  for (const matrixSize of [21, 25, 29, 33, 57, 105]) {
    for (const dotStyle of dotStyles) {
      for (const eyeStyle of eyeStyles) {
        for (const frame of [false, true]) {
          it(`matrix ${matrixSize} / ${dotStyle} / ${eyeStyle} / frame=${frame}`, () => {
            const design: GeneratorDesign = {
              ...baseDesign,
              dotStyle,
              eyeStyle,
              frame,
              frameText: frame ? "SCAN ME FOR MORE INFORMATION" : "",
            };
            const scene = buildScene(syntheticBitmap(matrixSize), design, noLogo);
            const { layout } = scene;

            expect(scene.shapes.length).toBeGreaterThan(0);
            for (const shape of scene.shapes) {
              const b = shapeBounds(shape);
              expect(b.left).toBeGreaterThanOrEqual(-EPS);
              expect(b.top).toBeGreaterThanOrEqual(-EPS);
              expect(b.right).toBeLessThanOrEqual(layout.outputWidth + EPS);
              expect(b.bottom).toBeLessThanOrEqual(layout.outputHeight + EPS);
            }
          });
        }
      }
    }
  }

  it("keeps every data module strictly inside the quiet zone", () => {
    const scene = buildScene(syntheticBitmap(33), baseDesign, noLogo);
    const { layout } = scene;
    const innerLeft = layout.offsetX;
    const innerRight = layout.offsetX + layout.matrixSize * layout.moduleSize;
    for (const shape of scene.shapes) {
      const b = shapeBounds(shape);
      expect(b.left).toBeGreaterThanOrEqual(innerLeft - EPS);
      expect(b.right).toBeLessThanOrEqual(innerRight + EPS);
      expect(b.top).toBeGreaterThanOrEqual(innerLeft - EPS);
    }
  });

  it("places the three finder patterns at the matrix corners", () => {
    const scene = buildScene(syntheticBitmap(29), baseDesign, noLogo);
    const { layout } = scene;
    const rings = scene.shapes.filter((s) => s.kind === "ring");
    expect(rings).toHaveLength(3);
    const expected = finderOrigins(layout.matrixSize).map(([mx, my]) => [
      layout.offsetX + mx * layout.moduleSize,
      layout.offsetY + my * layout.moduleSize,
    ]);
    rings.forEach((ring, i) => {
      if (ring.kind !== "ring") return;
      expect(ring.x).toBeCloseTo(expected[i][0], 6);
      expect(ring.y).toBeCloseTo(expected[i][1], 6);
      expect(ring.width).toBeCloseTo(7 * layout.moduleSize, 6);
      expect(ring.x + ring.width).toBeLessThanOrEqual(layout.outputWidth + EPS);
      expect(ring.y + ring.height).toBeLessThanOrEqual(layout.outputHeight + EPS);
    });
  });

  it("never emits negative coordinates", () => {
    for (const margin of [0, 1, 4, 10]) {
      const scene = buildScene(syntheticBitmap(41), { ...baseDesign, margin }, noLogo);
      for (const shape of scene.shapes) {
        const b = shapeBounds(shape);
        expect(b.left).toBeGreaterThanOrEqual(-EPS);
        expect(b.top).toBeGreaterThanOrEqual(-EPS);
      }
    }
  });
});

describe("logo geometry", () => {
  const logo: LogoSettings = { ...noLogo, src: "blob:x", sizeRatio: 0.35, padding: 40 };

  for (const matrixSize of [21, 25, 33, 57]) {
    for (const aspect of [1, 2.5, 0.4]) {
      it(`stays inside the data area (matrix ${matrixSize}, aspect ${aspect})`, () => {
        const layout = computeLayout(matrixSize, baseDesign);
        const box = computeLogoBox(layout, logo, aspect);
        const dataLeft = layout.offsetX;
        const dataRight = layout.offsetX + layout.matrixSize * layout.moduleSize;

        // Inside the QR data area (never in the quiet zone).
        expect(box.bgX).toBeGreaterThanOrEqual(dataLeft - EPS);
        expect(box.bgY).toBeGreaterThanOrEqual(dataLeft - EPS);
        expect(box.bgX + box.bgWidth).toBeLessThanOrEqual(dataRight + EPS);
        expect(box.bgY + box.bgHeight).toBeLessThanOrEqual(dataRight + EPS);

        // Never touches the 8x8 finder zones.
        const finderEdge = layout.offsetX + 8 * layout.moduleSize;
        expect(box.bgX).toBeGreaterThanOrEqual(finderEdge - layout.moduleSize * 1.5);

        // Aspect ratio preserved.
        expect(box.width / box.height).toBeCloseTo(aspect, 6);

        // The image always sits inside its padded backdrop.
        expect(box.x).toBeGreaterThanOrEqual(box.bgX - EPS);
        expect(box.x + box.width).toBeLessThanOrEqual(box.bgX + box.bgWidth + EPS);

        // Coverage cap.
        const dataArea = (layout.matrixSize * layout.moduleSize) ** 2;
        expect((box.bgWidth * box.bgHeight) / dataArea).toBeLessThanOrEqual(0.1);
      });
    }
  }

  it("does not change the output dimensions", () => {
    const bitmap = syntheticBitmap(33);
    const withoutLogo = buildScene(bitmap, baseDesign, noLogo);
    const withLogo = buildScene(
      { ...bitmap, logo: { dataUrl: "data:image/png;base64,AA", width: 100, height: 100 } },
      baseDesign,
      { ...noLogo, src: "blob:x" }
    );
    expect(withLogo.layout).toEqual(withoutLogo.layout);
    expect(withLogo.shapes.length).toBe(withoutLogo.shapes.length + 2);
    for (const shape of withLogo.shapes) {
      const b = shapeBounds(shape);
      expect(b.right).toBeLessThanOrEqual(withLogo.layout.outputWidth + EPS);
      expect(b.bottom).toBeLessThanOrEqual(withLogo.layout.outputHeight + EPS);
    }
  });
});

describe("SVG output", () => {
  it("declares a viewBox matching the layout", () => {
    const { size, modules } = generateMatrix("https://recqr.example/page", "M");
    const scene = buildScene({ size, modules, logo: null }, baseDesign, noLogo);
    const svg = sceneToSvg(scene);
    const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBeCloseTo(scene.layout.outputWidth, 2);
    expect(Number(m![2])).toBeCloseTo(scene.layout.outputHeight, 2);
    expect(svg).toContain(`width="${scene.layout.outputWidth}"`);
    expect(svg).toContain("</svg>");
  });

  it("keeps every emitted coordinate inside the viewBox", () => {
    const { size, modules } = generateMatrix("https://recqr.example/page", "Q");
    const scene = buildScene({ size, modules, logo: null }, baseDesign, noLogo);
    const svg = sceneToSvg(scene);
    const max = Math.max(scene.layout.outputWidth, scene.layout.outputHeight);
    for (const attr of ["x", "y", "cx", "cy"] as const) {
      const re = new RegExp(`\\s${attr}="(-?[\\d.]+)"`, "g");
      for (const match of svg.matchAll(re)) {
        const v = Number(match[1]);
        expect(v).toBeGreaterThanOrEqual(-EPS);
        expect(v).toBeLessThanOrEqual(max + EPS);
      }
    }
  });

  it("escapes frame text to prevent XML injection", () => {
    const { size, modules } = generateMatrix("hi", "M");
    const svg = renderToSvg(
      { size, modules, logo: null },
      { ...baseDesign, frame: true, frameText: "<script>alert(1)</script>" },
      noLogo
    );
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("omits the background rect when transparency is requested", () => {
    const { size, modules } = generateMatrix("hi", "M");
    const opaque = renderToSvg({ size, modules, logo: null }, baseDesign, noLogo);
    const transparent = renderToSvg(
      { size, modules, logo: null },
      { ...baseDesign, transparentBg: true },
      noLogo
    );
    expect(opaque).toContain('fill="#ffffff"');
    expect(transparent).not.toContain('fill="#ffffff"');
  });

  it("uses identical geometry for preview and export", () => {
    const { size, modules } = generateMatrix("https://recqr.example", "H");
    const bitmap = { size, modules, logo: null };
    // The preview and the download both go through buildScene -> same layout.
    const previewScene = buildScene(bitmap, baseDesign, noLogo);
    const exportScene = buildScene(bitmap, baseDesign, noLogo);
    expect(previewScene.layout).toEqual(exportScene.layout);
    expect(renderToSvg(bitmap, baseDesign, noLogo)).toBe(sceneToSvg(exportScene));
  });
});
