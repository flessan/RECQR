"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, QrCode, ScanLine } from "lucide-react";

export default function CTASection() {
  return (
    <section className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border-2 border-[var(--color-outline)] bg-[var(--color-primary)] px-6 py-14 text-center shadow-[var(--ui-shadow-lg)] sm:px-12"
      >
        <div className="ui-dotgrid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />

        <div className="relative">
          <h2 className="ui-display mx-auto max-w-3xl text-[clamp(2rem,5.5vw,3.5rem)] text-[var(--color-on-primary)]">
            Your codes. Your device. Your rules.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-semibold text-[var(--color-on-primary)] opacity-90 sm:text-lg">
            Open the scanner or build a custom QR code right now — no sign-up,
            no upload, no waiting.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/scanner"
              className="ui-btn ui-btn-lg w-full border-[var(--color-outline)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] sm:w-auto"
            >
              <ScanLine className="h-5 w-5" />
              Start scanning
            </Link>
            <Link
              href="/generator"
              className="ui-btn ui-btn-lg w-full border-[var(--color-outline)] bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] sm:w-auto"
            >
              <QrCode className="h-5 w-5" />
              Create a QR
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <a
            href="https://github.com/flessan/RECQR"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-on-primary)] underline-offset-4 hover:underline"
          >
            <Code2 className="h-4 w-4" />
            Read the source on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}
