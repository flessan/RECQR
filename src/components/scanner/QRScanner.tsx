"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronDown, Clock, ScanLine, Trash2 } from "lucide-react";
import { useCameraScanner } from "@/lib/hooks/useCameraScanner";
import { parseQR } from "@/lib/qr/parser";
import type { QRResult } from "@/lib/qr/types";
import { useScanHistory } from "@/lib/store/scanHistory";
import ScannerViewport from "./ScannerViewport";
import ScannerControls from "./ScannerControls";
import ImageScanner from "./ImageScanner";
import ScanResultCard from "./ScanResultCard";
import HistoryList from "./HistoryList";

export default function QRScanner() {
  const [result, setResult] = useState<QRResult | null>(null);
  const [resultSource, setResultSource] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const {
    scans,
    addScan,
    toggleFavorite,
    deleteScan,
    clearHistory,
    soundEnabled,
    hapticEnabled,
    setSoundEnabled,
    setHapticEnabled,
  } = useScanHistory();

  const handleDetected = useCallback(
    (text: string, source: string) => {
      const parsed = parseQR(text);
      setResult(parsed);
      setResultSource(source);
      addScan({ raw: parsed.raw, type: parsed.type, parsed: parsed.parsed });
    },
    [addScan]
  );

  const handleCameraDetected = useCallback(
    (text: string) => handleDetected(text, "Camera"),
    [handleDetected]
  );

  const scanner = useCameraScanner({
    onDetect: handleCameraDetected,
    soundEnabled,
    hapticEnabled,
  });
  const resumeScanner = scanner.resume;

  const reset = useCallback(() => {
    const wasCameraResult = resultSource === "Camera";
    setResult(null);
    setResultSource(null);
    // Do not unexpectedly request camera permission after an image scan.
    if (wasCameraResult) void resumeScanner();
  }, [resultSource, resumeScanner]);

  const recent = useMemo(() => scans.slice(0, 20), [scans]);

  useEffect(() => {
    if (!result) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [result]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="pb-6 pt-2 sm:pb-8 sm:pt-4">
        <span className="ui-badge">
          <ScanLine className="h-3.5 w-3.5" />
          QR reader
        </span>
        <h1 className="ui-display mt-4 max-w-3xl text-[clamp(2.15rem,6vw,4rem)] text-[var(--color-on-surface)]">
          What&apos;s inside this QR?
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--color-on-surface-variant)] sm:text-lg">
          Paste a screenshot and RECQR will show where the code leads or what it contains. Nothing opens until you choose an action.
        </p>
      </header>

      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={String(result.timestamp) + result.raw}
              ref={resultRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="scroll-mt-28"
            >
              <ScanResultCard
                result={result}
                source={resultSource}
                onScanAgain={reset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ImageScanner onDecoded={handleDetected} />

        <details className="group ui-card overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold text-[var(--color-on-surface)] [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
                <Camera className="h-5 w-5" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block">Use your camera instead</span>
                <span className="mt-0.5 block text-xs font-medium text-[var(--color-on-surface-variant)]">
                  Scan a code in front of your device
                </span>
              </span>
            </span>
            <ChevronDown className="h-5 w-5 flex-none text-[var(--color-on-surface-variant)] transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-[var(--color-outline-variant)] p-4 sm:p-5">
            <ScannerViewport
              videoRef={scanner.videoRef}
              status={scanner.status}
              facingMode={scanner.facingMode}
              error={scanner.error}
            />
            <ScannerControls
              scanner={scanner}
              soundEnabled={soundEnabled}
              hapticEnabled={hapticEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onToggleHaptic={() => setHapticEnabled(!hapticEnabled)}
            />
          </div>
        </details>

        <section className="ui-card overflow-hidden" aria-label="Scan history">
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-container)]"
            aria-expanded={showHistory}
          >
            <span className="flex min-w-0 items-center gap-3 font-black tracking-tight text-[var(--color-on-surface)]">
              <Clock className="h-5 w-5 flex-none text-[var(--color-primary)]" />
              <span>Recent scans</span>
              <span className="ui-badge px-2 py-0.5 text-[0.65rem]">{scans.length}</span>
            </span>
            <span className="text-sm font-bold text-[var(--color-primary)]">
              {showHistory ? "Hide" : "Show"}
            </span>
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-[var(--color-outline-variant)] px-3 pb-3 pt-2">
                  {recent.length === 0 ? (
                    <p className="px-2 py-5 text-center text-sm font-medium text-[var(--color-on-surface-variant)]">
                      Your scans will appear here. They stay on this device.
                    </p>
                  ) : (
                    <>
                      <HistoryList
                        scans={recent}
                        onSelect={(scan) => {
                          setResult(parseQR(scan.raw, scan.timestamp));
                          setResultSource("Saved scan");
                        }}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteScan}
                      />
                      {scans.length > 0 && (
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="ui-btn ui-btn-ghost ui-btn-sm mt-3 w-full text-[var(--color-error)] hover:bg-[var(--color-error-container)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear non-favorites
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
