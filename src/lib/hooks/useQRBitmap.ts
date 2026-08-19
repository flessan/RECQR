"use client";

import { useEffect, useMemo, useState } from "react";
import { buildBitmap, type QRBitmap } from "@/lib/qr/renderer";
import { generateMatrix } from "@/lib/qr/renderer";
import type { LoadedLogo } from "@/lib/qr/scene";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";

/**
 * Builds the QR bitmap. The matrix is computed synchronously with useMemo; the
 * logo is decoded/downscaled asynchronously because it needs an <img> decode.
 */
export function useQRBitmap(
  payload: string,
  design: GeneratorDesign,
  logo: LogoSettings
): QRBitmap | null {
  const matrix = useMemo(
    () => generateMatrix(payload, design.errorCorrection),
    [payload, design.errorCorrection]
  );

  const [loadedLogo, setLoadedLogo] = useState<LoadedLogo | null>(null);

  useEffect(() => {
    if (!logo.src) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadedLogo(null);
      return;
    }
    let cancelled = false;
    void buildBitmap(payload, design, logo).then((b) => {
      if (cancelled || !b.logo) return;
      setLoadedLogo(b.logo);
    });
    return () => {
      cancelled = true;
    };
    // We intentionally key off the primitive fields that affect the bitmap so
    // that object identity changes in `design`/`logo` don't cause reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo.src, logo.sizeRatio, design.size, matrix.size, payload]);

  return useMemo(
    () => ({
      size: matrix.size,
      modules: matrix.modules,
      logo: loadedLogo,
    }),
    [matrix, loadedLogo]
  );
}
