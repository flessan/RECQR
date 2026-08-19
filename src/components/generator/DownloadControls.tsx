"use client";

import { useRef, useState } from "react";
import { Download, ImageDown } from "lucide-react";
import {
  downloadBlob,
  renderToCanvas,
  renderToSvg,
  type QRBitmap,
} from "@/lib/qr/renderer";
import type {
  GeneratorDesign,
  LogoSettings,
  OutputSettings,
} from "@/lib/qr/types";

interface Props {
  bitmap: QRBitmap | null;
  design: GeneratorDesign;
  logo: LogoSettings;
  output: OutputSettings;
  onOutput: (patch: Partial<OutputSettings>) => void;
  filename?: string;
}

export default function DownloadControls({
  bitmap,
  design,
  logo,
  output,
  onOutput,
  filename = "recqr-qr",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);

  const downloadRaster = async (format: "png" | "webp") => {
    if (!bitmap) return;
    setBusy(true);
    try {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      await new Promise<void>((resolve) => {
        renderToCanvas(bitmap, design, logo, canvas, () => resolve());
        // When there is no logo the ready callback fires synchronously; guard
        // against double-resolve by also resolving on the next tick.
        if (!bitmap.logo) setTimeout(resolve, 0);
      });
      const requestedMime = format === "webp" ? "image/webp" : "image/png";
      // Probe whether the browser can actually encode the requested format.
      const probe = document.createElement("canvas");
      probe.width = probe.height = 1;
      const supports =
        requestedMime === "image/png" ||
        probe.toDataURL(requestedMime).startsWith("data:image/webp");
      const mime = supports ? requestedMime : "image/png";
      const ext = supports ? format : "png";
      canvas.toBlob(
        (blob) => {
          if (blob) downloadBlob(blob, `${filename}.${ext}`);
          setBusy(false);
        },
        mime,
        0.95
      );
    } catch {
      setBusy(false);
    }
  };

  const downloadSvg = () => {
    if (!bitmap) return;
    const svg = renderToSvg(bitmap, design, logo);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${filename}.svg`);
  };

  const handleDownload = () => {
    if (output.format === "svg") downloadSvg();
    else void downloadRaster(output.format);
  };

  return (
    <section className="space-y-4" aria-labelledby="download-heading">
      <h2 id="download-heading" className="flex items-center gap-3 text-xl font-black tracking-tight text-[var(--color-on-surface)]">
        <span className="ui-step">4</span>
        Download
      </h2>

      <div>
        <span className="ui-label">Format</span>
        <div className="ui-segment">
          {(["png", "svg", "webp"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onOutput({ format: f })}
              disabled={f === "webp" && design.transparentBg}
              className={`ui-chip uppercase ${output.format === f ? "is-active" : ""}`}
              title={f === "webp" && design.transparentBg ? "WebP export uses the configured background" : undefined}
            >
              {f}
            </button>
          ))}
        </div>
        {output.format === "svg" && (
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
            SVG scales losslessly and embeds your logo as an image.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!bitmap || busy}
        className="ui-btn ui-btn-primary ui-btn-lg w-full"
      >
        {busy ? (
          <ImageDown className="w-5 h-5 animate-pulse" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {busy ? "Rendering…" : `Download ${output.format.toUpperCase()}`}
      </button>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </section>
  );
}
