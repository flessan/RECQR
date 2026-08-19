# Generator

The generator builds QR codes in four steps:

1. **Complete the content** — choose a preset and fill in its fields.
2. **Design your QR code** — colors, size, quiet zone, error correction, and
   module/finder styles.
3. **Logo / image** — optionally embed a local image in the center.
4. **Download** — export PNG, SVG, or WebP.

## Content presets

| Preset | Payload |
| ------ | ------- |
| Link / Social / App / Image / Video | URL (image and video encode a link to where the media is hosted — QR codes cannot embed binary media) |
| Text | Free-form text |
| E-mail | `mailto:` with subject/body |
| Call | `tel:` |
| SMS | `sms:` with optional body |
| WhatsApp | `https://wa.me/<number>` |
| Wi-Fi | `WIFI:T:…;S:…;P:…;;` (escapes `;`, `,`, `:`, `"`, `\`) |
| vCard | vCard 3.0 |
| Event | VEVENT (iCalendar) |
| Geo | `geo:lat,lng` |

Your settings (except the in-memory logo) are saved to `localStorage` so the
builder keeps its state on reload.

## Design controls

- Foreground and background colors.
- Transparent background (applies to PNG/WebP; SVG is always transparent where
  the background isn't drawn).
- Size 128–1024 px.
- Quiet zone in modules.
- Error correction L/M/Q/H.
- Dot style: square, rounded, dots.
- Finder style: square, rounded, leaf.
- Optional label frame with up to 40 characters of text.

Only controls that actually affect the rendered output are exposed — the
renderer draws modules directly instead of rasterizing a DOM screenshot.

## Logo / image

- Upload any image from your device. It is loaded into an object URL,
  downscaled on a canvas, and composited into the QR — entirely in memory.
- Adjust the logo size (12–30% of the QR), padding, background color, and
  whether the background is rounded.
- When a logo is present, error correction is forced to **H** so the code
  remains scannable.
- A warning appears when the logo covers more than ~25% of the code. Always
  verify scannability with a real phone.

> Your image is processed locally in your browser and is never uploaded.

## Export

- **PNG** — rendered to an offscreen canvas at 2× for crisp output.
- **SVG** — vector output; the logo is embedded as a base64 image.
- **WebP** — smaller raster format where the browser supports it (falls back
  to PNG otherwise).

Filenames use the `recqr-qr` prefix (e.g. `recqr-qr.png`, `recqr-qr.svg`).

## Design system

The UI is built on a small token + component layer in `src/app/globals.css`:

- **Palette** — indigo primary, cyan secondary, lemon tertiary, with full light
  and dark ramps exposed as `--color-*` variables.
- **Shape/shadow** — `--md-radius-*` and `--ui-shadow*` (hard offset shadows).
  These deliberately live *outside* `@theme`, because Tailwind v4 maps `@theme`
  keys onto its own scales (`--spacing-md` once rewrote `max-w-md` to 16px).
- **Components** — `.ui-card`, `.ui-btn` (+ `-primary/-tonal/-surface/-danger/
  -ghost`, `-sm/-lg`), `.ui-icon-btn`, `.ui-chip` (+ `.is-active`),
  `.ui-segment`, `.ui-field`, `.ui-label`, `.ui-badge`, `.ui-step`,
  `.ui-display`, `.ui-underline`, `.ui-dotgrid`.
- Legacy `.md-card` / `.md-*-button` classes are aliased onto the same system so
  older pages stay visually consistent.

## Rendering geometry (single coordinate system)

Preview, PNG, WebP and SVG all come from **one** layout model, so the preview is
never an approximation of the download:

```
QR config -> computeLayout() -> QRLayout -> buildScene() -> Shape[]
                                                 |-- sceneToSvg()  (SVG / preview)
                                                 `-- paintScene()  (Canvas -> PNG/WebP)
```

`QRLayout` (`src/lib/qr/layout.ts`) is defined as:

```
totalModules = matrixSize + quietZone * 2
moduleSize   = requestedSize / totalModules
qrPixelSize  = totalModules * moduleSize   (== requestedSize)
offsetX/Y    = quietZone * moduleSize
outputWidth  = qrPixelSize
outputHeight = qrPixelSize + frameHeight   (frameHeight = 4 modules when a label is set)
```

Every module, finder pattern, logo and frame label is positioned relative to
`offsetX/offsetY`, so the invariant `0 <= x <= outputWidth` and
`0 <= y <= outputHeight` always holds. The SVG carries
`viewBox="0 0 outputWidth outputHeight"` with matching `width`/`height`
attributes; the preview only scales it with CSS (`width:100%; height:auto`).

Additional renderer guarantees:

- Timing and alignment patterns are always drawn as solid squares, even in the
  "rounded"/"dots" styles, because separated shapes there break real decoders.
- A logo can never leave the QR data area, overlap a finder pattern, cover more
  than 30% of the data area, or change the output dimensions; its aspect ratio
  is preserved and error correction is forced to H.
- Canvas exports use a device-pixel scale (2x by default, up to 4x for HiDPI)
  without changing the coordinate system.

## Automated visual / decode QA

Beyond `npm run lint`, `npm test` and `npm run build`:

```bash
npm run dev                 # in one terminal

npm run test:render         # Canvas + SVG rendered in real Chromium, decoded with jsQR
npm run test:visual         # 7 viewports x 6 routes: overflow, clipping, preview decode
npm run test:download       # downloads PNG/SVG from the UI and decodes them
```

These three scripts need `npm i --no-save playwright esbuild` once, and a
Chromium/Chrome binary that can be selected with `CHROMIUM_PATH`. `npm test` itself also
runs an offline round-trip suite that rasterises the generated SVG with resvg
and decodes it with jsQR (`src/lib/qr/decode.test.ts`).

## State architecture

The generator is split into small components rather than one monolith:

- `ContentSelector` — preset tabs and per-preset fields.
- `DesignEditor` — colors, size, error correction, styles.
- `LogoUploader` — local image handling.
- `QRPreview` — live SVG preview (same renderer output as the download).
- `DownloadControls` — format selection and download.
- `useGeneratorState` — content/design/logo/output state with persistence.
- `useQRBitmap` — builds the matrix and loaded logo.
