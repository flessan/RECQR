"use client";

import { useEffect, useMemo, useState } from "react";
import { buildBitmap, generateMatrix, type QRBitmap } from "@/lib/qr/renderer";
import type { LoadedLogo } from "@/lib/qr/scene";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";

/**
 * Matrix generation stays synchronous for an immediate preview. Embedded
 * logos are decoded asynchronously and are cleared whenever the payload or
 * logo settings change so exports can never use a stale image.
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
    let cancelled = false;

    // Never leave the previous logo attached to a newly generated payload.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedLogo(null);

    if (!logo.src) {
      return () => {
        cancelled = true;
      };
    }

    void buildBitmap(payload, design, logo)
      .then((bitmap) => {
        if (!cancelled) setLoadedLogo(bitmap.logo);
      })
      .catch(() => {
        if (!cancelled) setLoadedLogo(null);
      });

    return () => {
      cancelled = true;
    };
    // Key off only the primitive settings that affect the embedded bitmap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo.src, logo.sizeRatio, logo.padding, logo.background, logo.roundedBg, design.size, matrix.size, payload]);

  return useMemo(
    () => ({
      size: matrix.size,
      modules: matrix.modules,
      logo: loadedLogo,
    }),
    [matrix, loadedLogo]
  );
}
