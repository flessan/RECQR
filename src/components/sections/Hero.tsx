"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ImageDown, QrCode, ScanLine, ShieldCheck, Sparkles, WifiOff } from "lucide-react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATS = [
  { value: "0", label: "bytes uploaded" },
  { value: "14", label: "content presets" },
  { value: "100%", label: "in your browser" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background)] pt-28 pb-20 sm:pt-32 lg:pt-36">
      {/* playful background: dot grid + color blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="ui-dotgrid absolute inset-0 opacity-60" />
        <div className="absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[var(--color-secondary-container)] opacity-70 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-[var(--color-primary-container)] opacity-70 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:px-8">
        {/* ---------------------------------------------------------- copy */}
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Link
              href="/documentation"
              className="ui-badge border-[var(--color-outline)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] shadow-[var(--ui-shadow-sm)] transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              No servers · No tracking · Open source
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="ui-display mt-6 text-[clamp(2.75rem,8vw,5rem)] text-[var(--color-on-surface)]"
          >
            Scan it.
            <br />
            Make it.{" "}
            <span className="ui-underline whitespace-nowrap text-[var(--color-primary)]">Own it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-[var(--color-on-surface-variant)] sm:text-xl"
          >
            A QR scanner and generator that never phones home. Camera frames,
            images and logos are processed on your device — and nowhere else.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/scanner" className="ui-btn ui-btn-primary ui-btn-lg w-full sm:w-auto">
              <ScanLine className="h-5 w-5" />
              Open scanner
            </Link>
            <Link href="/generator" className="ui-btn ui-btn-surface ui-btn-lg w-full sm:w-auto">
              <QrCode className="h-5 w-5" />
              Create a QR
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-4"
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-3xl font-black tracking-tight text-[var(--color-on-surface)]">
                    {s.value}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ------------------------------------------------------- artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="relative mx-auto w-full max-w-md min-w-0"
        >
          <div className="ui-card ui-card-primary relative overflow-hidden rounded-[2.5rem] border-[var(--color-outline)] p-6 shadow-[var(--ui-shadow-lg)]">
            <div className="flex items-center justify-between">
              <span className="ui-badge border-[var(--color-outline)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                Live preview
              </span>
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--color-on-primary-container)]">
                recqr
              </span>
            </div>

            <div className="mt-5 grid place-items-center rounded-3xl border-2 border-[var(--color-outline)] bg-[var(--color-surface-container-lowest)] p-6">
              <HeroQr />
            </div>

            <p className="mt-5 text-center text-sm font-bold text-[var(--color-on-primary-container)]">
              Rendered locally · SVG · PNG · WebP
            </p>
            <div className="h-1" />
          </div>

          {/* floating sticker cards */}
          <div className="pointer-events-none absolute -left-4 top-1/3 hidden sm:block lg:-left-10">
            <div
              className="ui-card flex items-center gap-2 rounded-2xl border-[var(--color-outline)] px-3 py-2 shadow-[var(--ui-shadow-sm)]"
              style={{ animation: "ui-float 6s ease-in-out infinite" }}
            >
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-xs font-bold text-[var(--color-on-surface)]">Safe-link checks</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 top-2/3 hidden sm:block lg:-right-10">
            <div
              className="ui-card flex items-center gap-2 rounded-2xl border-[var(--color-outline)] px-3 py-2 shadow-[var(--ui-shadow-sm)]"
              style={{ animation: "ui-float 7s ease-in-out infinite", animationDelay: "1.2s" }}
            >
              <WifiOff className="h-4 w-4 text-[var(--color-secondary)]" />
              <span className="text-xs font-bold text-[var(--color-on-surface)]">Works offline</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-6 left-6 hidden lg:block">
            <div
              className="ui-card flex items-center gap-2 rounded-2xl border-[var(--color-outline)] px-3 py-2 shadow-[var(--ui-shadow-sm)]"
              style={{ animation: "ui-float 5.5s ease-in-out infinite", animationDelay: "0.6s" }}
            >
              <ImageDown className="h-4 w-4 text-[var(--color-tertiary)]" />
              <span className="text-xs font-bold text-[var(--color-on-surface)]">Logo compositing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Decorative QR-ish mark drawn with plain divs (no encoder needed). */
function HeroQr() {
  const cells = [
    "1111111001101111111",
    "1000001010101000001",
    "1011101001101011101",
    "1011101110101011101",
    "1011101010101011101",
    "1000001011001000001",
    "1111111010101111111",
    "0000000011100000000",
    "1101101101011010110",
    "0010110010110101001",
    "1101011101001011010",
    "0100110010110100101",
    "1111000101011011010",
    "0000000110100101101",
    "1111111011010110010",
    "1000001001011001101",
    "1011101110100110010",
    "1011101010111001101",
    "1111111011010110011",
  ];
  return (
    <div
      className="grid aspect-square w-full max-w-[15rem] gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cells[0].length}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {cells.flatMap((row, y) =>
        row.split("").map((c, x) => (
          <span
            key={`${x}-${y}`}
            className={`aspect-square rounded-[2px] ${
              c === "1" ? "bg-[var(--color-on-surface)]" : "bg-transparent"
            }`}
          />
        ))
      )}
    </div>
  );
}
