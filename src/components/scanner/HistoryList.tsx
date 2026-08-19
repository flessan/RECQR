"use client";

import { Star, Trash2 } from "lucide-react";
import type { ScanRecord } from "@/lib/qr/types";

interface Props {
  scans: ScanRecord[];
  onSelect: (scan: ScanRecord) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

function typeLabel(s: ScanRecord): string {
  if (s.parsed?.kind === "url") return s.parsed.hostname;
  if (s.parsed?.kind === "wifi") return s.parsed.ssid || "Wi-Fi";
  if (s.parsed?.kind === "vcard") return s.parsed.formattedName || "Contact";
  if (s.parsed?.kind === "email") return s.parsed.to.join(", ") || "Email";
  if (s.parsed?.kind === "phone") return s.parsed.number;
  return s.raw.slice(0, 60);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function HistoryList({
  scans,
  onSelect,
  onToggleFavorite,
  onDelete,
}: Props) {
  return (
    <ul className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
      {scans.map((s) => (
        <li
          key={s.id}
          className="group flex items-start gap-2 p-2 rounded-xl hover:bg-[var(--color-surface-container-high)] transition-colors"
        >
          <button
            onClick={() => onSelect(s)}
            className="flex-1 text-left min-w-0"
          >
            <div className="text-sm font-medium text-[var(--color-on-surface)] truncate">
              {typeLabel(s)}
            </div>
            <div className="text-xs text-[var(--color-on-surface-variant)] truncate">
              <span className="uppercase tracking-wide">{s.type}</span> ·{" "}
              {timeAgo(s.timestamp)}
            </div>
          </button>
          <button
            onClick={() => onToggleFavorite(s.id)}
            aria-label={s.favorite ? "Unfavorite" : "Favorite"}
            className={`p-1.5 rounded-full transition-colors ${
              s.favorite
                ? "text-yellow-500"
                : "text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100"
            }`}
          >
            <Star className="w-4 h-4" fill={s.favorite ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onDelete(s.id)}
            aria-label="Delete scan"
            className="p-1.5 rounded-full text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-error)] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
