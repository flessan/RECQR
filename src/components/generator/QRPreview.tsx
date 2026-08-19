"use client";

import { useMemoMarkup } from "./useMemoMarkup";
import type { QRBitmap } from "@/lib/qr/renderer";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";
import { AlertTriangle } from "lucide-react";

interface Props {
  bitmap: QRBitmap | null;
  design: GeneratorDesign;
  logo: LogoSettings;
}

export default function QRPreview({ bitmap, design, logo }: Props) {
  const svgMarkup = useMemoMarkup(bitmap, design, logo);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="p-5 rounded-2xl md-elevation-1 flex items-center justify-center"
        style={{ background: design.transparentBg ? "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 16px 16px" : design.bgColor }}
      >
        {svgMarkup ? (
          <div
            className="w-full max-w-[320px] aspect-square"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
            role="img"
            aria-label="Generated QR code preview"
          />
        ) : (
          <div className="w-[260px] h-[260px] flex items-center justify-center text-[var(--color-on-surface-variant)] text-sm">
            Enter content to generate a preview…
          </div>
        )}
      </div>
      {logo.src && logo.sizeRatio > 0.25 && (
        <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="w-4 h-4" /> Large logo — verify scannability on a real device.
        </div>
      )}
    </div>
  );
}
