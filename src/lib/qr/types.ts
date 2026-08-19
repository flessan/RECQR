// Core domain types shared by the scanner, generator, history and parser.

export type QRCodeType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "vcard"
  | "calendar"
  | "geo";

/**
 * Normalized result of decoding + parsing a QR code payload.
 * `raw` is always preserved exactly as decoded; `parsed` carries structured
 * data when the payload matches a known format.
 */
export interface QRResult {
  raw: string;
  type: QRCodeType;
  parsed?: ParsedPayload;
  timestamp: number;
}

export type ParsedPayload =
  | UrlPayload
  | TextPayload
  | EmailPayload
  | PhonePayload
  | SmsPayload
  | WhatsAppPayload
  | WiFiPayload
  | VCardPayload
  | CalendarPayload
  | GeoPayload;

export interface UrlPayload {
  kind: "url";
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  /** True when the URL uses a scheme that is safe to open in a browser. */
  isSafe: boolean;
  /** Heuristic flags for suspicious/phishing-looking URLs. */
  warnings: UrlWarning[];
}

export type UrlWarning =
  | "dangerous-protocol"
  | "raw-ip"
  | "punycode"
  | "many-subdomains"
  | "credentials-in-url"
  | "shortened-link"
  | "non-http-port";

export interface TextPayload {
  kind: "text";
  text: string;
}

export interface EmailPayload {
  kind: "email";
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
}

export interface PhonePayload {
  kind: "phone";
  number: string;
}

export interface SmsPayload {
  kind: "sms";
  number: string;
  body?: string;
}

export interface WhatsAppPayload {
  kind: "whatsapp";
  number: string;
  text?: string;
}

export type WiFiEncryption = "WPA" | "WEP" | "nopass" | "WPA2-EAP" | string;

export interface WiFiPayload {
  kind: "wifi";
  ssid: string;
  password?: string;
  encryption: WiFiEncryption;
  hidden: boolean;
}

export interface VCardPayload {
  kind: "vcard";
  version?: string;
  formattedName?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: Array<{ value: string; type?: string }>;
  email?: Array<{ value: string; type?: string }>;
  url?: string;
  address?: string;
  note?: string;
  birthday?: string;
}

export interface CalendarPayload {
  kind: "calendar";
  summary?: string;
  description?: string;
  location?: string;
  start?: string;
  end?: string;
  /** ISO-ish UTC timestamps when parseable. */
  startISO?: string;
  endISO?: string;
  organizer?: string;
}

export interface GeoPayload {
  kind: "geo";
  latitude: number;
  longitude: number;
  query?: string;
  zoom?: number;
}

// ---- Generator types -------------------------------------------------------

export type ContentPreset =
  | "link"
  | "text"
  | "email"
  | "call"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "vcard"
  | "event"
  | "geo"
  | "social"
  | "app"
  | "image"
  | "video";

export interface GeneratorContent {
  preset: ContentPreset;
  /** Free-form fields specific to the active preset. */
  data: Record<string, string>;
}

export type DotStyle = "square" | "rounded" | "dots";
export type EyeStyle = "square" | "rounded" | "leaf";

export interface GeneratorDesign {
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  size: number;
  margin: number;
  errorCorrection: "L" | "M" | "Q" | "H";
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  frame: boolean;
  frameText: string;
}

export interface LogoSettings {
  /** Object URL for the in-memory image; null when no logo is set. */
  src: string | null;
  /** Original file name (for display only). */
  name: string | null;
  sizeRatio: number; // 0.1 - 0.35 of QR size
  padding: number; // px around logo
  background: string;
  roundedBg: boolean;
}

export interface OutputSettings {
  format: "png" | "svg" | "webp";
}

export interface GeneratorState {
  content: GeneratorContent;
  design: GeneratorDesign;
  logo: LogoSettings;
  output: OutputSettings;
}

// ---- Scan history ----------------------------------------------------------

export interface ScanRecord {
  id: string;
  raw: string;
  type: QRCodeType;
  parsed?: ParsedPayload;
  timestamp: number;
  favorite: boolean;
}
