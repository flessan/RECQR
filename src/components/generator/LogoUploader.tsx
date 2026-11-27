"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Trash2 } from "lucide-react";
import type { LogoSettings } from "@/lib/qr/types";

interface Props {
  logo: LogoSettings;
  onChange: (patch: Partial<LogoSettings>) => void;
  onReset: () => void;
}

export const MAX_LOGO_RATIO = 0.3;
const MIN_LOGO_RATIO = 0.12;
const MAX_LOGO_FILE_SIZE = 8 * 1024 * 1024;

export default function LogoUploader({ logo, onChange, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const operationRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file such as PNG, JPG, or WebP.");
      return;
    }
    if (file.size > MAX_LOGO_FILE_SIZE) {
      setError("Logo files must be 8 MB or smaller. Resize the image and try again.");
      return;
    }

    const operation = ++operationRef.current;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (operation !== operationRef.current) return;
      if (!image.naturalWidth || !image.naturalHeight) {
        setError("This image could not be read. Try another image.");
        return;
      }
      onChange({ src: URL.createObjectURL(file), name: file.name });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (operation === operationRef.current) {
        setError("This image could not be opened. Try PNG, JPG, or WebP.");
      }
    };
    image.src = objectUrl;
  };

  return (
    <section className="space-y-4" aria-labelledby="logo-heading">
      <div>
        <h3 id="logo-heading" className="text-lg font-black tracking-tight text-[var(--color-on-surface)]">
          Add a logo
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          Optional. Your QR code works without a logo, and smaller logos are easier to scan.
        </p>
      </div>

      {!logo.src ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/40"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[var(--color-outline)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] shadow-[var(--ui-shadow-sm)]">
            <ImagePlus className="h-6 w-6" />
          </span>
          <span className="text-base font-black text-[var(--color-on-surface)]">Choose logo image</span>
          <span className="text-xs font-semibold text-[var(--color-on-surface-variant)]">PNG, JPG, WebP or SVG · up to 8 MB</span>
        </button>
      ) : (
        <div className="ui-card-flat flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} alt="Logo preview" className="h-14 w-14 flex-none rounded-xl border-2 border-[var(--color-outline-variant)] bg-white object-contain" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-[var(--color-on-surface)]">{logo.name}</div>
            <div className="text-xs text-[var(--color-on-surface-variant)]">High error correction enabled</div>
          </div>
          <button
            type="button"
            onClick={() => {
              operationRef.current += 1;
              setError(null);
              onReset();
            }}
            aria-label="Remove logo"
            className="ui-icon-btn h-10 w-10 hover:border-[var(--color-error)] hover:bg-[var(--color-error-container)] hover:text-[var(--color-error)]"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-[var(--color-error-container)] px-3 py-2 text-xs font-semibold text-[var(--color-on-error-container)]">
          {error}
        </p>
      )}

      {logo.src && (
        <>
          <RangeField
            label="Logo size"
            value={Math.round(logo.sizeRatio * 100)}
            min={Math.round(MIN_LOGO_RATIO * 100)}
            max={Math.round(MAX_LOGO_RATIO * 100)}
            step={1}
            suffix="%"
            onChange={(value) => onChange({ sizeRatio: value / 100 })}
          />
          {logo.sizeRatio > 0.25 && (
            <div className="ui-card-flat ui-card-tertiary flex items-start gap-2 p-3 text-xs font-semibold">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Large logos can make the QR code harder to scan. Keep the logo small and test it with a phone.
            </div>
          )}
          <RangeField
            label="Logo padding (px)"
            value={logo.padding}
            min={0}
            max={32}
            step={1}
            onChange={(value) => onChange({ padding: value })}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={logo.roundedBg}
                onChange={(event) => onChange({ roundedBg: event.target.checked })}
                className="ui-checkbox"
              />
              Rounded background
            </label>
            <label className="flex flex-1 items-center gap-2 text-sm">
              <span className="text-[var(--color-on-surface-variant)]">Background</span>
              <input
                type="color"
                value={logo.background === "transparent" ? "#ffffff" : logo.background}
                onChange={(event) => onChange({ background: event.target.value })}
                className="h-10 w-10 flex-none cursor-pointer rounded-xl border-2 border-[var(--color-outline-variant)] bg-transparent p-1"
              />
              <button
                type="button"
                onClick={() => onChange({ background: "transparent" })}
                className="ui-chip px-3 py-1 text-xs"
              >
                Transparent
              </button>
            </label>
          </div>
        </>
      )}

      <p className="flex items-start gap-1.5 text-xs text-[var(--color-on-surface-variant)]">
        <ImagePlus className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        The logo is resized and embedded locally. It is never uploaded.
      </p>
    </section>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="ui-label mb-0">{label}</span>
        <span className="ui-badge px-2 py-0.5 text-xs tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-[var(--color-primary)]"
      />
    </label>
  );
}
