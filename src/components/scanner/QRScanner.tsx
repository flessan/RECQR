"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lightbulb, Trash2 } from "lucide-react";
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
      <header className="text-center pt-4 pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-on-surface)]">
          QR Scanner
        </h1>
        <p className="text-[var(--color-on-surface-variant)] mt-2">
          Scan with your camera or decode an image — everything runs in your browser.
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
                className="rounded-2xl bg-gradient-to-br from-[var(--color-surface-container)] to-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/50 p-5"
              >
                <h2 className="font-bold text-[var(--color-on-surface)] flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" /> Scanning tips
                </h2>
                <ul className="text-sm text-[var(--color-on-surface-variant)] space-y-2">
                  <li>• Hold the camera steady, about 15–25 cm away.</li>
                  <li>• Avoid glare; ensure even lighting.</li>
                  <li>• The code should fill the reticle.</li>
                  <li>• Can&apos;t focus? Upload or paste a screenshot instead.</li>
                </ul>
                <p className="mt-4 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  <strong className="text-[var(--color-on-surface)]">Privacy:</strong>{" "}
                  camera frames and images are processed entirely on your device.
                  Nothing is uploaded, and URLs are never opened automatically.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4"
              aria-expanded={showHistory}
            >
              <span className="font-semibold flex items-center gap-2 text-[var(--color-on-surface)]">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                History
                <span className="text-xs font-normal text-[var(--color-on-surface-variant)]">
                  ({scans.length})
                </span>
              </span>
              <span className="text-sm text-[var(--color-primary)]">
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
                      <p className="text-sm text-[var(--color-on-surface-variant)] px-2 py-4 text-center">
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
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
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
