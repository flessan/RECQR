# Security Model

All decoded QR content is treated as **untrusted input**.

## No automatic navigation

Scanned URLs are never opened automatically. The result card shows the
hostname and path first, and navigation only happens when the user explicitly
presses **Open link**. The previous "auto-open URLs" behavior was removed.

## Protocol allow-list

`src/lib/qr/security.ts` allows only these schemes to open:

- `http:`
- `https:`
- `mailto:`
- `tel:`

The following are blocked and will not open:

- `javascript:`
- `data:`
- `file:`
- `vbscript:`
- `blob:` (opened as a top-level navigation)

## URL warnings

Even for safe `http(s)` URLs, the UI warns when a URL:

- uses an IP address instead of a hostname;
- contains punycode/unicode (possible homograph attack);
- embeds credentials (`user:pass@host`);
- has an unusual number of subdomains;
- is a known URL shortener (hides the destination);
- uses a non-standard port.

## No HTML injection

- Decoded text is rendered through React text nodes, which escape content by
  default.
- The only use of `dangerouslySetInnerHTML` is the QR preview SVG, which is
  generated entirely from our own numeric/enum values and XML-escaped text in
  `src/lib/qr/renderer.ts`.
- The JSON-LD metadata in `layout.tsx` is a static, build-time object.
- QR content is never assigned to `innerHTML`, `document.write`, or evaluated.

## Downloads

- `.vcf` and `.ics` downloads are generated from the parsed/raw content and
  saved via a Blob URL that is revoked after the click.
- Filenames are fixed (`contact.vcf`, `event.ics`, `recqr-qr.txt`,
  `recqr-qr.png/svg/webp`).

## Camera permissions

- Camera access is requested only after an explicit user action.
- The `MediaStream` is stopped on success, when the component unmounts, when
  the tab is hidden, and when the camera device disappears.
- If permission is denied, a clear message is shown and image upload/paste
  remains available.

## Reporting a vulnerability

Please open a private issue on GitHub. Avoid posting exploit details publicly
until a fix is available.
