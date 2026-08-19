# GitHub Pages Deployment

RECQR is a Next.js static export (`output: "export"`), so it deploys to GitHub
Pages without any server runtime.

## How the base path works

`next.config.ts` sets `basePath` and `assetPrefix` based on the repository name:

- In **development** (`npm run dev`) there is no base path — links are `/scanner`.
- In **production**, when a repo name is detected, assets are served from
  `/<repo>/` (for example `/RECQR/_next/...`).

The repo name is resolved in this order:

1. `NEXT_PUBLIC_REPO_NAME` environment variable.
2. `GITHUB_REPOSITORY` (set automatically by GitHub Actions).
3. Fallback to `RECQR` when `NODE_ENV === "production"`.

All internal navigation uses Next.js `<Link>`, which prepends `basePath`
automatically. The QR logo and preview are generated in-memory (no asset
URLs), and downloads use Blob URLs, so there are no hard-coded absolute paths.

## The included workflow

`.github/workflows/nextjs.yml` builds with `next build` and uploads `out/` as
a Pages artifact. It uses `actions/configure-pages`, which also detects the
Next.js static-site generator.

To use it:

1. Push to `main`.
2. In the repository settings, set **Pages → Source** to **GitHub Actions**.

## Manual deploy

```bash
NEXT_PUBLIC_REPO_NAME=RECQR npm run build
# Upload the contents of out/ to your Pages branch / host.
```

If you deploy to a custom domain at the root (no `/RECQR/` path), build with an
empty repo name:

```bash
NEXT_PUBLIC_REPO_NAME="" npm run build
```

## Verifying locally

```bash
NEXT_PUBLIC_REPO_NAME=RECQR npm run build
npx serve out
# Visit http://localhost:3000/RECQR/
```

## Notes

- The favicon is an inline SVG data URI, so it works regardless of base path.
- There are no API routes in the static export; all QR logic is client-side.
- The Cloudflare Worker in `worker/` is optional and deployed separately.
