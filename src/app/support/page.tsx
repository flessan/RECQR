"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "What makes this different from Google Lens?",
    answer:
      "RECQR is specifically designed for QR codes with fast scanning, smart result handling, and a privacy-first experience. Everything happens directly in your browser.",
  },
  {
    question: "How does auto redirect work?",
    answer:
      "RECQR never opens scanned URLs automatically. Instead, detected links are shown clearly so you can review them before opening them.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. RECQR is free and open-source, including its scanner and QR generator.",
  },
  {
    question: "Is it secure?",
    answer:
      "RECQR is designed with privacy and security in mind. Camera frames, uploaded images, and generated QR codes stay on your device.",
  },
  {
    question: "Does it support mobile?",
    answer:
      "Yes. RECQR is designed to work on modern mobile and desktop browsers, including camera scanning when supported by the browser.",
  },
  {
    question: "Can I self-host it?",
    answer:
      "Yes. RECQR is open-source and can be hosted as a static web application. Check the documentation for deployment details.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />

      <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="mb-6 text-5xl font-bold text-[var(--color-on-surface)] sm:text-6xl">
              Support
            </h1>

            <p className="text-xl text-[var(--color-on-surface-variant)]">
              Get help and find answers to common questions.
            </p>
          </motion.div>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-[var(--color-on-surface)]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="md-card p-6"
                >
                  <h3 className="mb-2 text-lg font-semibold text-[var(--color-on-surface)]">
                    {faq.question}
                  </h3>

                  <p className="leading-relaxed text-[var(--color-on-surface-variant)]">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Donate */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md-card mb-8 p-8 text-center"
          >
            <h2 className="mb-4 text-2xl font-bold text-[var(--color-on-surface)]">
              Have some extra money you'd like to give away?
            </h2>

            <p className="mb-6 text-[var(--color-on-surface-variant)]">
              If you are a generous person, you are welcome to visit this page.
              :D
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/donate"
                className="md-filled-button-donate inline-flex items-center gap-2"
              >
                {/* GitHub */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>

                {/* Coffee / donation */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
                  <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
                  <path d="M8 4v2M12 4v2" />
                </svg>

                <span>Support RECQR</span>
              </a>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="md-card p-8 text-center"
          >
            <h2 className="mb-4 text-2xl font-bold text-[var(--color-on-surface)]">
              Or Still Need Help?
            </h2>

            <p className="mb-6 text-[var(--color-on-surface-variant)]">
              Can't find what you're looking for? Reach out to us.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/flessan/RECQR/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="md-filled-button inline-flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>

                <span>GitHub Issues</span>
              </a>

              <a
                href="mailto:kambinghirang2@gmail.com"
                className="md-outlined-button inline-flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
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
          </motion.section>
        </div>
      </div>

      <Footer />
    </main>
  );
}