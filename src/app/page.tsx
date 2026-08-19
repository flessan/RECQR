"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "What makes this different from Google Lens?",
    answer:
      "RECQR is specifically designed for QR codes with instant actions, smart redirects, and developer APIs. It's faster, more privacy-focused, and offers features like dynamic QR codes and analytics.",
  },
  {
    question: "How does auto redirect work?",
    answer:
      "When you scan a URL QR code, we attempt to automatically redirect you. Due to browser security restrictions, this works on some browsers but not all. When auto-redirect isn't possible, we clearly show the detected URL with a prominent open button.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes! The basic scanner is completely free to use. We also offer premium features for developers and enterprises, but the core functionality is free and open-source.",
  },
  {
    question: "Is it secure?",
    answer:
      "Security is our top priority. We perform safety checks on scanned URLs, warn about suspicious content, and never automatically execute dangerous actions without your confirmation.",
  },
  {
    question: "Does it support mobile?",
    answer:
      "Absolutely! RECQR is built mobile-first. It works seamlessly on all modern mobile browsers and we're working on native mobile apps.",
  },
  {
    question: "Can I self-host it?",
    answer:
      "Yes! RECQR is open-source and designed to be self-hosted. Check out our GitHub repository for deployment instructions.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-on-surface)] mb-6">
              Support
            </h1>
            <p className="text-xl text-[var(--color-on-surface-variant)]">
              Get help and find answers to common questions.
            </p>
          </motion.div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="md-card p-6"
                >
                  <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="md-card p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-4">
              Still Need Help?
            </h2>
            <p className="text-[var(--color-on-surface-variant)] mb-6">
              Can't find what you're looking for? Reach out to us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/flessan/RECQR/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="md-filled-button inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub Issues</span>
              </a>
              <a
                href="mailto:kambinghirang2@gmail.com"
                className="md-outlined-button inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Email Support</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
