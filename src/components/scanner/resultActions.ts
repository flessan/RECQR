import type { QRResult } from "@/lib/qr/types";
import { SAFE_PROTOCOLS } from "@/lib/qr/security";

export interface ResultAction {
  id: string;
  label: string;
  variant: "primary" | "secondary";
  run: () => void;
  available: boolean;
}

function safeOpen(href: string) {
  try {
    const u = new URL(href, window.location.origin);
    if (!SAFE_PROTOCOLS.has(u.protocol)) return;
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  } catch {
    /* ignore */
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function shareResult(result: QRResult): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ text: result.raw });
    return true;
  } catch {
    return false;
  }
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openResult(result: QRResult): boolean {
  const p = result.parsed;
  if (!p) return false;
  switch (p.kind) {
    case "url":
      if (p.isSafe) {
        safeOpen(p.href);
        return true;
      }
      return false;
    case "email": {
      const params = new URLSearchParams();
      if (p.subject) params.set("subject", p.subject);
      if (p.body) params.set("body", p.body);
      if (p.cc?.length) params.set("cc", p.cc.join(","));
      if (p.bcc?.length) params.set("bcc", p.bcc.join(","));
      const q = params.toString();
      window.location.href = `mailto:${p.to.join(",")}${q ? `?${q}` : ""}`;
      return true;
    }
    case "phone":
      window.location.href = `tel:${p.number}`;
      return true;
    case "sms": {
      const q = p.body ? `?body=${encodeURIComponent(p.body)}` : "";
      window.location.href = `sms:${p.number}${q}`;
      return true;
    }
    case "whatsapp": {
      const q = p.text ? `?text=${encodeURIComponent(p.text)}` : "";
      safeOpen(`https://wa.me/${p.number.replace(/[^0-9]/g, "")}${q}`);
      return true;
    }
    case "geo":
      safeOpen(
        `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
      );
      return true;
    default:
      return false;
  }
}

export function vCardToVcf(result: QRResult): string {
  if (result.parsed?.kind !== "vcard") return result.raw;
  // The raw payload is already a valid VCARD; return it for .vcf download.
  return result.raw;
}

export function calendarToIcs(result: QRResult): string {
  if (result.parsed?.kind !== "calendar") return result.raw;
  const e = result.parsed;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RECQR//EN",
    "BEGIN:VEVENT",
    e.summary ? `SUMMARY:${e.summary}` : "",
    e.start ? `DTSTART:${e.start}` : "",
    e.end ? `DTEND:${e.end}` : "",
    e.location ? `LOCATION:${e.location}` : "",
    e.description ? `DESCRIPTION:${e.description}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}
