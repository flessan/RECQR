# Generator

RECQR's generator is designed to make a useful QR code quickly. Choose what
you want to share, enter the details, and the preview updates as you type.
The default path does not require you to open any design settings.

## Quick creation

1. Choose a content type.
2. Enter the required details.
3. Check the live preview.
4. Download the QR code.

Popular choices are shown first: Link, Text, Wi-Fi, and Contact. Choose
**More types** for email, phone, SMS, WhatsApp, events, locations, social links,
app links, image URLs, and video URLs.

RECQR validates important fields before enabling export. Examples include
website addresses, email addresses, phone numbers, Wi-Fi passwords, and
latitude/longitude ranges. Messages are written in plain language and explain
what needs to be corrected.

## Content presets

| Preset | Payload |
| ------ | ------- |
| Link / Social / Image / Video | URL (image and video encode a link to hosted media; QR codes cannot embed binary media) |
| App / deep link | A non-dangerous app URI or website URL |
| Text | Free-form text |
| E-mail | \`mailto:\` with subject/body |
| Call | \`tel:\` |
| SMS | \`sms:\` with optional body |
| WhatsApp | \`https://wa.me/<number>\` |
| Wi-Fi | \`WIFI:T:…;S:…;P:…;;\` |
| Contact | vCard 3.0 |
| Event | VEVENT (iCalendar) |
| Location | \`geo:lat,lng\` |

Your content, design preferences, and output format are saved to \`localStorage\`.
Uploaded logo image bytes and object URLs are not persisted across reloads.

## Optional design controls

Open **Customize the design** only when you need more control:

- Foreground and background colors.
- Transparent background.
- Output size from 128 to 1024 px.
- Quiet zone in modules.
- Error correction L/M/Q/H.
- Dot style: square, rounded, dots.
- Finder style: square, rounded, leaf.
- Optional label frame with up to 40 characters.

The defaults are intended to be easy to scan. Keep a strong contrast between
the QR foreground and its background, and avoid removing the quiet zone.

## Optional logo

Logos are optional and are processed locally. RECQR validates the image before
using it, limits uploads to 8 MB, and downsizes the embedded image for output.

- Adjust the logo size (12–30% of the QR), padding, background colour, and
  rounded background.
- When a logo is present, error correction is forced to **H**.
- Large logos show a warning. Smaller logos are more reliable; always test
  printed or shared QR codes with a real phone.

## Export

- **PNG** - raster image for everyday use.
- **SVG** - vector output for scaling and print; an uploaded logo is embedded
  inside the SVG.
- **WebP** - smaller raster image where the browser supports it. RECQR falls
  back to PNG and explains the fallback when WebP encoding is unavailable.

Download generation reports errors instead of leaving the button stuck in a
loading state. The filename starts with \`recqr-qr\`.

## Rendering geometry (single coordinate system)

Preview, PNG, WebP and SVG all come from **one** layout model, so the preview is
never an approximation of the download:

\`\`\`
QR config -> computeLayout() -> QRLayout -> buildScene() -> Shape[]
                                                 |-- sceneToSvg()  (SVG / preview)
                                                 \`-- paintScene()  (Canvas -> PNG/WebP)
\`\`\`

The renderer uses one coordinate system for modules, finder patterns, logo,
quiet zone and optional label frame. The SVG and Canvas output share the same
scene, keeping preview and download geometry aligned.

## Automated QA

\`\`\`bash
npm run lint
npm test
npm run test:pwa
npm run build
\`\`\`

Browser checks are also available with Playwright and Chromium:

\`\`\`bash
npm run test:render
npm run test:visual
npm run test:download
\`\`\`
