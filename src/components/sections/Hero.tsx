"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, ScanLine, Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  // Material You 3 Standard & Emphasized Easing
  const m3Easing: [number, number, number, number] = [0.2, 0, 0, 1];

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[var(--color-background)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary-container)]">

      {/* Background Ambient Tonal Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[var(--color-primary-container)]/60 to-[var(--color-tertiary-container)]/40 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[var(--color-primary)]/20 to-[var(--color-secondary-container)]/50 blur-[120px]"
        />

        {/* Subtle M3 Tonal Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center pt-32">

        {/* Top Badge (M3 Secondary Container) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: m3Easing }}
        >
          <Link
            href="/documentation"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--color-secondary-container)] hover:opacity-90 transition-opacity group mb-8 cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-on-secondary-container)]">100% in-browser · No tracking · Open source</span>
            <ArrowRight className="w-4 h-4 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: m3Easing }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 select-none"
        >
          <span className="block text-[var(--color-on-surface)]">Scan. Decode.</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-tertiary)] to-[#00A0A0] pb-2">
            Instantly.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: m3Easing }}
          className="text-lg sm:text-xl lg:text-2xl text-[var(--color-on-surface-variant)] mb-12 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Scan and generate QR codes instantly — entirely in your browser. Your camera, images, and data never leave your device.
        </motion.p>

        {/* CTA Buttons (M3 Filled & Tonal) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: m3Easing }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          {/* Primary Filled Button */}
          <Link
            href="/scanner"
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full font-semibold text-lg hover:opacity-90 active:scale-95 transition-all md-elevation-1 select-none"
          >
            <ScanLine className="w-5 h-5" />
            <span>Open Scanner</span>
          </Link>

          {/* Secondary Tonal Button */}
          <Link
            href="/generator"
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] rounded-full font-semibold text-lg hover:opacity-90 active:scale-95 transition-all select-none"
          >
            <QrCode className="w-5 h-5" />
            <span>Create QR</span>
          </Link>
        </motion.div>

        {/* Central App Mockup (M3 Surface Container) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: m3Easing }}
          className="relative mt-24 w-full max-w-3xl mx-auto select-none pointer-events-none"
        >
          <div className="relative aspect-[16/10] sm:aspect-video rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] shadow-xl shadow-black/5 flex items-center justify-center">

            {/* Inner Mockup Scanner Frame */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[var(--color-primary)]/20 rounded-3xl" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-3xl" />

              <QrCode className="w-24 h-24 text-[var(--color-primary)]/20" />

              <motion.div
                animate={{ y: [0, 180, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 top-4 h-[2px] bg-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]"
              />
            </div>

            {/* Floating Tonal Cards */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 sm:left-10 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-4 rounded-2xl flex items-center space-x-3 shadow-lg shadow-black/5"
            >
              <div className="w-10 h-10 bg-[var(--color-secondary-container)] rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[var(--color-on-secondary-container)]" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">Smart Detection</p>
                <p className="text-xs text-[var(--color-on-surface-variant)]">Auto-parses payload</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 -right-10 sm:right-10 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] p-4 rounded-2xl flex items-center space-x-3 shadow-lg shadow-black/5"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">Private</p>
                <p className="text-xs text-[var(--color-on-surface-variant)]">No data uploaded</p>
              </div>
              <div className="w-10 h-10 bg-[var(--color-tertiary-container)] rounded-full flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-[var(--color-on-tertiary-container)]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}