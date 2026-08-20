"use client";

import { useMemoMarkup } from "./useMemoMarkup";
import { computeLayout } from "@/lib/qr/layout";
import type { QRBitmap } from "@/lib/qr/renderer";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";
import { AlertTriangle, QrCode } from "lucide-react";

interface Props {
  bitmap: QRBitmap | null;
  design: GeneratorDesign;
  logo: LogoSettings;
  /** Shown instead of a QR while the content is incomplete. */
  hint?: string | null;
}

export default function QRPreview({ bitmap, design, logo, hint }: Props) {
  const svgMarkup = useMemoMarkup(bitmap, design, logo);
  const layout = bitmap ? computeLayout(bitmap.size, design) : null;

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3">
      <div
        className="flex w-full min-w-0 max-w-[22rem] items-center justify-center rounded-[1.75rem] border-2 border-[var(--color-outline)] p-3 shadow-[var(--ui-shadow)] sm:p-4"
        style={{
          background: design.transparentBg
            ? "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 16px 16px"
            : design.bgColor,
        }}
      >
        {svgMarkup && layout ? (
          <div
            className="qr-preview-surface"
            style={{ aspectRatio: `${layout.outputWidth} / ${layout.outputHeight}` }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
            role="img"
            aria-label="Generated QR code preview"
          />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 px-4 text-center text-sm font-semibold text-[var(--color-on-surface-variant)]">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)]"><QrCode className="h-7 w-7 opacity-50" aria-hidden="true" /></span>
            <span>{hint ?? "Enter content to generate a preview…"}</span>
          </div>
        )}
      </div>
      {layout && svgMarkup && (
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="ui-badge tabular-nums">
            {Math.round(layout.outputWidth)} × {Math.round(layout.outputHeight)} px
          </span>
          <span className="ui-badge tabular-nums">{layout.matrixSize} modules</span>
          <span className="ui-badge tabular-nums">quiet zone {layout.quietZone}</span>
        </div>
      )}
      {logo.src && logo.sizeRatio > 0.25 && (
        <div className="ui-card-flat ui-card-tertiary flex items-center gap-2 px-3 py-2 text-xs font-bold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Large logo - verify scannability on a real device.</span>
        </div>
      )}
    </div>
  );
}
