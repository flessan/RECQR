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
    <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden bg-black md-elevation-2">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-[var(--color-surface-container)]/95 text-[var(--color-on-surface)]">
          {status === "requesting" && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-3" />
              <p className="font-medium">Requesting camera…</p>
            </>
          )}
          {(status === "idle" || status === "stopped") && !error && (
            <>
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] flex items-center justify-center mb-3">
                <QrGlyph />
              </div>
              <p className="font-medium">Camera is off</p>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                Press “Start scanning” to begin.
              </p>
            </>
          )}
          {error && (
            <div className="text-[var(--color-on-error-container)]">
              <p className="font-semibold">Camera unavailable</p>
              <p className="text-sm mt-1 max-w-xs">{error}</p>
            </div>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium shadow-lg">
          QR code detected
        </div>
      )}
    </div>
  );
}

function Reticle({ active, success }: { active: boolean; success: boolean }) {
  const color = success ? "#22c55e" : active ? "var(--color-primary)" : "var(--color-outline)";
  const corner = "absolute w-8 h-8 border-[3px] rounded-md";
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
