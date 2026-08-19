# Troubleshooting

## The camera won't start

- The site must be served over **HTTPS** (or `http://localhost`). Camera access
  requires a secure context.
- Grant camera permission in your browser's site settings.
- On iOS, use Safari (camera access is restricted in some third-party browsers).
- Make sure no other application is using the camera, then press **Start
  scanning** again.
- If no camera is available, upload or paste an image instead.

## A QR code isn't detected

- Hold the camera steady so the code fills the reticle.
- Improve lighting and avoid glare.
- Try moving closer/farther; the decoder downsizes frames for performance.
- For images, use a clear, high-contrast screenshot. The decoder tries several
  scales and a center crop, but very small or heavily skewed codes may fail.

## Paste doesn't work

- Press `Ctrl/⌘ + V` while the scanner page is focused.
- Some browsers only allow clipboard image reading after a user gesture; use the
  **Paste** button or upload the image.
- On desktop, copy the image itself (not a link to it).

## Torch or zoom controls are missing

These are shown only when the device/browser exposes the `torch` or `zoom`
media track capabilities. Many laptops and front cameras do not support them.

## Downloads don't work

- Pop-up or download blockers can interfere; allow downloads for the site.
- WebP falls back to PNG in browsers without WebP encoding.

## History disappeared

History is stored in `localStorage`. Clearing browser data, using private
browsing, or switching browsers/devices will not carry it over. Favorites are
kept when you clear history; non-favorites are capped at 200 entries.

## GitHub Pages shows 404 / broken assets

- Ensure the build used the correct repository name as the base path. See
  [GitHub Pages](./github-pages.md).
- If using a custom domain at the root, build with
  `NEXT_PUBLIC_REPO_NAME=""`.

## Something still isn't working

Open an issue at <https://github.com/flessan/RECQR/issues> with your browser,
OS, and the steps to reproduce.
