# Contributing

Thanks for your interest in RECQR!

## Development workflow

1. Fork and clone the repository.
2. Install dependencies: `npm install`.
3. Create a branch: `git checkout -b my-change`.
4. Run the dev server: `npm run dev`.
5. Make your change.
6. Before submitting, run:
   - `npm run lint`
   - `npm test`
   - `npm run build`

## What belongs where

- Put reusable QR logic in `src/lib/qr/` (no React imports) so it can be tested
  in isolation.
- Put React hooks in `src/lib/hooks/`.
- Keep components small; the scanner and generator are split under
  `src/components/scanner/` and `src/components/generator/`.
- Add or update Vitest tests in `src/lib/qr/*.test.ts` for parsing, encoding,
  security, and rendering changes.

## Coding conventions

- TypeScript strict mode is on; avoid `any`.
- Use the Material Design 3 CSS variables (`--color-*`) instead of hard-coded
  colors.
- Support keyboard navigation, visible focus, and `prefers-reduced-motion`.
- Treat all decoded QR content as untrusted (see [security](./security.md)).

## Pull requests

- Describe what changed and why.
- Reference any related issue.
- Keep PRs focused; avoid reformatting unrelated code.

## Reporting bugs

Open an issue with steps to reproduce, the browser/device, and (if relevant) a
screenshot or the QR payload. Never share sensitive QR content.
