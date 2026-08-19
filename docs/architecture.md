# Architecture

RECQR is a Next.js (App Router) static export built with TypeScript, Tailwind
CSS v4, and the Material Design 3 theme tokens in `src/app/globals.css`.

## Core QR library (`src/lib/qr/`)

These modules are framework-agnostic (no React) so they can be unit-tested and
reused:

- **`types.ts`** — shared types: `QRResult`, parsed payloads, generator state.
- **`parser.ts`** — `detectQRType`, `parseQR`, and per-format parsers. Handles
  Wi-Fi escaping, vCard line unfolding and parameters, and VEVENT dates.
- **`encoder.ts`** — `buildPayload` turns a generator preset + fields into the
  exact QR string. This keeps scanner and generator using the same format rules.
- **`security.ts`** — URL analysis: protocol allow-list and suspicious-URL
  warnings.
- **`imageDecoder.ts`** — one pipeline for File, Blob, data/object URL, image,
  canvas, and ImageData inputs. Downscales, tries multiple scales/crops, and
  contrast-enhances before calling jsQR.
- **`layout.ts`** — the single QR coordinate system (`QRLayout`): module size,
  quiet zone, offsets, output width/height, finder origins, structural-module
  detection, and logo box geometry.
- **`scene.ts`** — `buildScene()` turns a matrix + design into a renderer-
  agnostic list of primitive shapes expressed in `QRLayout` coordinates, plus
  `shapeBounds`/`sceneBounds` used by the bounds tests.
- **`renderer.ts`** — uses the `qrcode` package for the matrix, then serialises
  the same scene to an SVG string (`sceneToSvg`) or paints it to a 2D canvas
  (`paintScene`/`renderToCanvas`). Preview, PNG, WebP and SVG therefore share
  identical geometry by construction.

## React layer

- **`hooks/useCameraScanner.ts`** — owns the `MediaStream` lifecycle, throttled
  RAF decode loop with dynamic-imported jsQR, torch/zoom capabilities, sound,
  haptics, duplicate detection, and cleanup.
- **`hooks/useGeneratorState.ts`** — content/design/logo/output state with
  `localStorage` persistence; forces error-correction H when a logo is added.
- **`hooks/useQRBitmap.ts`** — memoized matrix plus async-loaded logo bitmap.
- **`store/scanHistory.ts`** — Zustand store persisted to `localStorage` with a
  200-item cap and favorites.

### Scanner components

```
components/scanner/
  QRScanner.tsx         # orchestration
  ScannerViewport.tsx   # <video> + reticle + status overlay
  ScannerControls.tsx   # start/stop, switch, torch, zoom, sound/haptics
  ImageScanner.tsx      # upload, drag-drop, paste
  ScanResultCard.tsx    # typed result UI and actions
  HistoryList.tsx
  resultActions.ts      # open/copy/share/download helpers
```

### Generator components

```
components/generator/
  QRGenerator.tsx       # layout + step orchestration
  ContentSelector.tsx
  DesignEditor.tsx
  LogoUploader.tsx
  QRPreview.tsx
  DownloadControls.tsx
  useMemoMarkup.ts
```

## Data flow

1. A raw QR string arrives from the camera hook or the image decoder.
2. `parseQR` produces a `QRResult` with `raw`, `type`, `parsed`, `timestamp`.
3. The result is shown in `ScanResultCard` and written to the history store.
4. Actions (open, copy, share, download) read from `parsed` and use progressive
   enhancement for optional browser APIs.

## Reliability

- Camera streams are torn down on success, unmount, tab-hidden, and device
  change.
- Object URLs for logos are revoked on removal/unmount.
- The decode RAF is cancelled when scanning stops; decoding is throttled.
- All network-capable actions are guarded by feature detection.
