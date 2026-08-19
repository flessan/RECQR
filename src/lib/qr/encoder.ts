import type { ContentPreset, GeneratorContent } from "./types";

/** Escape special characters in a WIFI/MeCard style value. */
function escapeQRValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/([\\;,:"])/g, "\\$1")
    .replace(/\n/g, "\\n");
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

/**
 * Build the actual QR payload string for the active content preset.
 * Image/Video/Social/App/deep-link all produce a URL payload (QR codes cannot
 * embed binary media — they link to where the media is hosted).
 */
export function buildPayload(content: GeneratorContent): string {
  const { preset, data } = content;
  const d = (k: string) => clean(data[k]);

  switch (preset) {
    case "link":
    case "social":
    case "app":
    case "image":
    case "video": {
      const url = d("url");
      return ensureScheme(url);
    }
    case "text":
      return d("text");
    case "email": {
      const to = d("to");
      const params = new URLSearchParams();
      if (d("subject")) params.set("subject", d("subject"));
      if (d("body")) params.set("body", d("body"));
      const query = params.toString();
      return `mailto:${to}${query ? `?${query}` : ""}`;
    }
    case "call":
      return `tel:${d("number")}`;
    case "sms": {
      const number = d("number");
      const body = d("body");
      return body
        ? `sms:${number}?body=${encodeURIComponent(body)}`
        : `sms:${number}`;
    }
    case "whatsapp": {
      const number = d("number").replace(/[^0-9]/g, "");
      const text = d("text");
      const query = text ? `?text=${encodeURIComponent(text)}` : "";
      return `https://wa.me/${number}${query}`;
    }
    case "wifi": {
      const ssid = d("ssid");
      const password = d("password");
      const encryption = (d("encryption") || "WPA").toUpperCase();
      const hidden = d("hidden") === "true";
      const parts = [
        `T:${encryption}`,
        `S:${escapeQRValue(ssid)}`,
      ];
      if (encryption !== "NOPASS") parts.push(`P:${escapeQRValue(password)}`);
      if (hidden) parts.push(`H:true`);
      return `WIFI:${parts.join(";")};;`;
    }
    case "vcard": {
      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      const first = d("firstName");
      const last = d("lastName");
      const full = d("formattedName") || [first, last].filter(Boolean).join(" ");
      lines.push(`N:${last};${first};;;`);
      lines.push(`FN:${full}`);
      if (d("organization")) lines.push(`ORG:${d("organization")}`);
      if (d("title")) lines.push(`TITLE:${d("title")}`);
      if (d("phone")) lines.push(`TEL;TYPE=CELL:${d("phone")}`);
      if (d("email")) lines.push(`EMAIL:${d("email")}`);
      if (d("url")) lines.push(`URL:${d("url")}`);
      if (d("address")) lines.push(`ADR:;;${d("address")};;;;`);
      if (d("note")) lines.push(`NOTE:${d("note")}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "event": {
      const lines = ["BEGIN:VEVENT"];
      if (d("summary")) lines.push(`SUMMARY:${d("summary")}`);
      if (d("start")) lines.push(`DTSTART:${formatICalDate(d("start"))}`);
      if (d("end")) lines.push(`DTEND:${formatICalDate(d("end"))}`);
      if (d("location")) lines.push(`LOCATION:${d("location")}`);
      if (d("description")) lines.push(`DESCRIPTION:${d("description")}`);
      lines.push("END:VEVENT");
      return lines.join("\n");
    }
    case "geo": {
      const lat = d("latitude");
      const lng = d("longitude");
      const query = d("query");
      const q = query ? `?q=${encodeURIComponent(query)}` : "";
      return `geo:${lat},${lng}${q}`;
    }
    default:
      return "";
  }
}

export function ensureScheme(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Format a `YYYY-MM-DDTHH:mm` local input (the value of <input type="datetime-local">)
 *  into basic iCalendar local time: YYYYMMDDTHHMMSS. */
export function formatICalDate(value: string): string {
  const m = value.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return value.replace(/[-:]/g, "");
  const [, y, mo, d, h, mi] = m;
  return `${y}${mo}${d}T${h || "00"}${mi || "00"}00`;
}

/**
 * Required field(s) per preset. A payload is only meaningful once these are
 * filled in — otherwise `buildPayload` produces placeholders such as `tel:`,
 * `geo:,` or an empty-SSID Wi-Fi string, which encode into a QR nobody can use.
 */
const REQUIRED_FIELDS: Record<ContentPreset, string[]> = {
  link: ["url"],
  social: ["url"],
  app: ["url"],
  image: ["url"],
  video: ["url"],
  text: ["text"],
  email: ["to"],
  call: ["number"],
  sms: ["number"],
  whatsapp: ["number"],
  wifi: ["ssid"],
  vcard: ["formattedName", "firstName", "lastName"],
  event: ["summary"],
  geo: ["latitude", "longitude"],
};

/**
 * True when the active preset has everything it needs to produce a usable
 * payload. vCard accepts any name field; geo needs both coordinates.
 */
export function hasRequiredContent(content: GeneratorContent): boolean {
  const required = REQUIRED_FIELDS[content.preset] ?? [];
  if (!required.length) return buildPayload(content).trim().length > 0;
  const filled = (k: string) => clean(content.data[k]).length > 0;
  if (content.preset === "vcard") return required.some(filled);
  if (content.preset === "geo") {
    return required.every(
      (k) => filled(k) && Number.isFinite(Number(clean(content.data[k])))
    );
  }
  return required.every(filled);
}

/** Human-readable hint describing what is still missing, or null when ready. */
export function missingContentHint(content: GeneratorContent): string | null {
  if (hasRequiredContent(content)) return null;
  switch (content.preset) {
    case "text":
      return "Enter the text you want to encode.";
    case "email":
      return "Enter the recipient e-mail address.";
    case "call":
    case "sms":
    case "whatsapp":
      return "Enter a phone number.";
    case "wifi":
      return "Enter the network name (SSID).";
    case "vcard":
      return "Enter at least a name.";
    case "event":
      return "Enter the event title.";
    case "geo":
      return "Enter both latitude and longitude.";
    default:
      return "Enter a URL to generate the QR code.";
  }
}

/** Default per-preset content (used when switching presets or resetting). */
export function defaultContent(preset: ContentPreset): Record<string, string> {
  switch (preset) {
    case "link":
    case "social":
    case "app":
    case "image":
    case "video":
      return { url: "" };
    case "text":
      return { text: "" };
    case "email":
      return { to: "", subject: "", body: "" };
    case "call":
      return { number: "" };
    case "sms":
      return { number: "", body: "" };
    case "whatsapp":
      return { number: "", text: "" };
    case "wifi":
      return {
        ssid: "",
        password: "",
        encryption: "WPA",
        hidden: "false",
      };
    case "vcard":
      return {
        formattedName: "",
        firstName: "",
        lastName: "",
        organization: "",
        title: "",
        phone: "",
        email: "",
        url: "",
        address: "",
        note: "",
      };
    case "event":
      return { summary: "", start: "", end: "", location: "", description: "" };
    case "geo":
      return { latitude: "", longitude: "", query: "" };
    default:
      return {};
  }
}
