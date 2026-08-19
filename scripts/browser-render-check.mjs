/**
 * Real-browser renderer check.
 *
 * Bundles the application renderer + jsQR, runs it inside headless Chromium and
 * verifies the Canvas/PNG export path:
 *   payload -> matrix -> scene -> canvas -> ImageData -> jsQR -> payload
 *
 * Usage:  node scripts/browser-render-check.mjs
 * Env:    CHROMIUM_PATH  path to a Chromium/Chrome binary (default: system)
 */
import { chromium } from "playwright";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const DESIGN = {
  fgColor: "#1C1B1F",
  bgColor: "#FFFFFF",
  transparentBg: false,
  size: 512,
  margin: 4,
  errorCorrection: "M",
  dotStyle: "square",
  eyeStyle: "square",
  frame: false,
  frameText: "",
};

const LOGO = {
  src: null,
  name: null,
  sizeRatio: 0.25,
  padding: 10,
  background: "#FFFFFF",
  roundedBg: true,
};

// 8x8 solid blue PNG.
const LOGO_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHElEQVQoz2NgGAWjYBSMglEwCkbBKBgFo2AUAAAG7wABsx8FpQAAAABJRU5ErkJggg==";

const CASES = [
  { name: "short text / square", payload: "RECQR", design: {} },
  {
    name: "url / rounded modules",
    payload: "https://recqr.example/start",
    design: { dotStyle: "rounded", eyeStyle: "rounded" },
  },
  {
    name: "long url / dots + leaf eyes",
    payload:
      "https://example.com/catalogue/products/2026/spring-summer?utm_source=qr&utm_medium=print&utm_campaign=recqr-launch&variant=44821",
    design: { dotStyle: "dots", eyeStyle: "leaf", errorCorrection: "Q" },
  },
  {
    name: "wifi / frame enabled",
    payload: "WIFI:T:WPA;S:Guest Network;P:s3cr3t-pass;H:true;;",
    design: { frame: true, frameText: "SCAN ME" },
  },
  {
    name: "vcard / quiet zone 2",
    payload:
      "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+15551234567\nEMAIL:jane@recqr.example\nEND:VCARD",
    design: { margin: 2 },
  },
  { name: "unicode", payload: "こんにちは世界 ✅ Grüße", design: {} },
  {
    name: "logo / EC H",
    payload: "https://recqr.example/logo",
    design: { errorCorrection: "H" },
    logo: true,
  },
  {
    name: "logo + frame + rounded",
    payload: "https://recqr.example/logo-frame",
    design: {
      errorCorrection: "H",
      dotStyle: "rounded",
      eyeStyle: "rounded",
      frame: true,
      frameText: "SCAN ME",
    },
    logo: true,
  },
  {
    name: "transparent background",
    payload: "https://recqr.example/transparent",
    design: { transparentBg: true },
  },
];

const bundle = await build({
  entryPoints: [path.join(here, "browser-harness.ts")],
  bundle: true,
  format: "iife",
  write: false,
  platform: "browser",
  target: "es2020",
  absWorkingDir: root,
});
const harness = bundle.outputFiles[0].text;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto("about:blank");
await page.addScriptTag({ content: harness });

let failures = 0;
const rows = [];

for (const testCase of CASES) {
  const design = { ...DESIGN, ...testCase.design };
  const result = await page.evaluate(
    async ([payload, design, logo, logoDataUrl]) =>
      window.__RECQR__.renderPngAndDecode(payload, design, logo, logoDataUrl),
    [testCase.payload, design, LOGO, testCase.logo ? LOGO_PNG : undefined]
  );

  const layout = result.layout;
  const expectedW = Math.round(layout.outputWidth * result.scale);
  const expectedH = Math.round(layout.outputHeight * result.scale);
  const problems = [];

  if (result.decoded !== testCase.payload) problems.push("PNG did not decode to payload");
  if (result.canvasWidth !== expectedW || result.canvasHeight !== expectedH)
    problems.push(`canvas ${result.canvasWidth}x${result.canvasHeight} != ${expectedW}x${expectedH}`);
  if (result.cssWidth !== `${layout.outputWidth}px`)
    problems.push(`css width ${result.cssWidth} != ${layout.outputWidth}px`);
  if (result.bounds.left < -0.01 || result.bounds.top < -0.01)
    problems.push("negative coordinates in scene");
  if (
    result.bounds.right > layout.outputWidth + 0.01 ||
    result.bounds.bottom > layout.outputHeight + 0.01
  )
    problems.push("scene exceeds output bounds");
  if (result.borderInk > 0)
    problems.push(`${result.borderInk} ink pixels on the output border (spill)`);

  // Same-geometry check: the SVG path must produce the identical layout.
  const svgDecoded = await page.evaluate(
    async ([payload, design, logo, logoDataUrl]) => {
      const api = window.__RECQR__;
      const { size, modules } = api.generateMatrix(payload, design.errorCorrection);
      let loaded = null;
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
      const svg = api.renderToSvg({ size, modules, logo: loaded }, design, logo);
      const scene = api.buildScene({ size, modules, logo: loaded }, design, logo);
      return { decoded: await api.decodeSvg(svg, 900), layout: scene.layout };
    },
    [testCase.payload, design, LOGO, testCase.logo ? LOGO_PNG : undefined]
  );

  if (svgDecoded.decoded !== testCase.payload)
    problems.push("SVG did not decode to payload");
  if (JSON.stringify(svgDecoded.layout) !== JSON.stringify(layout))
    problems.push("SVG and Canvas layouts differ");

  if (problems.length) failures++;
  rows.push({
    case: testCase.name,
    output: `${Math.round(layout.outputWidth)}x${Math.round(layout.outputHeight)}`,
    canvas: `${result.canvasWidth}x${result.canvasHeight}`,
    png: result.decoded === testCase.payload ? "decoded" : "FAILED",
    svg: svgDecoded.decoded === testCase.payload ? "decoded" : "FAILED",
    border: result.borderInk,
    status: problems.length ? problems.join("; ") : "ok",
  });
}

console.table(rows);
await browser.close();

if (failures) {
  console.error(`\n${failures} renderer case(s) failed.`);
  process.exit(1);
}
console.log("\nAll browser renderer round-trips passed.");
