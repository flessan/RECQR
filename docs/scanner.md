# Scanner

RECQR is designed for the everyday question: **"What is inside this QR code?"**
You do not need to grant camera access or install another app. Copy a screenshot,
paste it into the scanner, and RECQR shows the decoded contents.

All decoding runs locally in your browser. Images and camera frames are never
uploaded.

## Read a screenshot

1. Take or copy a screenshot that contains the QR code.
2. Open the RECQR scanner.
3. Press \`Ctrl + V\` on Windows/Linux or \`⌘ + V\` on macOS.
4. The result appears as soon as a QR code is found.

You can also choose an image, use **Paste from clipboard**, or drag an image
onto the drop area. Ordinary text pastes are ignored by the image handler, so
normal clipboard use continues to work.

The image reader accepts common browser-supported image formats and rejects
empty files or files larger than 30 MB with a clear message. A local thumbnail
helps confirm which screenshot was read.

## How image decoding works

The decoder in \`src/lib/qr/imageDecoder.ts\` uses a bounded, local-only pipeline:

1. Decode the full image at a capped working resolution.
2. Use the browser's native \`BarcodeDetector\` when available.
3. Fall back to jsQR with inverted-colour detection.
4. Try alternate scales for screenshots resized by messaging or social apps.
5. Search overlapping crop windows so small QR codes near the edge are not
   missed just because they are outside the centre.
6. Apply grayscale and contrast recovery as a final attempt.

The pipeline releases temporary image resources and reports a useful message
when an image cannot be decoded. A failed attempt never opens a link.

## Results and safety

RECQR explains the type of content it found and presents the decoded data in a
readable form:

| Type | What RECQR shows |
| --- | --- |
| Website | Full destination, domain, suspicious-link warnings, and a manual open action |
| Wi-Fi | Network name, security, and a reveal/hide password control |
| Contact | Name, organisation, phone, email, and other contact details |
| Event | Event title, time, location, and description |
| Location | Coordinates and an action to open the map |
| Email / phone / SMS / WhatsApp | Recipient or number and any prefilled message |
| Text | The exact text stored in the QR code |

A website is **never opened automatically**. Unsafe schemes such as
\`javascript:\`, \`data:\`, and \`file:\` are shown as blocked destinations and
cannot be opened through RECQR. Shortened URLs and other suspicious patterns
are flagged so users can inspect the destination before deciding what to do.

The original QR payload remains available under **Show original QR data**.
Copy, share, contact downloads, and calendar downloads are available when they
match the content type.

## Optional live camera

Open **Use your camera instead** when you want to scan a physical QR code.
Camera access is optional and is requested only after you choose to start it.

- **Switch camera** changes between the rear and front cameras where available.
- **Torch** and **zoom** appear only when supported by the device.
- **Beep and vibration** can be enabled or disabled.
- A successful camera scan stops the stream. Choose **Read another** to start
  a new scan.

## History

Scans are saved to this browser's \`localStorage\` (\`recqr-scan-history\`).
Favorites remain when clearing history, and non-favorite entries are capped at
200. History never leaves the device.

