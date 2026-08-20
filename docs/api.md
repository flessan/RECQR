# Optional Edge API (Cloudflare Worker)

The web app does **not** depend on any backend. Camera scanning, image
scanning, QR generation, logo processing, and history are all client-side.

The `worker/` directory contains an optional Cloudflare Worker that can
generate QR codes as SVG over HTTP. It uses [Hono](https://hono.dev) and
[`uqr`](https://github.com/nicepkg/uqr).

## Run locally

```bash
cd worker
npm install
npm run dev
```

## Deploy

```bash
cd worker
npm run deploy   # requires Wrangler authentication
```

## Endpoints

### `GET /`

Health/version JSON.

### `GET /health`

Returns `{ "status": "ok" }`.

### `GET /v1/qr/generate`

| Param    | Default    | Description |
| -------- | ---------- | ----------- |
| `text`   | -          | **Required.** Content to encode. |
| `margin` | `2`        | Quiet-zone modules. |
| `fg`     | `#000000`  | Foreground color. |
| `bg`     | `#ffffff`  | Background color. |
| `format` | `svg`      | `svg` returns the image directly; `json` returns `{ success, data: { text, svg } }`. |

```bash
curl "https://your-worker.workers.dev/v1/qr/generate?text=https://example.com"
```

### Intentionally not implemented

- **Decoding:** there is no server-side decode endpoint. Decoding happens in the
  browser by design (see [privacy](./privacy.md)).
- **Dynamic QR codes, analytics, SDKs, and webhooks** are not part of RECQR and
  are not offered.
