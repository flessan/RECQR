"use client";

import { useState } from "react";
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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadRaster = async (format: "png" | "webp") => {
    if (!bitmap) return;

    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const supportsWebP =
      format === "png" || probe.toDataURL("image/webp").startsWith("data:image/webp");

    const actualFormat = supportsWebP ? format : "png";
    const mime = actualFormat === "webp" ? "image/webp" : "image/png";
    const canvas = document.createElement("canvas");
    const rendered = renderToCanvas(bitmap, design, logo, canvas);
    if (!rendered) {
      throw new Error("The browser could not create a canvas for this QR code.");
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      if (typeof canvas.toBlob !== "function") {
        reject(new Error("This browser cannot export a canvas image."));
        return;
      }
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("The browser could not encode the image."));
      }, mime, 0.95);
    });

    const extension = actualFormat;
    downloadBlob(blob, filename + "." + extension);
    return supportsWebP
      ? null
      : "WebP is not supported by this browser, so a PNG file was downloaded instead.";
  };

  const handleDownload = async () => {
    if (!bitmap || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (output.format === "svg") {
        const svg = renderToSvg(bitmap, design, logo);
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        downloadBlob(blob, filename + ".svg");
      } else {
        const fallbackMessage = await downloadRaster(output.format);
        if (fallbackMessage) setMessage(fallbackMessage);
      }
    } catch {
      setError("Could not create the download. Try PNG or reduce the QR size.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="download-heading">
      <div className="flex items-center gap-3">
        <h2 id="download-heading" className="text-lg font-black tracking-tight text-[var(--color-on-surface)]">
          Download your QR
        </h2>
      </div>

      <div>
        <span className="ui-label">File format</span>
        <div className="ui-segment">
          {(["png", "svg", "webp"] as const).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => {
                setMessage(null);
                onOutput({ format });
              }}
              aria-pressed={output.format === format}
              className={"ui-chip uppercase " + (output.format === format ? "is-active" : "")}
            >
              {format}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--color-on-surface-variant)]">
          PNG works everywhere. SVG stays sharp at any size.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={!bitmap || busy}
        className="ui-btn ui-btn-primary ui-btn-lg w-full"
      >
        {busy ? (
          <ImageDown className="h-5 w-5 animate-pulse" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        {busy ? "Preparing file…" : "Download " + output.format.toUpperCase()}
      </button>

      {message && (
        <p role="status" className="rounded-xl bg-[var(--color-surface-container-high)] px-3 py-2 text-xs font-semibold text-[var(--color-on-surface)]">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-[var(--color-error-container)] px-3 py-2 text-xs font-semibold text-[var(--color-on-error-container)]">
          {error}
        </p>
      )}
    </section>
  );
}
