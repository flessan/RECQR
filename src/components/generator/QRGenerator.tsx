"use client";

import { useGeneratorState } from "@/lib/hooks/useGeneratorState";
import { useQRBitmap } from "@/lib/hooks/useQRBitmap";
import ContentSelector from "./ContentSelector";
import DesignEditor from "./DesignEditor";
import LogoUploader from "./LogoUploader";
import QRPreview from "./QRPreview";
import DownloadControls from "./DownloadControls";
import { ShieldCheck, Wand2 } from "lucide-react";

export default function QRGenerator() {
  const {
    state,
    payload,
    isReady,
    contentHint,
    setPreset,
    setField,
    patchDesign,
    patchLogo,
    setOutput,
    resetLogo,
  } = useGeneratorState();

  const bitmap = useQRBitmap(payload, state.design, state.logo);
  const hasContent = isReady && payload.trim().length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-2 pb-8 sm:pt-4">
        <span className="ui-badge">
          <Wand2 className="h-3.5 w-3.5" />
          Generator
        </span>
        <h1 className="ui-display mt-4 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] text-[var(--color-on-surface)]">
          Build a QR you&apos;d actually{" "}
          <span className="ui-underline whitespace-nowrap">want to scan</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-[var(--color-on-surface-variant)] sm:text-lg">
          Four steps, live preview, and an export that matches it pixel for pixel.
          Everything renders in your browser.
        </p>
      </header>

      <div className="generator-layout">
        {/* Content + design + logo */}
        <div className="generator-area-builder">
          <div className="ui-card space-y-7 p-4 sm:p-6 lg:p-7">
            <ContentSelector
              preset={state.content.preset}
              data={state.content.data}
              onPreset={setPreset}
              onField={setField}
            />
            <Divider />
            <DesignEditor
              design={state.design}
              hasLogo={!!state.logo.src}
              onChange={patchDesign}
            />
            <Divider />
            <LogoUploader
              logo={state.logo}
              onChange={patchLogo}
              onReset={resetLogo}
            />
          </div>
        </div>

        {/* Preview (sticky on desktop, between design and download on mobile) */}
        <div className="generator-area-preview">
          <div className="ui-card space-y-4 p-4 sm:p-6 lg:sticky lg:top-28 lg:p-7">
            <h2
              id="preview-heading"
              className="flex items-center gap-3 text-xl font-black tracking-tight text-[var(--color-on-surface)]"
            >
              <span className="ui-step">★</span>
              Preview
            </h2>
            <QRPreview
              bitmap={hasContent ? bitmap : null}
              design={state.design}
              logo={state.logo}
              hint={contentHint}
            />
            <div className="ui-card-flat min-w-0 p-3">
              <div className="ui-label">Payload</div>
              <code className="block text-xs text-[var(--color-on-surface)] break-all whitespace-pre-wrap max-h-24 overflow-y-auto custom-scrollbar">
                {hasContent ? payload : <span className="opacity-60">-</span>}
              </code>
            </div>
            <p className="flex items-start gap-2 text-xs font-semibold leading-relaxed text-[var(--color-on-surface-variant)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[var(--color-primary)]" />
              <span>
                <strong className="text-[var(--color-on-surface)]">Private by design:</strong>{" "}
                generation and logo compositing run entirely on your device - nothing
                is uploaded.
              </span>
            </p>
          </div>
        </div>

        {/* Download */}
        <div className="generator-area-download">
          <div className="ui-card p-4 sm:p-6 lg:p-7">
            <DownloadControls
              bitmap={hasContent ? bitmap : null}
              design={state.design}
              logo={state.logo}
              output={state.output}
              onOutput={setOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <hr className="border-0 border-t-2 border-dashed border-[var(--color-outline-variant)]" />
  );
}
