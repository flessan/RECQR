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

## State architecture

The generator is split into small components rather than one monolith:

- `ContentSelector` — preset tabs and per-preset fields.
- `DesignEditor` — colors, size, error correction, styles.
- `LogoUploader` — local image handling.
- `QRPreview` — live SVG preview.
- `DownloadControls` — format selection and download.
- `useGeneratorState` — content/design/logo/output state with persistence.
- `useQRBitmap` — builds the matrix and loaded logo.
