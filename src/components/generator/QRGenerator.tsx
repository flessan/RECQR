"use client";

import { useGeneratorState } from "@/lib/hooks/useGeneratorState";
import { useQRBitmap } from "@/lib/hooks/useQRBitmap";
import ContentSelector from "./ContentSelector";
import DesignEditor from "./DesignEditor";
import LogoUploader from "./LogoUploader";
import QRPreview from "./QRPreview";
import DownloadControls from "./DownloadControls";

export default function QRGenerator() {
  const {
    state,
    payload,
    setPreset,
    setField,
    patchDesign,
    patchLogo,
    setOutput,
    resetLogo,
  } = useGeneratorState();

  const bitmap = useQRBitmap(payload, state.design, state.logo);
  const hasContent = payload.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <header className="text-center pt-4 pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-on-surface)]">
          QR Generator
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-2">
          Design a custom QR code in four steps. Everything renders in your browser.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Builder column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="md-card p-5 sm:p-6 space-y-6">
            <ContentSelector
              preset={state.content.preset}
              data={state.content.data}
              onPreset={setPreset}
              onField={setField}
            />
            <hr className="border-[var(--color-outline-variant)]" />
            <DesignEditor
              design={state.design}
              hasLogo={!!state.logo.src}
              onChange={patchDesign}
            />
            <hr className="border-[var(--color-outline-variant)]" />
            <LogoUploader
              logo={state.logo}
              onChange={patchLogo}
              onReset={resetLogo}
            />
            <hr className="border-[var(--color-outline-variant)]" />
            <DownloadControls
              bitmap={hasContent ? bitmap : null}
              design={state.design}
              logo={state.logo}
              output={state.output}
              onOutput={setOutput}
            />
          </div>
        </div>

        {/* Sticky preview column */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 md-card p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">✓</span>
              Preview
            </h2>
            <QRPreview bitmap={bitmap} design={state.design} logo={state.logo} />
            <div className="rounded-xl bg-[var(--color-surface-container)] p-3">
              <div className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)] mb-1">Payload</div>
              <code className="block text-xs text-[var(--color-on-surface)] break-all whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                {hasContent ? payload : <span className="opacity-60">—</span>}
              </code>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              <strong className="text-[var(--color-on-surface)]">Privacy:</strong>{" "}
              QR generation and logo compositing run entirely on your device. No
              content or image is uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
