"use client";

import { useMemo } from "react";
import { renderToSvg } from "@/lib/qr/renderer";

/**
 * Memoize generated SVG markup. The QR SVG is generated entirely from our own
 * numeric/enum values and XML-escaped text, so injecting it via
 * dangerouslySetInnerHTML is safe here.
 */
export function useMemoMarkup(
  bitmap: Parameters<typeof import("@/lib/qr/renderer").renderToSvg>[0] | null,
  design: Parameters<typeof import("@/lib/qr/renderer").renderToSvg>[1],
  logo: Parameters<typeof import("@/lib/qr/renderer").renderToSvg>[2]
): string {
  return useMemo(
    () => (bitmap ? renderToSvg(bitmap, design, logo) : ""),
    [bitmap, design, logo]
  );
}
