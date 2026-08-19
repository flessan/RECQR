# Browser Support

RECQR uses standard, widely-supported web APIs. Features are applied with
progressive enhancement — if an API is unavailable, the related control is
hidden rather than failing.

## Required

- A modern browser with ES2020 support (Chrome/Edge, Firefox, Safari 15+).
- JavaScript enabled.

## Feature support

| Feature | API used | Fallback |
| ------- | -------- | -------- |
| Camera scanning | `navigator.mediaDevices.getUserMedia` | Upload / paste / drag-drop image scanning |
| Image decode | Canvas 2D + jsQR | — |
| Torch | `MediaTrackCapabilities.torch` + `applyConstraints` | Button hidden |
| Zoom | `MediaTrackCapabilities.zoom` | Slider hidden |
| Camera switch | `facingMode` | Button hidden when only one camera |
| Vibration | `navigator.vibrate` | Silently ignored |
| Beep | Web Audio `AudioContext` | Silently ignored |
| Clipboard paste | `clipboardData.items` / `navigator.clipboard.read()` | File picker / drop zone |
| Share | `navigator.share` | Button hidden; Copy remains |
| Copy | `navigator.clipboard.writeText` | Legacy `execCommand('copy')` |
| Downloads | `URL.createObjectURL` + anchor click | — |
| History | `localStorage` | In-memory if storage is unavailable |

## HTTPS / secure context

Camera access (`getUserMedia`) and the Async Clipboard API require a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).
This means the site must be served over HTTPS or `http://localhost` in
development. GitHub Pages provides HTTPS automatically.

## Mobile

- Android Chrome and iOS Safari 15+ are supported.
- On iOS, camera permission is requested per-site; paste requires a user
  gesture.
- The scanner layout is responsive and usable one-handed in portrait.
