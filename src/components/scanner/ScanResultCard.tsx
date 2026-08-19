"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldAlert,
  User,
  Wifi,
  FileText,
  RefreshCw,
} from "lucide-react";
import type { QRResult } from "@/lib/qr/types";
import {
  calendarToIcs,
  copyToClipboard,
  downloadText,
  openResult,
  shareResult,
  vCardToVcf,
} from "./resultActions";

interface Props {
  result: QRResult;
  onScanAgain: () => void;
}

export default function ScanResultCard({ result, onScanAgain }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [revealPassword, setRevealPassword] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const copy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const handleOpen = () => openResult(result);

  return (
    <div
      className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-5 sm:p-6"
      role="region"
      aria-label="Scan result"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
          <TypeIcon type={result.type} />
          <span className="capitalize">{result.type}</span>
        </h3>
        <button
          onClick={onScanAgain}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] px-3 py-1.5 rounded-full transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Scan again
        </button>
      </div>

      {result.parsed?.kind === "url" && (
        <UrlBody result={result} onCopy={copy} copiedKey={copied} />
      )}
      {result.parsed?.kind === "wifi" && (
        <WifiBody
          result={result}
          reveal={revealPassword}
          setReveal={setRevealPassword}
          onCopy={copy}
          copiedKey={copied}
        />
      )}
      {result.parsed?.kind === "vcard" && (
        <VCardBody result={result} onCopy={copy} copiedKey={copied} />
      )}
      {result.parsed?.kind === "calendar" && (
        <CalendarBody result={result} />
      )}
      {result.parsed?.kind === "geo" && <GeoBody result={result} />}
      {result.parsed?.kind === "email" && (
        <KV rows={[
          ["To", result.parsed.to.join(", ")],
          ...(result.parsed.subject ? ([["Subject", result.parsed.subject]] as KVRow[]) : []),
          ...(result.parsed.body ? ([["Body", result.parsed.body]] as KVRow[]) : []),
        ]} />
      )}
      {result.parsed?.kind === "phone" && (
        <KV rows={[["Number", result.parsed.number]]} />
      )}
      {result.parsed?.kind === "sms" && (
        <KV rows={[
          ["Number", result.parsed.number],
          ...(result.parsed.body ? ([["Message", result.parsed.body]] as KVRow[]) : []),
        ]} />
      )}
      {result.parsed?.kind === "whatsapp" && (
        <KV rows={[
          ["Number", result.parsed.number],
          ...(result.parsed.text ? ([["Message", result.parsed.text]] as KVRow[]) : []),
        ]} />
      )}
      {(!result.parsed || result.parsed.kind === "text") && (
        <pre className="whitespace-pre-wrap break-words text-sm text-[var(--color-on-surface)] bg-[var(--color-surface-container)] rounded-xl p-4 font-sans">
          {result.raw}
        </pre>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {canOpen(result) && (
          <ActionButton primary onClick={handleOpen} icon={<ExternalLink className="w-4 h-4" />}>
            {openLabel(result)}
          </ActionButton>
        )}
        <ActionButton
          onClick={() => copy("raw", result.raw)}
          icon={copied === "raw" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        >
          {copied === "raw" ? "Copied" : "Copy"}
        </ActionButton>
        {canShare && (
          <ActionButton
            onClick={() => shareResult(result)}
            icon={<Share2 className="w-4 h-4" />}
          >
            Share
          </ActionButton>
        )}
        {result.parsed?.kind === "vcard" && (
          <ActionButton
            onClick={() => downloadText("contact.vcf", vCardToVcf(result), "text/vcard")}
            icon={<Download className="w-4 h-4" />}
          >
            Download .vcf
          </ActionButton>
        )}
        {result.parsed?.kind === "calendar" && (
          <ActionButton
            onClick={() => downloadText("event.ics", calendarToIcs(result), "text/calendar")}
            icon={<Download className="w-4 h-4" />}
          >
            Download .ics
          </ActionButton>
        )}
        {result.type === "text" && (
          <ActionButton
            onClick={() => downloadText("recqr-qr.txt", result.raw)}
            icon={<Download className="w-4 h-4" />}
          >
            Download .txt
          </ActionButton>
        )}
      </div>
    </div>
  );
}

function canOpen(result: QRResult): boolean {
  return ["url", "email", "phone", "sms", "whatsapp", "geo"].includes(result.type);
}

function openLabel(result: QRResult): string {
  if (result.type === "geo") return "Open map";
  if (result.type === "email") return "Send email";
  if (result.type === "phone") return "Call";
  if (result.type === "sms" || result.type === "whatsapp") return "Open message";
  return "Open link";
}

function TypeIcon({ type }: { type: QRResult["type"] }) {
  const cls = "w-5 h-5 text-[var(--color-primary)]";
  switch (type) {
    case "url": return <ExternalLink className={cls} />;
    case "wifi": return <Wifi className={cls} />;
    case "email": return <Mail className={cls} />;
    case "phone": return <Phone className={cls} />;
    case "sms": return <MessageSquare className={cls} />;
    case "whatsapp": return <MessageSquare className={cls} />;
    case "geo": return <MapPin className={cls} />;
    case "calendar": return <Calendar className={cls} />;
    case "vcard": return <User className={cls} />;
    default: return <FileText className={cls} />;
  }
}

function ActionButton({
  children,
  onClick,
  icon,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium hover:opacity-90 transition-opacity"
          : "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-medium hover:bg-[var(--color-surface-container-high)] transition-colors"
      }
    >
      {icon}
      {children}
    </button>
  );
}

type KVRow = [string, string];

function KV({ rows }: { rows: KVRow[] }) {
  return (
    <dl className="space-y-2 bg-[var(--color-surface-container)] rounded-xl p-4">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">{k}</dt>
          <dd className="text-sm text-[var(--color-on-surface)] break-all">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function UrlBody({
  result,
  onCopy,
  copiedKey,
}: {
  result: QRResult;
  onCopy: (key: string, text: string) => void;
  copiedKey: string | null;
}) {
  if (result.parsed?.kind !== "url") return null;
  const u = result.parsed;
  return (
    <div className="space-y-3">
      <div className="bg-[var(--color-surface-container)] rounded-xl p-4">
        <div className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)] mb-1">
          Website
        </div>
        <div className="font-medium text-[var(--color-on-surface)] break-all">
          {u.hostname}
        </div>
        <div className="text-xs text-[var(--color-on-surface-variant)] break-all mt-1">
          {u.pathname || "/"}{u.search}{u.hash}
        </div>
      </div>
      {!u.isSafe && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--color-error-container)] text-[var(--color-on-error-container)] text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Unsafe link blocked.</strong> This URL uses a potentially
            dangerous protocol ({u.protocol}). Opening it is disabled.
          </div>
        </div>
      )}
      {u.isSafe && u.warnings.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Proceed with caution.</strong> This link
            {u.warnings.includes("punycode") ? " uses unicode characters that may look like another domain (punycode)" : ""}
            {u.warnings.includes("raw-ip") ? " points directly to an IP address" : ""}
            {u.warnings.includes("shortened-link") ? " is a URL shortener (destination hidden)" : ""}
            {u.warnings.includes("credentials-in-url") ? " embeds login credentials" : ""}
            {u.warnings.includes("many-subdomains") ? " has an unusual number of subdomains" : ""}
            {u.warnings.includes("non-http-port") ? " uses a non-standard port" : ""}.
            Verify the destination before opening.
          </div>
        </div>
      )}
      <button
        onClick={() => onCopy("url", u.href)}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        {copiedKey === "url" ? "Copied full URL" : "Copy full URL"}
      </button>
    </div>
  );
}

function WifiBody({
  result,
  reveal,
  setReveal,
  onCopy,
  copiedKey,
}: {
  result: QRResult;
  reveal: boolean;
  setReveal: (v: boolean) => void;
  onCopy: (key: string, text: string) => void;
  copiedKey: string | null;
}) {
  if (result.parsed?.kind !== "wifi") return null;
  const w = result.parsed;
  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] flex items-center justify-center">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-[var(--color-on-surface)] break-all">{w.ssid || "Hidden network"}</div>
          <div className="text-xs text-[var(--color-on-surface-variant)]">{w.encryption} · {w.hidden ? "Hidden" : "Visible"}</div>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)] mb-1">Password</div>
        <div className="flex items-center justify-between gap-2 bg-[var(--color-surface-container-high)] rounded-lg px-3 py-2">
          <code className="text-sm font-mono break-all">
            {w.password ? (reveal ? w.password : "•".repeat(Math.min(12, w.password.length))) : "None (open network)"}
          </code>
          {w.password && (
            <button
              onClick={() => setReveal(!reveal)}
              className="text-xs text-[var(--color-primary)] font-medium whitespace-nowrap"
            >
              {reveal ? "Hide" : "Reveal"}
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onCopy("ssid", w.ssid)}
          className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-outline-variant)]"
        >
          {copiedKey === "ssid" ? "Copied SSID" : "Copy SSID"}
        </button>
        {w.password && (
          <button
            onClick={() => onCopy("pw", w.password!)}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-outline-variant)]"
          >
            {copiedKey === "pw" ? "Copied" : "Copy password"}
          </button>
        )}
      </div>
    </div>
  );
}

function VCardBody({ result, onCopy, copiedKey }: { result: QRResult; onCopy: (k: string, t: string) => void; copiedKey: string | null }) {
  if (result.parsed?.kind !== "vcard") return null;
  const c = result.parsed;
  const rows: KVRow[] = [];
  if (c.formattedName) rows.push(["Name", c.formattedName]);
  if (c.organization) rows.push(["Organization", c.organization]);
  if (c.title) rows.push(["Title", c.title]);
  if (c.phone?.[0]) rows.push(["Phone", c.phone.map((p) => p.value).join(", ")]);
  if (c.email?.[0]) rows.push(["Email", c.email.map((e) => e.value).join(", ")]);
  if (c.url) rows.push(["Website", c.url]);
  if (c.address) rows.push(["Address", c.address]);
  return (
    <div className="bg-[var(--color-surface-container)] rounded-xl p-4 space-y-3">
      <KV rows={rows} />
      <button
        onClick={() => onCopy("card", result.raw)}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        {copiedKey === "card" ? "Copied" : "Copy vCard data"}
      </button>
    </div>
  );
}

function CalendarBody({ result }: { result: QRResult }) {
  if (result.parsed?.kind !== "calendar") return null;
  const e = result.parsed;
  const rows: KVRow[] = [];
  if (e.summary) rows.push(["Event", e.summary]);
  if (e.startISO) rows.push(["Start", e.startISO]);
  if (e.endISO) rows.push(["End", e.endISO]);
  if (e.location) rows.push(["Location", e.location]);
  if (e.description) rows.push(["Description", e.description]);
  return <KV rows={rows} />;
}

function GeoBody({ result }: { result: QRResult }) {
  if (result.parsed?.kind !== "geo") return null;
  const g = result.parsed;
  const rows: KVRow[] = [
    ["Latitude", String(g.latitude)],
    ["Longitude", String(g.longitude)],
  ];
  if (g.query) rows.push(["Place", g.query]);
  return <KV rows={rows} />;
}
