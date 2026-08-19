# RECQR

A modern, open-source **QR scanner and generator** that runs entirely in your
browser. Built with Next.js (App Router, static export), TypeScript, Tailwind
CSS v4, and a Material Design 3 theme. Hosted on GitHub Pages.

> **Privacy-first.** Camera frames, uploaded images, and generated QR codes
> never leave your device. There are no accounts, trackers, analytics, or
> required backend services.

## Features

### Scanner

- **Real-time camera scanning** with throttled, low-CPU decoding (preview and
  decode loop are separate; frames are downscaled).
- **Rear/front camera switching**, plus **torch** and **zoom** when the device
  supports them.
- **Proper camera lifecycle** — streams are stopped on success, unmount, tab
  hidden, and device removal.
- **Sound and haptic feedback** (progressive enhancement).
- **Image scanning** via file upload, **drag & drop**, and **Ctrl/⌘+V paste**
  — all through one local decode pipeline with multi-scale/crop/contrast
  preprocessing.
- **Duplicate detection** and a manual **scan again** action.
- **Clear error states** for denied permission, no camera, and busy camera.

### Smart results

Parses and shows tailored actions for: URLs, text, email, phone, SMS,
WhatsApp, Wi-Fi, vCard, calendar events, and geo coordinates.

- URLs show the **hostname first**, warn on suspicious links, and are **never
  opened automatically**; `javascript:`/`data:`/`file:` are blocked.
- Wi-Fi shows SSID/security with reveal/hide password and copy.
- vCard downloads `.vcf`; events download `.ics`.
- Geo opens in maps; text downloads `.txt`.
- Copy and Web Share are used with fallbacks.

### Scan history

- Saved locally in `localStorage` (timestamp, type, raw value, parsed data).
- Favorites, per-item delete, and clear (keeps favorites), capped at 200
  non-favorite entries.

### Generator

A step-based builder (Content → Design → Logo → Download):

- Presets for link, text, e-mail, call, SMS, WhatsApp, Wi-Fi, vCard, event,
  geo, social, app/deep link, image, and video (media presets encode a link to
  where the media is hosted).
- Colors, transparent background, size, quiet zone, error correction (L–H),
  dot/module styles, finder styles, and an optional label frame.
- **Browser-only logo/image embedding** — preview, resize, padding, and rounded
  background; error correction is forced to H and oversized logos warn you.
- **PNG, SVG, and WebP** download with meaningful filenames (`recqr-qr.*`).
- Settings persist in `localStorage`.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, `output: "export"`)
- React 19 + TypeScript
- Tailwind CSS v4 with Material Design 3 tokens
- [jsQR](https://github.com/cozmo/jsqr) for decoding
- [`qrcode`](https://github.com/soldair/node-qrcode) for matrix generation
- [Zustand](https://zustand-demo.pmnd.rs/) for persisted history
- [Vitest](https://vitest.dev/) for tests

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build & test

```bash
npm run lint
npm test         # unit tests + SVG->pixels->jsQR decode round-trips (resvg)
npm run build    # static export into ./out
```

Browser-level checks (require a running `npm run dev`, a one-off
`npm i --no-save playwright esbuild`, and a Chromium binary — set
`CHROMIUM_PATH` to use one you already have):

```bash
npm run test:render     # Canvas/SVG rendered in real Chromium, decoded with jsQR
npm run test:visual     # 7 viewports x 6 routes: horizontal overflow, clipping,
                        # QR bounds, preview decode, mobile section order
npm run test:download   # downloads PNG/SVG from the UI and decodes them
```

## GitHub Pages

The included workflow (`.github/workflows/nextjs.yml`) builds and deploys on
push to `main`. `basePath`/`assetPrefix` are configured automatically from the
repository name. See [`docs/github-pages.md`](docs/github-pages.md).

## Optional Cloudflare Worker

`worker/` contains an **optional** Hono Worker that generates QR SVGs over
HTTP. The web app does not use it — scanning and generation are 100%
client-side. There is no server-side decode endpoint by design. See
[`docs/api.md`](docs/api.md).

## Documentation

See the [`docs/`](docs/README.md) directory:

- [Getting started](docs/getting-started.md)
- [Scanner](docs/scanner.md)
- [Generator](docs/generator.md)
- [Supported QR formats](docs/qr-formats.md)
- [Privacy](docs/privacy.md)
- [Security model](docs/security.md)
- [Browser support](docs/browser-support.md)
- [GitHub Pages](docs/github-pages.md)
- [Architecture](docs/architecture.md)
- [Optional Edge API](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](docs/contributing.md)

## What is NOT included

To avoid overpromising, RECQR does **not** provide:

- Dynamic/editable QR codes
- Analytics or scan tracking
- Official SDKs (JS/React/Flutter/etc.)
- Webhooks
- A server-side QR image decoder

These could exist as separate services but are intentionally out of scope of
the privacy-first web app.

## License

MIT — see [LICENSE](LICENSE).
