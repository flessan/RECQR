"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Clock,
  FileImage,
  Fingerprint,
  Code2,
  Palette,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  WifiOff,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant scan",
    description: "Frame-throttled decoding that locks onto a code the moment it's in view.",
    tone: "primary",
  },
  {
    icon: Camera,
    title: "Real camera controls",
    description: "Torch, zoom, front/rear switching and battery-friendly scanning.",
    tone: "plain",
  },
  {
    icon: Sparkles,
    title: "Smart actions",
    description: "Wi-Fi, contacts, events, geo and links are parsed into ready-to-use actions.",
    tone: "plain",
  },
  {
    icon: ShieldCheck,
    title: "Safe scan",
    description: "Protocol allow-list plus phishing heuristics before anything opens.",
    tone: "secondary",
  },
  {
    icon: Clock,
    title: "Scan history",
    description: "Every scan stored locally with favorites, search and quick re-actions.",
    tone: "plain",
  },
  {
    icon: FileImage,
    title: "Image & paste",
    description: "Upload, drag & drop or Ctrl/⌘+V a screenshot — decoded on device.",
    tone: "plain",
  },
  {
    icon: Palette,
    title: "Custom design",
    description: "Colors, module shapes, finder styles, frames and embedded logos.",
    tone: "tertiary",
  },
  {
    icon: WifiOff,
    title: "Offline-ready",
    description: "A static app with zero backend. Host it anywhere, run it anywhere.",
    tone: "plain",
  },
  {
    icon: Code2,
    title: "Open source",
    description: "MIT licensed, typed end-to-end, and covered by an automated test suite.",
    tone: "plain",
  },
];

const TONE_CLASS: Record<string, string> = {
  primary: "ui-card-primary",
  secondary: "ui-card-secondary",
  tertiary: "ui-card-tertiary",
  plain: "",
};

export default function Features() {
  return (
    <section className="relative border-y-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <span className="ui-badge">
            <ScanLine className="h-3.5 w-3.5" />
            Everything included
          </span>
          <h2 className="ui-display mt-5 text-[clamp(2rem,5vw,3.25rem)] text-[var(--color-on-surface)]">
            Features that stay <span className="ui-underline whitespace-nowrap">on your device</span>
          </h2>
          <p className="mt-4 text-lg font-medium text-[var(--color-on-surface-variant)]">
            Scanning, parsing, generating and exporting all run in the browser tab.
            Nothing is uploaded — there is no server to upload to.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.05 }}
                className={`ui-card ui-hoverable p-6 ${TONE_CLASS[feature.tone]}`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[var(--color-outline)] bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] shadow-[var(--ui-shadow-sm)]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed opacity-80">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="ui-card mt-4 flex flex-wrap items-center justify-between gap-4 p-6"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-on-surface)]">
            <Fingerprint className="h-5 w-5 text-[var(--color-primary)]" />
            No account, no cookies, no analytics — ever.
          </p>
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-on-surface-variant)]">
            <Star className="h-5 w-5 text-[var(--color-tertiary)]" />
            Static export, deploys to GitHub Pages
          </p>
        </motion.div>
      </div>
    </section>
  );
}
