import type { UrlPayload, UrlWarning } from "./types";

/** Protocols that are safe to open from a scanned QR result. */
export const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Protocols that must never be auto-opened because they can execute script
 * or exfiltrate data when handed to the browser.
 */
export const BLOCKED_PROTOCOLS = new Set([
  "javascript:",
  "data:",
  "file:",
  "vbscript:",
  "blob:",
]);

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
]);

/**
 * Parse a string as a URL and decide whether it is safe to offer an "open"
 * action for. Never throws — invalid input returns null.
 */
export function analyzeUrl(raw: string): UrlPayload | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const protocol = url.protocol.toLowerCase();
  const isSafe =
    SAFE_PROTOCOLS.has(protocol) && !BLOCKED_PROTOCOLS.has(protocol);

  const warnings: UrlWarning[] = [];

  if (!isSafe) warnings.push("dangerous-protocol");
  if (/^xn--/.test(url.hostname) || url.hostname.includes("xn--")) {
    warnings.push("punycode");
  }
  if (/^\d{1,3}(\.\d{1,3}){3}/.test(url.hostname)) {
    warnings.push("raw-ip");
  }
  if (url.username || url.password) {
    warnings.push("credentials-in-url");
  }
  const labels = url.hostname.split(".").filter(Boolean);
  if (labels.length > 4) warnings.push("many-subdomains");
  if (URL_SHORTENERS.has(url.hostname.toLowerCase().replace(/^www\./, ""))) {
    warnings.push("shortened-link");
  }
  if (url.port && !["80", "443", ""].includes(url.port)) {
    warnings.push("non-http-port");
  }

  return {
    kind: "url",
    href: url.href,
    protocol,
    host: url.host,
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    isSafe,
    warnings,
  };
}

/** Whether a scanned string should be treated as a navigable URL. */
export function isLikelyUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (/^(https?|mailto|tel):/i.test(trimmed)) return true;
  // Bare "example.com" — only treat as URL when it has a path-like dot+TLD.
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|[:?#]|$)/i.test(trimmed);
}

/**
 * Best-effort sanitize arbitrary decoded text before inserting it into the
 * DOM as text content. React already escapes text nodes, but this guards the
 * rare places where we build strings (downloads, titles).
 */
export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}
