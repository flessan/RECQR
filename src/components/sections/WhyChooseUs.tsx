"use client";

import { motion } from "framer-motion";
import { Camera, Download, Palette, ScanLine } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    kicker: "Step 01",
    title: "Point or drop",
    description:
      "Use the camera, upload an image, drag & drop a file, or paste a screenshot with Ctrl/⌘+V.",
  },
  {
    icon: ScanLine,
    kicker: "Step 02",
    title: "Decode & understand",
    description:
      "The payload is parsed into a typed result - URL, Wi-Fi, vCard, event, geo - with safety checks on links.",
  },
  {
    icon: Palette,
    kicker: "Step 03",
    title: "Design your own",
    description:
      "Pick a preset, style the modules and finders, drop in a logo, and watch the preview update live.",
  },
  {
    icon: Download,
    kicker: "Step 04",
    title: "Export anywhere",
    description:
      "Download PNG, SVG or WebP rendered from the exact same geometry you see in the preview.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[var(--color-background)] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <span className="ui-badge">How it works</span>
          <h2 className="ui-display mt-5 text-[clamp(2rem,5vw,3.25rem)] text-[var(--color-on-surface)]">
            Four steps, <span className="ui-underline whitespace-nowrap">zero uploads</span>
          </h2>
        </motion.div>

        <ol className="mt-12 grid gap-4 md:grid-cols-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: Math.min(index, 4) * 0.06 }}
                className="ui-card ui-hoverable flex gap-4 p-6"
              >
                <span className="ui-step h-11 w-11 text-base">{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--color-primary)]">
                    {step.kicker}
                  </p>
                  <h3 className="mt-1 flex items-center gap-2 text-xl font-black tracking-tight text-[var(--color-on-surface)]">
                    <Icon className="h-5 w-5 text-[var(--color-secondary)]" />
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-on-surface-variant)]">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
