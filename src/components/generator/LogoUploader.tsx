"use client";

import { useRef } from "react";
import { ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import type { LogoSettings } from "@/lib/qr/types";

interface Props {
  logo: LogoSettings;
  onChange: (patch: Partial<LogoSettings>) => void;
  onReset: () => void;
}

export const MAX_LOGO_RATIO = 0.3;
const MIN_LOGO_RATIO = 0.12;

export default function LogoUploader({ logo, onChange, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (logo.src) URL.revokeObjectURL(logo.src);
    const url = URL.createObjectURL(file);
    onChange({ src: url, name: file.name });
  };

  return (
    <section className="space-y-4" aria-labelledby="logo-heading">
      <h2 id="logo-heading" className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
        <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span>
        Logo / image
      </h2>

      {!logo.src ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)] p-6 flex flex-col items-center gap-2 hover:bg-[var(--color-surface-container-low)] transition-colors"
        >
          <ImagePlus className="w-7 h-7 text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-on-surface)]">Upload a logo</span>
          <span className="text-xs text-[var(--color-on-surface-variant)]">PNG, JPG, SVG or WebP — processed locally</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} alt="Logo preview" className="w-14 h-14 object-contain rounded-lg bg-white" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--color-on-surface)] truncate">{logo.name}</div>
            <div className="text-xs text-[var(--color-on-surface-variant)]">Error correction forced to H</div>
          </div>
          <button
            type="button"
            onClick={onReset}
            aria-label="Remove logo"
            className="p-2 rounded-full text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {logo.src && (
        <>
          <RangeField
            label="Logo size"
            value={Math.round(logo.sizeRatio * 100)}
            min={Math.round(MIN_LOGO_RATIO * 100)}
            max={Math.round(MAX_LOGO_RATIO * 100)}
            step={1}
            suffix="%"
            onChange={(v) => onChange({ sizeRatio: v / 100 })}
          />
          {logo.sizeRatio > 0.25 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Large logos can make the code hard to scan. Test it with a real phone, and keep the quiet zone clear.
            </div>
          )}
          <RangeField
            label="Logo padding (px)"
            value={logo.padding}
            min={0}
            max={32}
            step={1}
            onChange={(v) => onChange({ padding: v })}
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={logo.roundedBg}
                onChange={(e) => onChange({ roundedBg: e.target.checked })}
                className="rounded accent-[var(--color-primary)]"
              />
              Rounded background
            </label>
            <label className="flex items-center gap-2 text-sm flex-1">
              <span className="text-[var(--color-on-surface-variant)]">Bg</span>
              <input
                type="color"
                value={logo.background}
                onChange={(e) => onChange({ background: e.target.value })}
                className="w-9 h-9 rounded-lg border border-[var(--color-outline-variant)] cursor-pointer bg-transparent p-0.5"
              />
              <button
                type="button"
                onClick={() => onChange({ background: "transparent" })}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                None
              </button>
            </label>
          </div>
        </>
      )}

      <p className="text-xs text-[var(--color-on-surface-variant)] flex items-start gap-1.5">
        <ImagePlus className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        Your image is processed locally in your browser and is never uploaded.
      </p>
    </section>
  );
}

function RangeField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">{label}</span>
        <span className="text-xs text-[var(--color-on-surface)] tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-primary)]"
      />
    </label>
  );
}
