"use client";

import { Loader2 } from "lucide-react";
import type { ScannerStatus } from "@/lib/hooks/useCameraScanner";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: ScannerStatus;
  facingMode: "environment" | "user";
  error: string | null;
}

export default function ScannerViewport({
  videoRef,
  status,
  facingMode,
  error,
}: Props) {
  const isVideoShown = status === "scanning" || status === "success";
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-[var(--color-outline)] bg-black shadow-[var(--ui-shadow)]">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
        aria-label="Camera preview"
      />

      {/* Scanning reticle */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-2/3 h-2/3">
          <Reticle active={status === "scanning"} success={status === "success"} />
        </div>
      </div>

      {/* Status overlay */}
      {!isVideoShown && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-surface-container)] px-6 text-center text-[var(--color-on-surface)]">
          {status === "requesting" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-3" />
              <p className="font-black tracking-tight">Requesting camera…</p>
            </>
          )}
          {(status === "idle" || status === "stopped") && !error && (
            <>
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-3xl border-2 border-[var(--color-outline)] bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[var(--ui-shadow-sm)]">
                <QrGlyph />
              </div>
              <p className="text-lg font-black tracking-tight">Camera is off</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface-variant)]">
                Press “Start scanning” to begin.
              </p>
            </>
          )}
          {error && (
            <div className="ui-card-flat max-w-xs border-[var(--color-error)] bg-[var(--color-error-container)] p-4 text-[var(--color-on-error-container)]">
              <p className="font-black tracking-tight">Camera unavailable</p>
              <p className="mt-1 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--color-outline)] bg-[var(--color-success)] px-4 py-2 text-sm font-black text-white shadow-[var(--ui-shadow-sm)]">
          QR code detected
        </div>
      )}
    </div>
  );
}

function Reticle({ active, success }: { active: boolean; success: boolean }) {
  const color = success ? "#22c55e" : active ? "var(--color-primary)" : "var(--color-outline)";
  const corner = "absolute w-10 h-10 border-4 rounded-xl";
  return (
    <>
      <span className={`${corner} top-0 left-0 border-r-0 border-b-0`} style={{ borderColor: color }} />
      <span className={`${corner} top-0 right-0 border-l-0 border-b-0`} style={{ borderColor: color }} />
      <span className={`${corner} bottom-0 left-0 border-r-0 border-t-0`} style={{ borderColor: color }} />
      <span className={`${corner} bottom-0 right-0 border-l-0 border-t-0`} style={{ borderColor: color }} />
      {active && !success && (
        // The wrapper spans the full reticle height so translateY(100%) sweeps
        // the whole frame (translating the 2px line itself moved it by 2px).
        <div className="pointer-events-none absolute inset-0 overflow-hidden animate-[scanline_2s_ease-in-out_infinite]">
          <div className="h-0.5 w-full bg-[var(--color-primary)]/80 shadow-[0_0_12px_var(--color-primary)]" />
        </div>
      )}
    </>
  );
}

function QrGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" />
    </svg>
  );
}
