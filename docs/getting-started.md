# Getting Started

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
git clone https://github.com/flessan/RECQR.git
cd RECQR
npm install
```

## Develop

```bash
npm run dev
```

Open http://localhost:3000. The dev server runs without a `basePath`, so all
internal links work as `/scanner`, `/generator`, etc.

## Build (static export)

```bash
npm run build
```

The static site is emitted to `out/`. It contains only HTML, CSS, and
JavaScript - no Node server is required.

## Test

```bash
npm test          # run the Vitest suite once
npm run test:watch
```

## Lint

```bash
npm run lint
```

## Project layout

```
src/
  app/                 # Next.js App Router routes
  components/
    scanner/           # Camera scanner, image scanner, result cards, history
    generator/         # Step-based QR builder and preview
    layout/            # Navigation and footer
    sections/          # Landing page sections
  lib/
    qr/                # Core, framework-agnostic QR logic
      parser.ts        # Detect + parse all supported formats
      encoder.ts       # Build payload strings for every generator preset
      renderer.ts      # Matrix generation, SVG and Canvas rendering, export
      security.ts      # URL safety analysis
      imageDecoder.ts  # Unified image/QR decode pipeline
      types.ts
    hooks/             # useCameraScanner, useGeneratorState, useQRBitmap
    store/             # Zustand + localStorage scan history
```
