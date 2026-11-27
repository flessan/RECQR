"use client";

import { useGeneratorState } from "@/lib/hooks/useGeneratorState";
import { useQRBitmap } from "@/lib/hooks/useQRBitmap";
import ContentSelector from "./ContentSelector";
import DesignEditor from "./DesignEditor";
import LogoUploader from "./LogoUploader";
import QRPreview from "./QRPreview";
import DownloadControls from "./DownloadControls";
import { Check, ShieldCheck, Wand2 } from "lucide-react";

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
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="pb-6 pt-2 sm:pb-8 sm:pt-4">
        <span className="ui-badge">
          <Wand2 className="h-3.5 w-3.5" />
          QR maker
        </span>
        <h1 className="ui-display mt-4 max-w-3xl text-[clamp(2.15rem,6vw,4rem)] text-[var(--color-on-surface)]">
          Make a QR code.
          <br />
          <span className="ui-underline">Keep it simple.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-on-surface-variant)] sm:text-lg">
          Choose what you want to share, fill in the details, and download. Your QR code updates as you type.
        </p>
      </header>

      <div className="generator-layout">
        <div className="generator-area-builder">
          <div className="ui-card space-y-6 p-4 sm:p-6 lg:p-7">
            <ContentSelector
              preset={state.content.preset}
              data={state.content.data}
              onPreset={setPreset}
              onField={setField}
            />

            <details className="ui-card-flat p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-[var(--color-on-surface)] [&::-webkit-details-marker]:hidden">
                <span>
                  Customize the design
                  <span className="mt-0.5 block text-xs font-medium text-[var(--color-on-surface-variant)]">
                    Optional colors, shapes, size, and logo
                  </span>
                </span>
                <span className="rounded-full bg-[var(--color-surface-container-high)] px-3 py-1 text-xs font-bold text-[var(--color-on-surface-variant)]">
                  Optional
                </span>
              </summary>
              <div className="mt-5 space-y-7 border-t border-[var(--color-outline-variant)] pt-5">
                <DesignEditor
                  design={state.design}
                  hasLogo={!!state.logo.src}
                  onChange={patchDesign}
                />
                <hr className="border-0 border-t border-dashed border-[var(--color-outline-variant)]" />
                <LogoUploader
                  logo={state.logo}
                  onChange={patchLogo}
                  onReset={resetLogo}
                />
              </div>
            </details>
          </div>
        </div>

        <div className="generator-area-preview">
          <div className="ui-card space-y-5 p-4 sm:p-6 lg:sticky lg:top-28 lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2
                id="preview-heading"
                className="flex items-center gap-3 text-xl font-black tracking-tight text-[var(--color-on-surface)]"
              >
                <span className="ui-step">
                  <Check className="h-4 w-4" />
                </span>
                Your QR preview
              </h2>
              {hasContent && (
                <span className="ui-badge bg-[var(--color-success-container)] text-[var(--color-on-success-container)]">
                  Ready
                </span>
              )}
            </div>

            <QRPreview
              bitmap={hasContent ? bitmap : null}
              design={state.design}
              logo={state.logo}
              hint={contentHint}
            />

            <div className="border-t border-[var(--color-outline-variant)] pt-5">
              <DownloadControls
                bitmap={hasContent ? bitmap : null}
                design={state.design}
                logo={state.logo}
                output={state.output}
                onOutput={setOutput}
              />
            </div>

            <p className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[var(--color-on-surface-variant)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[var(--color-primary)]" />
              <span>
                Your content, preview, and downloaded QR code are processed on this device. Nothing is uploaded.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
