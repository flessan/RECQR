"use client";

import { useEffect, useMemo, useState } from "react";
import { buildBitmap, generateMatrix, type QRBitmap } from "@/lib/qr/renderer";
import type { LoadedLogo } from "@/lib/qr/scene";
import type { GeneratorDesign, LogoSettings } from "@/lib/qr/types";

interface LoadedLogoState {
  source: string;
  logo: LoadedLogo | null;
}

/**
 * Matrix generation stays synchronous for an immediate preview. A selected
 * logo is loaded separately and the bitmap is held back until that exact logo
 * is ready, preventing exports from silently omitting a newly selected logo.
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

  const [loadedLogo, setLoadedLogo] = useState<LoadedLogoState | null>(null);

  useEffect(() => {
    let cancelled = false;
    // A render with a different object URL must never reuse the prior image.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedLogo(null);

    if (!logo.src) {
      return () => {
        cancelled = true;
      };
    }

    void buildBitmap(payload, design, logo)
      .then((bitmap) => {
        if (!cancelled) {
          setLoadedLogo({ source: logo.src!, logo: bitmap.logo });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedLogo({ source: logo.src!, logo: null });
        }
      });

    return () => {
      cancelled = true;
    };
    // The decoded logo depends on its file and visual settings, not QR text.
    // Avoid re-decoding it on every keystroke in the content field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo.src, logo.sizeRatio, logo.padding, logo.background, logo.roundedBg, design.size]);

  const logoReady = !logo.src || loadedLogo?.source === logo.src;

  return useMemo(() => {
    if (!logoReady) return null;
    return {
      size: matrix.size,
      modules: matrix.modules,
      logo: logo.src ? loadedLogo?.logo ?? null : null,
    };
  }, [matrix, logoReady, logo.src, loadedLogo]);
}
