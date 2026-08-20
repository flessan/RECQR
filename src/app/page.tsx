"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: "scan",
    title: "Scan instantly",
    description:
      "Use your camera, upload an image, drag and drop, or paste a QR code.",
  },
  {
    icon: "bolt",
    title: "Runs locally",
    description:
      "QR decoding and generation happen directly in your browser.",
  },
  {
    icon: "shield",
    title: "Privacy first",
    description:
      "No accounts, tracking, or uploaded camera frames. Your data stays with you.",
  },
];

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 8h8v8H8z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M13 2 4.5 13h6L11 22l8.5-11h-6L13 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 3 19 6v5.5c0 4.6-2.8 7.8-7 9.5-4.2-1.7-7-4.9-7-9.5V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.3 9.41 7.88 10.94.58.11.79-.25.79-.56v-2.18c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.04 1.77 2.73 1.26 3.4.96.1-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.39-5.25 5.67.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const iconMap = {
  scan: ScanIcon,
  bolt: BoltIcon,
  shield: ShieldIcon,
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)]">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-container)] px-4 py-2 text-sm font-medium text-[var(--color-on-surface-variant)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                Open-source · Privacy-first
              </div>

              <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                QR codes,
                <br />
                <span className="text-[var(--color-primary)]">
                  without the baggage.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--color-on-surface-variant)] sm:text-xl">
                Scan and generate QR codes directly in your browser. Fast,
                capable, and designed so your data never needs to leave your
                device.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/scanner"
                  className="md-filled-button inline-flex items-center justify-center px-6"
                >
                  Scan a QR code
                </Link>

                <Link
                  href="/generator"
                  className="md-outlined-button inline-flex items-center justify-center px-6"
                >
                  Create a QR code
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-on-surface-variant)]">
                <span>✓ No account</span>
                <span>✓ No tracking</span>
                <span>✓ Browser-only processing</span>
              </div>
            </motion.div>

            {/* QR visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md">
                <div className="rounded-[2rem] bg-[var(--color-surface-container)] p-6 shadow-sm sm:p-8">
                  <div className="aspect-square rounded-3xl bg-[var(--color-surface)] p-7 shadow-sm sm:p-10">
                    <div
                      className="grid h-full w-full grid-cols-9 gap-[3%]"
                      aria-label="Decorative QR code"
                    >
                      {[
                        1, 1, 1, 0, 1, 0, 1, 1, 1,
                        1, 0, 1, 0, 1, 1, 0, 0, 1,
                        1, 1, 1, 0, 0, 0, 1, 1, 1,
                        0, 1, 0, 1, 1, 1, 0, 1, 0,
                        1, 0, 1, 1, 0, 1, 1, 0, 1,
                        0, 1, 1, 0, 1, 0, 0, 1, 0,
                        1, 1, 1, 1, 0, 1, 1, 1, 1,
                        1, 0, 1, 0, 1, 1, 0, 0, 1,
                        1, 1, 1, 0, 0, 1, 1, 1, 0,
                      ].map((filled, index) => (
                        <span
                          key={index}
                          className={
                            filled
                              ? "rounded-[2px] bg-[var(--color-on-surface)]"
                              : "rounded-[2px]"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">RECQR</p>
                      <p className="text-sm text-[var(--color-on-surface-variant)]">
                        Ready when you are.
                      </p>
                    </div>

                    <div className="rounded-full bg-[var(--color-primary-container)] px-3 py-1 text-xs font-semibold text-[var(--color-on-primary-container)]">
                      Local
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Built for the web
            </p>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple on the surface.
              <br />
              Capable underneath.
            </h2>

            <p className="mt-4 text-[var(--color-on-surface-variant)]">
              Everything you need for everyday QR codes, without turning a
              simple tool into another account-based service.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap];

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="md-card p-7"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
                    <Icon />
                  </div>

                  <h3 className="text-xl font-semibold">{feature.title}</h3>

                  <p className="mt-3 leading-7 text-[var(--color-on-surface-variant)]">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/scanner"
              className="group rounded-[2rem] bg-[var(--color-primary-container)] p-8 transition-transform hover:-translate-y-1 sm:p-10"
            >
              <p className="text-sm font-semibold text-[var(--color-on-primary-container)]/70">
                TOOL 01
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[var(--color-on-primary-container)]">
                Scan anything.
              </h2>

              <p className="mt-4 max-w-md leading-7 text-[var(--color-on-primary-container)]/80">
                Camera, image upload, drag & drop, or clipboard. RECQR brings
                them into one scanning workflow.
              </p>

              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[var(--color-on-primary-container)]">
                Open scanner
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>

            <Link
              href="/generator"
              className="group rounded-[2rem] bg-[var(--color-surface-container)] p-8 transition-transform hover:-translate-y-1 sm:p-10"
            >
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                TOOL 02
              </p>

              <h2 className="mt-4 text-3xl font-bold">
                Make your own QR.
              </h2>

              <p className="mt-4 max-w-md leading-7 text-[var(--color-on-surface-variant)]">
                Build QR codes for links, text, Wi-Fi, contacts, events,
                social profiles, and more.
              </p>

              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-[var(--color-primary)]">
                Open generator
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy statement */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]">
            <ShieldIcon />
          </div>

          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Your QR code is your business.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--color-on-surface-variant)]">
            RECQR is built around a simple principle: scanning a QR code
            shouldn't require sending your camera frames or uploaded images to
            a remote server.
          </p>

          <Link
            href="/documentation"
            className="md-text-button mt-6 inline-flex"
          >
            Read the documentation →
          </Link>
        </motion.div>
      </section>

      {/* Open source */}
      <section className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[var(--color-surface-container)] p-8 sm:p-10 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                OPEN SOURCE
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Built in the open.
              </h2>

              <p className="mt-2 max-w-xl text-[var(--color-on-surface-variant)]">
                RECQR is free, open-source software released under the MIT
                license.
              </p>
            </div>

            <a
              href="https://github.com/flessan/RECQR"
              target="_blank"
              rel="noopener noreferrer"
              className="md-filled-button inline-flex shrink-0 items-center gap-2"
            >
              <GitHubIcon />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}