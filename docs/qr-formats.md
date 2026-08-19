# Supported QR Formats

RECQR detects and parses the following formats. The raw decoded string is
always preserved alongside the parsed structure.

| Format | Detected by | Parsed fields |
| ------ | ----------- | ------------- |
| URL | `http(s)://` or bare `domain.tld` | protocol, host, path, query, safety flags |
| Text | fallback | raw text |
| Email | `mailto:` | to, cc, bcc, subject, body |
| Phone | `tel:` | number |
| SMS | `sms:` / `smsto:` | number, body |
| WhatsApp | `whatsapp://` or `wa.me` | number, text |
| Wi-Fi | `WIFI:` | ssid, password, encryption, hidden |
| vCard | `BEGIN:VCARD` | name, org, title, phones, emails, url, address |
| Calendar | `BEGIN:VEVENT` / `BEGIN:VCALENDAR` | summary, start/end, location, description |
| Geo | `geo:` | latitude, longitude, query |

## Escaping

Wi-Fi and MeCard-style values unescape `\;`, `\,`, `\:`, `\"`, and `\\`. The
encoder applies the inverse escaping when generating these payloads.

## vCard

- Property parameters (e.g. `TEL;TYPE=CELL:`) are recognized.
- Folded lines (a leading space on the next line) are unfolded per RFC 6350.
- Version 2.1 and 3.0 are accepted; export uses 3.0.

## Calendar

iCalendar dates are normalized to ISO-like strings (`YYYY-MM-DD` or
`YYYY-MM-DDTHH:MM:SS`) for display. Downloads are written as `.ics`.

## Geo

`geo:lat,lng` and `geo:lat,lng?q=...` are supported; coordinates open in
Google Maps.

## What about 2D barcode text?

Any other valid text is treated as plain text and can be copied, shared, or
downloaded. RECQR focuses on QR codes (model 2); other 2D symbologies such as
Aztec, Data Matrix, or PDF417 are not decoded.
