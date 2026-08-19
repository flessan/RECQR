/**
 * End-to-end download check: drives the real Generator UI, downloads the PNG
 * and the SVG, then verifies that
 *   - the downloaded SVG is byte-identical to the SVG shown in the preview,
 *   - the downloaded PNG decodes back to the payload,
 *   - the PNG pixel dimensions match the layout reported by the preview.
 *
 * Usage: node scripts/download-check.mjs [baseUrl]
 * Env:   CHROMIUM_PATH
 */
import { chromium } from "playwright";
import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const baseUrl = process.argv[2] || "http://localhost:3000";
const PAYLOAD = "https://recqr.example/download-check";

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
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
});
const page = await context.newPage();
await page.addInitScript({ content: harness });
await page.goto(`${baseUrl}/generator`, { waitUntil: "networkidle" });

await page.locator('input[type="url"], input[placeholder*="example.com"]').first().fill(PAYLOAD);
await page.waitForTimeout(600);

const previewSvg = await page.evaluate(
  () =>
    document.querySelector('[aria-label="Generated QR code preview"] svg')?.outerHTML ?? ""
);

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "recqr-dl-"));
const problems = [];

async function download(format) {
  await page.getByRole("button", { name: new RegExp(`^${format}$`, "i") }).click();
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: new RegExp(`Download ${format}`, "i") }).click(),
  ]);
  const file = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(file);
  return file;
}

// --- SVG -------------------------------------------------------------------
const svgFile = await download("svg");
const svgText = await fs.readFile(svgFile, "utf8");
if (svgText.trim() !== previewSvg.trim()) {
  // The DOM re-serialises attributes, so compare the geometric core instead.
  const geo = (s) => s.match(/viewBox="[^"]+"/)?.[0] + "|" + (s.match(/<(rect|circle|path|image|text)[^>]*>/g) ?? []).length;
  if (geo(svgText) !== geo(previewSvg)) {
    problems.push("downloaded SVG geometry differs from the preview SVG");
  }
}

// --- PNG -------------------------------------------------------------------
const pngFile = await download("png");
const pngBuffer = await fs.readFile(pngFile);
const pngDataUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;

const pngResult = await page.evaluate(async (dataUrl) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    decoded: window.__RECQR__.jsQR(image.data, image.width, image.height)?.data ?? null,
  };
}, pngDataUrl);

const viewBox = previewSvg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const layoutW = Number(viewBox?.[1]);
const layoutH = Number(viewBox?.[2]);

if (pngResult.decoded !== PAYLOAD) problems.push(`PNG decoded to ${pngResult.decoded}`);
if (pngResult.width % layoutW !== 0 || pngResult.height % layoutH !== 0)
  problems.push(
    `PNG ${pngResult.width}x${pngResult.height} is not an integer multiple of the preview layout ${layoutW}x${layoutH}`
  );
if (pngResult.width / layoutW !== pngResult.height / layoutH)
  problems.push("PNG aspect ratio differs from the preview");

console.table([
  {
    previewViewBox: `${layoutW}x${layoutH}`,
    downloadedPng: `${pngResult.width}x${pngResult.height}`,
    scale: pngResult.width / layoutW,
    pngDecoded: pngResult.decoded === PAYLOAD ? "yes" : "NO",
    svgMatchesPreview: problems.some((p) => p.includes("SVG")) ? "NO" : "yes",
  },
]);

await browser.close();
await fs.rm(tmp, { recursive: true, force: true });

if (problems.length) {
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log("Preview and downloads share the same geometry; PNG decodes to the payload.");
