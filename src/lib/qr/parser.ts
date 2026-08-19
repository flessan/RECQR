import { analyzeUrl, isLikelyUrl } from "./security";
import type {
  CalendarPayload,
  EmailPayload,
  GeoPayload,
  ParsedPayload,
  QRCodeType,
  QRResult,
  SmsPayload,
  TextPayload,
  VCardPayload,
  WiFiPayload,
  WhatsAppPayload,
} from "./types";

/**
 * Unescape a MeCard / WiFi / vCard style value where `\;`, `\,`, `\:` and `\"`
 * are used to embed structural characters.
 */
export function unescapeQRValue(value: string): string {
  return value
    .replace(/\\([\\;,:"])/g, "$1")
    .replace(/\\n/gi, "\n")
    .replace(/\\\\/g, "\\");
}

/** Parse a WIFI:T:...;S:...;P:...;H:...;; payload. */
export function parseWiFi(raw: string): WiFiPayload | null {
  const body = raw.replace(/^WIFI:/i, "");
  const fields = parseSemicolonFields(body);
  const encryption = (fields.get("T") || "nopass").toUpperCase() || "nopass";
  const ssid = fields.get("S");
  if (ssid === undefined) return null;
  return {
    kind: "wifi",
    ssid: unescapeQRValue(ssid),
    password: fields.has("P")
      ? unescapeQRValue(fields.get("P") || "")
      : undefined,
    encryption,
    hidden: fields.get("H")?.toLowerCase() === "true",
  };
}

/**
 * Parse semicolon-delimited `KEY:value` pairs, honoring backslash escapes so
 * that `\;` inside a value does not terminate the field.
 */
function parseSemicolonFields(body: string): Map<string, string> {
  const fields = new Map<string, string>();
  let current = "";
  let escaped = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (escaped) {
      current += ch;
      escaped = false;
    } else if (ch === "\\") {
      current += ch;
      escaped = true;
    } else if (ch === ";") {
      assignField(fields, current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) assignField(fields, current);
  return fields;
}

function assignField(fields: Map<string, string>, chunk: string) {
  const idx = chunk.indexOf(":");
  if (idx === -1) return;
  const key = chunk.slice(0, idx).toUpperCase();
  const value = chunk.slice(idx + 1);
  if (!fields.has(key)) fields.set(key, value);
}

/** Parse a `mailto:` URI. */
export function parseEmail(raw: string): EmailPayload | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol.toLowerCase() !== "mailto:") return null;
  const to = url.pathname
    ? decodeURIComponent(url.pathname).split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const params = url.searchParams;
  const splitList = (key: string) =>
    (params.get(key) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return {
    kind: "email",
    to,
    cc: splitList("cc"),
    bcc: splitList("bcc"),
    subject: params.get("subject") || undefined,
    body: params.get("body") || undefined,
  };
}

/** Parse `tel:` URIs. */
export function parsePhone(raw: string): { kind: "phone"; number: string } | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // `tel:+1234` always parses, but guard anyway.
    return null;
  }
  if (url.protocol.toLowerCase() !== "tel:") return null;
  return { kind: "phone", number: url.pathname.replace(/[^0-9+*#]/g, "") };
}

/** Parse `sms:` / `smsto:` URIs (RFC 5724 + common Android/Apple variants). */
export function parseSms(raw: string): SmsPayload | null {
  const match = raw.match(/^(sms|smsto):([^?]*)(\?.*)?$/i);
  if (!match) return null;
  const number = decodeURIComponent(match[2] || "").split(",")[0].trim();
  const query = match[3] || "";
  let body: string | undefined;
  try {
    const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
    body = params.get("body") || undefined;
  } catch {
    body = undefined;
  }
  return { kind: "sms", number, body };
}

/** Parse WhatsApp payloads: `whatsapp://send?phone=...&text=...` and `https://wa.me/<num>?text=...`. */
export function parseWhatsApp(raw: string): WhatsAppPayload | null {
  const lower = raw.toLowerCase();
  if (lower.startsWith("whatsapp://")) {
    try {
      const u = new URL(raw);
      return {
        kind: "whatsapp",
        number: u.searchParams.get("phone") || "",
        text: u.searchParams.get("text") || undefined,
      };
    } catch {
      return { kind: "whatsapp", number: "" };
    }
  }
  const wa = raw.match(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\/(?:send\?phone=)?(\+?[0-9]+)/i);
  if (wa) {
    let text: string | undefined;
    try {
      text = new URL(raw).searchParams.get("text") || undefined;
    } catch {
      /* ignore */
    }
    return { kind: "whatsapp", number: wa[2], text };
  }
  return null;
}

/** Parse a `geo:lat,lon` URI (RFC 5870). */
export function parseGeo(raw: string): GeoPayload | null {
  const match = raw.match(/^geo:([-0-9.]+),([-0-9.]+)(.*)$/i);
  if (!match) return null;
  const latitude = parseFloat(match[1]);
  const longitude = parseFloat(match[2]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  const rest = match[3] || "";
  let query: string | undefined;
  let zoom: number | undefined;
  if (rest.startsWith("?") || rest.startsWith(";")) {
    const qPart = rest.startsWith("?") ? rest.slice(1) : rest.replace(/^;u=/, "");
    if (rest.startsWith(";")) {
      const u = rest.match(/u=([0-9.]+)/);
      if (u) zoom = parseFloat(u[1]);
    } else {
      const params = new URLSearchParams(qPart);
      query = params.get("q") || undefined;
      const z = params.get("z");
      if (z) zoom = parseFloat(z);
    }
  }
  return { kind: "geo", latitude, longitude, query, zoom };
}

/** Parse a vCard 3.0/2.1 payload into a structured object. */
export function parseVCard(raw: string): VCardPayload | null {
  if (!/BEGIN:VCARD/i.test(raw)) return null;
  const lines = unfoldVCard(raw.split(/\r?\n/));
  const card: VCardPayload = { kind: "vcard", phone: [], email: [] };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const namePart = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const [name, ...params] = namePart.split(";");
    const upper = name.toUpperCase();
    const typeParam = params
      .find((p) => p.toUpperCase().startsWith("TYPE="))
      ?.split("=")[1];
    switch (upper) {
      case "VERSION":
        card.version = value;
        break;
      case "FN":
        card.formattedName = unescapeQRValue(value);
        break;
      case "N": {
        const parts = value.split(";");
        card.lastName = unescapeQRValue(parts[0] || "").trim() || undefined;
        card.firstName = unescapeQRValue(parts[1] || "").trim() || undefined;
        break;
      }
      case "ORG":
        card.organization = unescapeQRValue(value.split(";")[0]);
        break;
      case "TITLE":
        card.title = unescapeQRValue(value);
        break;
      case "TEL":
        card.phone!.push({
          value: unescapeQRValue(value).trim(),
          type: typeParam,
        });
        break;
      case "EMAIL":
        card.email!.push({
          value: unescapeQRValue(value).trim(),
          type: typeParam,
        });
        break;
      case "URL":
        card.url = unescapeQRValue(value);
        break;
      case "ADR":
        card.address = unescapeQRValue(
          value.split(";").filter(Boolean).join(", ")
        );
        break;
      case "NOTE":
        card.note = unescapeQRValue(value);
        break;
      case "BDAY":
        card.birthday = value;
        break;
    }
  }
  if (!card.formattedName) {
    card.formattedName = [card.firstName, card.lastName]
      .filter(Boolean)
      .join(" ");
  }
  return card;
}

/** vCard lines that start with a space/tab are continuations of the prior line. */
function unfoldVCard(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      // RFC 6350: a continuation line starts with a single space/tab, which is
      // itself part of the content (so "Long\n Name" unfolds to "Long Name").
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

/** Parse an iCalendar VEVENT (only the first event is used). */
export function parseCalendar(raw: string): CalendarPayload | null {
  if (!/BEGIN:VEVENT/i.test(raw)) return null;
  const lines = raw.split(/\r?\n/).map((l) => l.trim());
  const event: CalendarPayload = { kind: "calendar" };
  let inEvent = false;
  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) {
      inEvent = true;
      continue;
    }
    if (/^END:VEVENT/i.test(line)) break;
    if (!inEvent) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).split(";")[0].toUpperCase();
    const value = line.slice(colon + 1);
    switch (key) {
      case "SUMMARY":
        event.summary = unescapeQRValue(value);
        break;
      case "DESCRIPTION":
        event.description = unescapeQRValue(value);
        break;
      case "LOCATION":
        event.location = unescapeQRValue(value);
        break;
      case "DTSTART":
        event.start = value;
        event.startISO = parseICalDate(value);
        break;
      case "DTEND":
        event.end = value;
        event.endISO = parseICalDate(value);
        break;
      case "ORGANIZER":
        event.organizer = value.replace(/^mailto:/i, "");
        break;
    }
  }
  return event;
}

function parseICalDate(value: string): string | undefined {
  // VALUE=DATE: 20240131  or  DATE-TIME: 20240131T120000Z / with TZID
  const m = value.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s, z] = m;
  const iso = `${y}-${mo}-${d}`;
  if (h) return `${iso}T${h}:${mi}:${s || "00"}${z || ""}`;
  return iso;
}

/** Detect the high-level QR type without parsing the payload. */
export function detectQRType(raw: string): QRCodeType {
  const text = raw.trim();
  if (/^wifi:/i.test(text)) return "wifi";
  if (/^mailto:/i.test(text)) return "email";
  if (/^tel:/i.test(text)) return "phone";
  if (/^(sms|smsto):/i.test(text)) return "sms";
  if (parseWhatsApp(text)) return "whatsapp";
  if (/^geo:/i.test(text)) return "geo";
  if (/^begin:vcard/i.test(text)) return "vcard";
  if (/^begin:vevent/i.test(text) || /^begin:vcalendar/i.test(text)) {
    return "calendar";
  }
  if (isLikelyUrl(text)) return "url";
  return "text";
}

/** Parse a raw decoded string into a structured QR result. Always returns `raw`. */
export function parseQR(raw: string, timestamp = Date.now()): QRResult {
  const type = detectQRType(raw);
  let parsed: ParsedPayload | undefined;
  switch (type) {
    case "url": {
      let candidate = raw.trim();
      if (!/^[a-z]+:/i.test(candidate)) candidate = `https://${candidate}`;
      const url = analyzeUrl(candidate);
      if (url) parsed = url;
      else parsed = { kind: "text", text: raw } satisfies TextPayload;
      break;
    }
    case "wifi":
      parsed = parseWiFi(raw) || undefined;
      break;
    case "email":
      parsed = parseEmail(raw) || undefined;
      break;
    case "phone":
      parsed = parsePhone(raw) || undefined;
      break;
    case "sms":
      parsed = parseSms(raw) || undefined;
      break;
    case "whatsapp":
      parsed = parseWhatsApp(raw) || undefined;
      break;
    case "geo":
      parsed = parseGeo(raw) || undefined;
      break;
    case "vcard":
      parsed = parseVCard(raw) || undefined;
      break;
    case "calendar":
      parsed = parseCalendar(raw) || undefined;
      break;
    default:
      parsed = { kind: "text", text: raw };
  }
  return { raw, type, parsed, timestamp };
}
