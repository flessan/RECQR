"use client";

import type {
  DotStyle,
  EyeStyle,
  GeneratorDesign,
} from "@/lib/qr/types";

interface Props {
  design: GeneratorDesign;
  hasLogo: boolean;
  onChange: (patch: Partial<GeneratorDesign>) => void;
}

const DOT_STYLES: { id: DotStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
];
const EYE_STYLES: { id: EyeStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "leaf", label: "Leaf" },
];
const EC_LEVELS = ["L", "M", "Q", "H"] as const;

export default function DesignEditor({ design, hasLogo, onChange }: Props) {
  return (
    <section className="space-y-4" aria-labelledby="design-heading">
      <h2 id="design-heading" className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
        <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span>
        Design your QR code
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Foreground"
          value={design.fgColor}
          onChange={(v) => onChange({ fgColor: v })}
        />
        <ColorField
          label="Background"
          value={design.bgColor}
          onChange={(v) => onChange({ bgColor: v })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-on-surface)]">
        <input
          type="checkbox"
          checked={design.transparentBg}
          onChange={(e) => onChange({ transparentBg: e.target.checked })}
          className="rounded accent-[var(--color-primary)]"
        />
        Transparent background (PNG/WebP only)
      </label>

      <RangeField
        label="Size (px)"
        value={design.size}
        min={128}
        max={1024}
        step={16}
        onChange={(v) => onChange({ size: v })}
      />
      <RangeField
        label="Quiet zone (modules)"
        value={design.margin}
        min={0}
        max={10}
        step={1}
        onChange={(v) => onChange({ margin: v })}
      />

      <div>
        <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">Error correction</span>
        <div className="flex gap-1">
          {EC_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              disabled={hasLogo && lvl !== "H"}
              onClick={() => onChange({ errorCorrection: lvl })}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                design.errorCorrection === lvl
                  ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]"
                  : "bg-[var(--color-surface-container)] border-[var(--color-outline-variant)]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={hasLogo && lvl !== "H" ? "Forced to H when a logo is embedded" : undefined}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <Segmented
        label="Dot style"
        options={DOT_STYLES}
        value={design.dotStyle}
        onChange={(v) => onChange({ dotStyle: v as DotStyle })}
      />
      <Segmented
        label="Finder style"
        options={EYE_STYLES}
        value={design.eyeStyle}
        onChange={(v) => onChange({ eyeStyle: v as EyeStyle })}
      />

      <label className="flex items-center gap-2 text-sm text-[var(--color-on-surface)]">
        <input
          type="checkbox"
          checked={design.frame}
          onChange={(e) => onChange({ frame: e.target.checked })}
          className="rounded accent-[var(--color-primary)]"
        />
        Add label frame
      </label>
      {design.frame && (
        <input
          type="text"
          value={design.frameText}
          maxLength={40}
          onChange={(e) => onChange({ frameText: e.target.value })}
          placeholder="Frame text (e.g. SCAN ME)"
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
        />
      )}
    </section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-[var(--color-outline-variant)] cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] text-sm font-mono text-[var(--color-on-surface)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
    </label>
  );
}

function RangeField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">{label}</span>
        <span className="text-xs text-[var(--color-on-surface)] tabular-nums">{value}</span>
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

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <span className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">{label}</span>
      <div className="flex gap-1">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${
              value === o.id
                ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-primary)]"
                : "bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
