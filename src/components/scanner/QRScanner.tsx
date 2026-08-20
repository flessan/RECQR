"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lightbulb, ScanLine, Trash2 } from "lucide-react";
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
  const [showHistory, setShowHistory] = useState(false);
  const { scans, addScan, toggleFavorite, deleteScan, clearHistory,
    soundEnabled, hapticEnabled, setSoundEnabled, setHapticEnabled } =
    useScanHistory();

  const handleDetected = useCallback(
    (text: string) => {
      const parsed = parseQR(text);
      setResult(parsed);
      addScan({ raw: parsed.raw, type: parsed.type, parsed: parsed.parsed });
    },
    [addScan]
  );

  const scanner = useCameraScanner({
    onDetect: handleDetected,
    soundEnabled,
    hapticEnabled,
  });

  const reset = useCallback(() => {
    setResult(null);
    void scanner.resume();
  }, [scanner]);

  const recent = useMemo(() => scans.slice(0, 20), [scans]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-2 pb-8 sm:pt-4">
        <span className="ui-badge">
          <ScanLine className="h-3.5 w-3.5" />
          Scanner
        </span>
        <h1 className="ui-display mt-4 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] text-[var(--color-on-surface)]">
          Point, drop or paste ——{" "}
          <span className="ui-underline whitespace-nowrap">we decode it</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-[var(--color-on-surface-variant)] sm:text-lg">
          Camera frames and images are decoded on your device. Nothing is uploaded and
          links never open by themselves.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 space-y-5" aria-label="Camera scanner">
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
          <ImageScanner onDecoded={(text) => handleDetected(text)} />
        </section>

        <aside className="lg:col-span-2 space-y-4" aria-label="Scan result and history">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <ScanResultCard result={result} onScanAgain={reset} />
              </motion.div>
            ) : (
              <motion.div
                key="tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ui-card p-5"
              >
                <h2 className="mb-3 flex items-center gap-2 text-lg font-black tracking-tight text-[var(--color-on-surface)]">
                  <Lightbulb className="h-5 w-5 text-[var(--color-tertiary)]" /> Scanning tips
                </h2>
                <ul className="space-y-2 text-sm font-medium text-[var(--color-on-surface-variant)]">
                  <li>• Hold the camera steady, about 15–25 cm away.</li>
                  <li>• Avoid glare; ensure even lighting.</li>
                  <li>• The code should fill the reticle.</li>
                  <li>• Can&apos;t focus? Upload or paste a screenshot instead.</li>
                </ul>
                <p className="mt-4 text-xs font-semibold leading-relaxed text-[var(--color-on-surface-variant)]">
                  <strong className="text-[var(--color-on-surface)]">Privacy:</strong>{" "}
                  camera frames and images are processed entirely on your device.
                  Nothing is uploaded, and URLs are never opened automatically.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ui-card overflow-hidden">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-surface-container)]"
              aria-expanded={showHistory}
            >
              <span className="flex items-center gap-2 font-black tracking-tight text-[var(--color-on-surface)]">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                History
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
                  <div className="px-3 pb-3">
                    {recent.length === 0 ? (
                      <p className="px-2 py-4 text-center text-sm font-medium text-[var(--color-on-surface-variant)]">
                        No scans yet. History is stored only on this device.
                      </p>
                    ) : (
                      <>
                        <HistoryList
                          scans={recent}
                          onSelect={(s) => setResult(parseQR(s.raw, s.timestamp))}
                          onToggleFavorite={toggleFavorite}
                          onDelete={deleteScan}
                        />
                        {scans.length > 0 && (
                          <button
                            onClick={clearHistory}
                            className="ui-btn ui-btn-ghost ui-btn-sm mt-3 w-full text-[var(--color-error)] hover:bg-[var(--color-error-container)]"
                          >
                            <Trash2 className="w-4 h-4" /> Clear non-favorites
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
