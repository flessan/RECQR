# Privacy

RECQR is designed to keep your data on your device.

## What stays in your browser

- **Camera frames** — decoded locally with [jsQR](https://github.com/cozmo/jsQR).
  No frame is transmitted.
- **Uploaded, dropped, or pasted images** — decoded through
  `src/lib/qr/imageDecoder.ts`. The file is read into memory, drawn to a
  canvas, and decoded without any network request.
- **Generator content and logos** — the QR matrix is generated with the `qrcode`
  library and composed on a canvas/SVG in the page. Logos are held in object
  URLs; nothing is uploaded.
- **Scan history** — stored in `localStorage` under `recqr-scan-history`. It is
  never sent anywhere.
- **Generator settings** — stored in `localStorage` under
  `recqr-generator-state` (logo object URLs are intentionally not persisted).
- **Theme preference** — stored as `recqr-theme`.

## What does NOT happen

- No analytics or tracking scripts.
- No advertising.
- No accounts or authentication.
- No server-side processing required by the web app.

## Optional Cloudflare Worker

The repository includes a small Worker (`worker/`) that can generate QR SVGs
over HTTP. The web app does **not** call it. If you deploy and use it yourself,
only the text you pass in the `text` query parameter is sent to it, and it does
not store anything.

## Clearing your data

Use **History → Clear** to remove non-favorite scans, or clear site data in
your browser to remove all localStorage entries. Object URLs for logos are
revoked when the logo is removed or the page unloads.
