"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildBitmap,
  generateMatrix,
  type QRBitmap,
} from "@/lib/qr/renderer";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";

interface LoadedLogo {
  dataUrl: string;
  width: number;
  height: number;
  image: HTMLImageElement;
}

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
      setLoadedLogo({
        dataUrl: b.logo.dataUrl,
        width: b.logo.width,
        height: b.logo.height,
        image: b.logo.image,
      });
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
      logo: loadedLogo
        ? {
            dataUrl: loadedLogo.dataUrl,
            width: loadedLogo.width,
            height: loadedLogo.height,
            image: loadedLogo.image,
          }
        : null,
    }),
    [matrix, loadedLogo]
  );
}
