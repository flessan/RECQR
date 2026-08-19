/**
 * Real-browser responsive validation for the Generator (and the other pages).
 *
 * For every required viewport it checks:
 *   - no horizontal overflow (document scroll width and per-element bounds),
 *   - no element rendered outside the viewport (clipped headings/buttons),
 *   - the QR preview is fully visible inside its surface,
 *   - the preview SVG decodes back to the payload shown on screen,
 *   - the mobile order is Content > Design > Preview > Download.
 *
 * Usage: node scripts/visual-check.mjs [baseUrl] [outDir]
 * Env:   CHROMIUM_PATH  path to a Chromium/Chrome binary
 */
import { chromium } from "playwright";
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const baseUrl = process.argv[2] || "http://localhost:3000";
const outDir = process.argv[3] || path.join(root, ".visual");

const VIEWPORTS = [
  { w: 1440, h: 900, label: "desktop-1440" },
  { w: 1280, h: 800, label: "desktop-1280" },
  { w: 1024, h: 768, label: "small-desktop-1024" },
  { w: 768, h: 1024, label: "tablet-768" },
  { w: 430, h: 932, label: "mobile-430" },
  { w: 390, h: 844, label: "mobile-390" },
  { w: 375, h: 812, label: "mobile-375" },
];

const PAGES = ["/", "/generator", "/scanner", "/features", "/documentation", "/support"];

fs.mkdirSync(outDir, { recursive: true });

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
  args: [
    "--no-sandbox",
    // Lets the scanner page open a real MediaStream so the camera preview can
    // be measured (this is how the 16px-preview regression is caught).
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
  ],
});

const results = [];
let failures = 0;

async function auditOverflow(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const offenders = [];
    // Elements inside an intentionally scrollable box (e.g. a code block or a
    // table wrapper) are allowed to be wider than the viewport.
    const inScrollContainer = (el) => {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const ox = getComputedStyle(node).overflowX;
        // auto/scroll = intentionally scrollable; hidden/clip = intentionally
        // clipped decoration (e.g. the hero's blurred background blobs).
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip")
          return true;
        node = node.parentElement;
      }
      return false;
    };
    for (const el of document.querySelectorAll("body *")) {
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (inScrollContainer(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === "string" ? el.className.slice(0, 70) : "",
          text: (el.textContent || "").trim().slice(0, 40),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
      if (offenders.length > 12) break;
    }
    return {
      innerWidth: vw,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      canScrollX:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      offenders,
    };
  });
}

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    permissions: ["camera"],
  });
  const page = await context.newPage();
  await page.addInitScript({ content: harness });

  for (const route of PAGES) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    if (route === "/generator") {
      const input = page.locator('input[type="url"], input[placeholder*="example.com"]').first();
      if (await input.count()) {
        await input.fill("https://recqr.example/responsive-check");
        await page.waitForTimeout(500);
      }
    }

    let camera = null;
    if (route === "/scanner") {
      const start = page.getByRole("button", { name: /Start scanning/i });
      if (await start.count()) {
        await start.click();
        await page.waitForTimeout(2500);
        camera = await page.evaluate(() => {
          const v = document.querySelector("video");
          if (!v) return null;
          const r = v.getBoundingClientRect();
          const s = getComputedStyle(v);
          return {
            w: Math.round(r.width),
            h: Math.round(r.height),
            left: Math.round(r.left),
            right: Math.round(r.right),
            videoW: v.videoWidth,
            readyState: v.readyState,
            hasStream: !!v.srcObject,
            objectFit: s.objectFit,
            visible: s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0,
          };
        });
      }
    }

    const audit = await auditOverflow(page);
    const problems = [];

    if (route === "/scanner") {
      if (!camera) problems.push("no <video> element on the scanner page");
      else {
        if (!camera.hasStream || camera.readyState === 0)
          problems.push("camera stream did not start");
        if (!camera.visible) problems.push("camera preview is not visible");
        // The preview must be a real viewport, not a collapsed box.
        const minSide = Math.min(280, vp.w - 48);
        if (camera.w < minSide || camera.h < minSide)
          problems.push(`camera preview collapsed to ${camera.w}x${camera.h} (min ${minSide})`);
        if (camera.right > audit.innerWidth + 1 || camera.left < -1)
          problems.push("camera preview outside the viewport");
        if (camera.objectFit !== "cover")
          problems.push(`camera preview object-fit is ${camera.objectFit}`);
      }
    }
    if (audit.scrollWidth > audit.innerWidth)
      problems.push(`document scrolls horizontally (${audit.scrollWidth} > ${audit.innerWidth})`);
    if (audit.offenders.length)
      problems.push(
        `elements outside viewport: ${audit.offenders
          .map((o) => `${o.tag}.${o.cls.split(" ")[0]}[${o.left},${o.right}]`)
          .join(", ")}`
      );

    if (route === "/generator") {
      const gen = await page.evaluate(async () => {
        const vw = window.innerWidth;
        const surface = document.querySelector('[aria-label="Generated QR code preview"]');
        const svg = surface?.querySelector("svg");
        const card = surface?.closest("div[style]");
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return {
            left: Math.round(r.left),
            top: Math.round(r.top),
            right: Math.round(r.right),
            bottom: Math.round(r.bottom),
            w: Math.round(r.width),
            h: Math.round(r.height),
          };
        };
        const headings = [...document.querySelectorAll("h1, h2, h3")].map((h) => ({
          text: (h.textContent || "").trim().slice(0, 32),
          ...rect(h),
        }));
        const buttons = [...document.querySelectorAll("button, a[href], input")].map((b) => ({
          text: (b.textContent || b.getAttribute("placeholder") || "").trim().slice(0, 20),
          ...rect(b),
        }));
        const order = ["content-heading", "design-heading", "preview-heading", "download-heading"]
          .map((id) => {
            const el = document.getElementById(id);
            return el ? Math.round(el.getBoundingClientRect().top) : null;
          });
        let decoded = null;
        if (svg && window.__RECQR__) {
          decoded = await window.__RECQR__.decodeSvg(svg.outerHTML, 900);
        }
        const payload =
          document.querySelector("code")?.textContent?.trim() ?? null;
        return {
          vw,
          svg: svg ? rect(svg) : null,
          card: card ? rect(card) : null,
          viewBox: svg?.getAttribute("viewBox") ?? null,
          headings: headings.filter((h) => h.left < 0 || h.right > vw + 1),
          buttons: buttons.filter((b) => b.left < -1 || b.right > vw + 1),
          order,
          decoded,
          payload,
        };
      });

      if (!gen.svg) problems.push("preview SVG missing");
      if (gen.svg && gen.card) {
        if (gen.svg.right > gen.card.right + 1 || gen.svg.left < gen.card.left - 1)
          problems.push(
            `QR spills out of the preview surface (svg ${gen.svg.left}-${gen.svg.right} vs card ${gen.card.left}-${gen.card.right})`
          );
        if (gen.svg.right > gen.vw + 1) problems.push("QR is wider than the viewport");
      }
      if (gen.headings.length)
        problems.push(`clipped headings: ${gen.headings.map((h) => h.text).join(", ")}`);
      if (gen.buttons.length)
        problems.push(`clipped controls: ${gen.buttons.map((b) => b.text).join(", ")}`);
      if (gen.decoded !== gen.payload)
        problems.push(`preview did not decode to the payload (${gen.decoded})`);
      const [c, d, p, dl] = gen.order;
      if (vp.w < 1024 && c !== null && d !== null && p !== null && dl !== null) {
        if (!(c < d && d < p && p < dl))
          problems.push(`mobile order wrong: content=${c} design=${d} preview=${p} download=${dl}`);
      }
      results.push({
        viewport: `${vp.w}x${vp.h}`,
        route,
        scrollW: audit.scrollWidth,
        qr: gen.svg ? `${gen.svg.w}x${gen.svg.h}` : "-",
        viewBox: gen.viewBox,
        decoded: gen.decoded ? "yes" : "no",
        status: problems.length ? "FAIL" : "ok",
      });
      await page.screenshot({
        path: path.join(outDir, `generator-${vp.label}.png`),
        fullPage: true,
      });
    } else {
      results.push({
        viewport: `${vp.w}x${vp.h}`,
        route,
        scrollW: audit.scrollWidth,
        qr: camera ? `cam ${camera.w}x${camera.h}` : "-",
        viewBox: null,
        decoded: "-",
        status: problems.length ? "FAIL" : "ok",
      });
      if (route === "/scanner") {
        await page.screenshot({
          path: path.join(outDir, `scanner-${vp.label}.png`),
        });
      }
      if (route === "/") {
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 90));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `home-${vp.label}.png`),
        });
      }
    }

    if (problems.length) {
      failures++;
      console.error(`\n✗ ${route} @ ${vp.w}x${vp.h}`);
      for (const p of problems) console.error(`   - ${p}`);
    }
  }

  await context.close();
}

await browser.close();
console.table(results);
console.log(`\nScreenshots written to ${outDir}`);
if (failures) {
  console.error(`${failures} viewport/page combination(s) failed.`);
  process.exit(1);
}
console.log("No horizontal overflow, no clipped controls, preview decodes everywhere.");
