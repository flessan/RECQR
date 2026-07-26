"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, ScanLine, Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  // Material You 3 Standard & Emphasized Easing
  const m3Easing = [0.2, 0, 0, 1];

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#FEF7FF] text-[#1D1B20] selection:bg-[#EADDFF]">

      {/* Background Ambient Tonal Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#EADDFF]/60 to-[#FFD8E4]/40 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#D0BCFF]/30 to-[#E8DEF8]/50 blur-[120px]"
        />

        {/* Subtle M3 Tonal Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#6750A4_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />
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
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#E8DEF8] hover:bg-[#DCC9F5] transition-colors group mb-8 cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-[#6750A4]" />
            <span className="text-sm font-medium text-[#49454F]">Powered by Cloudflare Workers</span>
            <ArrowRight className="w-4 h-4 text-[#6750A4] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: m3Easing }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 select-none"
        >
          <span className="block text-[#1D1B20]">Scan. Decode.</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#6750A4] via-[#7D5260] to-[#006A6A] pb-2">
            Instantly.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: m3Easing }}
          className="text-lg sm:text-xl lg:text-2xl text-[#49454F] mb-12 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          The ultimate edge-powered QR platform. Native app performance, zero installations. Built for modern browsers.
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
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-[#6750A4] text-white rounded-full font-semibold text-lg hover:bg-[#7965AF] active:scale-95 transition-all shadow-sm shadow-[#6750A4]/20 select-none"
          >
            <ScanLine className="w-5 h-5" />
            <span>Open Scanner</span>
          </Link>

          {/* Secondary Tonal Button */}
          <Link
            href="/generator"
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 bg-[#E8DEF8] text-[#6750A4] rounded-full font-semibold text-lg hover:bg-[#DCC9F5] active:scale-95 transition-all select-none"
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
          <div className="relative aspect-[16/10] sm:aspect-video rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#F3EDF7] border border-[#E6E0E9] shadow-xl shadow-[#6750A4]/5 flex items-center justify-center">

            {/* Inner Mockup Scanner Frame */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-[#6750A4]/20 rounded-3xl" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#6750A4] rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#6750A4] rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#6750A4] rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#6750A4] rounded-br-3xl" />

              <QrCode className="w-24 h-24 text-[#6750A4]/20" />

              <motion.div
                animate={{ y: [0, 180, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 top-4 h-[2px] bg-[#6750A4] shadow-[0_0_15px_rgba(103,80,164,0.4)]"
              />
            </div>

            {/* Floating Tonal Cards */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 sm:left-10 bg-white border border-[#E6E0E9] p-4 rounded-2xl flex items-center space-x-3 shadow-lg shadow-[#6750A4]/5"
            >
              <div className="w-10 h-10 bg-[#E8DEF8] rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#6750A4]" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-[#1D1B20]">Smart Detection</p>
                <p className="text-xs text-[#49454F]">Auto-parses payload</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 -right-10 sm:right-10 bg-white border border-[#E6E0E9] p-4 rounded-2xl flex items-center space-x-3 shadow-lg shadow-[#6750A4]/5"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#1D1B20]">Edge Powered</p>
                <p className="text-xs text-[#49454F]">&lt; 50ms latency</p>
              </div>
              <div className="w-10 h-10 bg-[#FFD8E4] rounded-full flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-[#7D5260]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}