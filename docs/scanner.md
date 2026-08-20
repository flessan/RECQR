# Scanner

The scanner can read QR codes from a live camera feed or from an image.
Everything runs locally - the camera stream and any image you provide are
processed in your browser and are never uploaded.

## Real-time camera scanning

- Press **Start scanning** and grant camera permission when prompted.
- Point the camera at a QR code; it is detected automatically.
- After a successful scan the camera stops. Press **Scan again** to resume.

### Performance

The preview and the decode loop are separate. The camera preview runs at the
device's native resolution, but decoding is throttled to roughly 12 attempts
per second on a downscaled frame (max ~960 px). This keeps CPU usage low on
mobile devices while still detecting codes quickly.

### Camera controls

- **Switch camera** - toggle between the rear and front camera (only shown when
  more than one camera is available).
- **Torch** - toggle the flash when the device/browser exposes
  `MediaTrackCapabilities.torch`.
- **Zoom** - slider shown when `MediaTrackCapabilities.zoom` is available.
- **Beep / vibration** - optional audio and haptic feedback on a successful
  scan (vibration requires the Vibration API).

These controls degrade gracefully: if a feature isn't supported by the browser
or device, the corresponding button simply isn't shown.

## Image scanning

Three input methods share one decoder pipeline (`src/lib/qr/imageDecoder.ts`):

- **Choose image** - select a file from disk.
- **Drag & drop** - drop an image anywhere on the drop zone.
- **Paste** - press `Ctrl/⌘ + V`, or use the **Paste** button to read an image
  from the clipboard.

The decoder automatically:

- downscales very large images;
- tries several scales/crops if the first attempt fails;
- applies contrast enhancement as a last resort;
- reports clear status messages for no-image, invalid-image, and no-QR-found
  cases.

## Results and actions

Each result is parsed into a typed structure:

| Type     | Actions |
| -------- | ------- |
| URL      | Show hostname, warnings, then **Open** / Copy / Share |
| Wi-Fi    | Show SSID/security, reveal/hide password, copy |
| vCard    | Show contact, download `.vcf`, copy |
| Event    | Show event, download `.ics` |
| Geo      | Show coordinates, open in maps |
| Email / phone / SMS / WhatsApp | Open the corresponding app, copy |
| Text     | Copy / share / download `.txt` |

URLs are **never opened automatically**.

## History

Scans are saved to your browser's `localStorage` (key
`recqr-scan-history`), with timestamps, parsed data, and a favorite flag.
Non-favorite history is capped at 200 entries. You can delete individual
entries or clear all non-favorites. History never leaves your device.

## Permissions and errors

The scanner distinguishes:

- permission denied;
- no camera found;
- camera in use by another app;
- unsupported browser (no `getUserMedia`);
- camera disconnection while scanning.

Each case shows a specific message and the image-based scanner remains
available as a fallback.
