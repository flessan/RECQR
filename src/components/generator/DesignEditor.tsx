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
      <h2 id="design-heading" className="flex items-center gap-3 text-xl font-black tracking-tight text-[var(--color-on-surface)]">
        <span className="ui-step">2</span>
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

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[var(--color-on-surface)]">
        <input
          type="checkbox"
          checked={design.transparentBg}
          onChange={(e) => onChange({ transparentBg: e.target.checked })}
          className="ui-checkbox"
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
        <span className="ui-label">Error correction</span>
        <div className="ui-segment">
          {EC_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              disabled={hasLogo && lvl !== "H"}
              onClick={() => onChange({ errorCorrection: lvl })}
              className={`ui-chip ${design.errorCorrection === lvl ? "is-active" : ""}`}
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

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[var(--color-on-surface)]">
        <input
          type="checkbox"
          checked={design.frame}
          onChange={(e) => onChange({ frame: e.target.checked })}
          className="ui-checkbox"
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
          className="ui-field"
        />
      )}
    </section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="ui-label">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-11 flex-none cursor-pointer rounded-2xl border-2 border-[var(--color-outline-variant)] bg-transparent p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ui-field flex-1 font-mono text-sm"
        />
      </div>
    </label>
  );
}

function RangeField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="ui-label mb-0">{label}</span>
        <span className="ui-badge px-2 py-0.5 text-xs tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-primary)] cursor-pointer"
      />
    </label>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <span className="ui-label">{label}</span>
      <div className="ui-segment">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`ui-chip ${value === o.id ? "is-active" : ""}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
