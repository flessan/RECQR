import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = resolve(root, "public/manifest.webmanifest");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

assert.equal(manifest.name, "RECQR - QR Scanner & Generator");
assert.equal(manifest.short_name, "RECQR");
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (const icon of manifest.icons) {
  assert.match(icon.src, /^\.\/icons\/[a-z0-9-]+\.png$/i);
  assert.ok(icon.purpose.split(/\s+/).includes("any"));

  const file = resolve(root, "public", icon.src.replace(/^\.\//, ""));
  const bytes = await readFile(file);
  assert.deepEqual(bytes.subarray(0, 8), pngSignature, `${icon.src} must be a PNG`);

  const [expectedWidth, expectedHeight] = icon.sizes.split("x").map(Number);
  assert.equal(bytes.readUInt32BE(16), expectedWidth, `${icon.src} width`);
  assert.equal(bytes.readUInt32BE(20), expectedHeight, `${icon.src} height`);
}

console.log("PWA manifest and icon assets are valid.");
