"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function DonatePage() {
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
              Support RECQR
            </h1>
            <p className="text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              Help us maintain and improve RECQR for everyone.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md-card p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-4">
              Why Your Support Matters
            </h2>
            <p className="text-[var(--color-on-surface-variant)] leading-relaxed mb-4">
              RECQR is an open-source project dedicated to providing a modern,
              privacy-focused QR code platform for everyone. Your donations help us:
            </p>
            <ul className="space-y-2 text-[var(--color-on-surface-variant)]">
              {[
                "Maintain and upgrade infrastructure",
                "Develop new features and improvements",
                "Write comprehensive documentation",
                "Ensure security and privacy",
                "Support the open-source community",
              ].map((item) => (
                <li key={item} className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Donation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                title: "One-Time Donation",
                description: "Make a single donation of any amount",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Monthly Supporter",
                description: "Become a recurring supporter with monthly donations",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                ),
              },
            ].map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="md-card p-8 text-center hover:md-elevation-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-on-surface)] mb-2">
                  {option.title}
                </h3>
                <p className="text-[var(--color-on-surface-variant)] mb-6">
                  {option.description}
                </p>
                <button onClick={() => window.open("https://tako.id/fLeSs/gift", "_blank")} className="md-filled-button w-full">Donate Now</button>
              </motion.div>
            ))}
          </div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md-card p-8"
          >
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6 text-center">
              Donation Methods
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Tako.id", description: "Indonesian payment gateway", href: "https://tako.id/fLeSs/gift" },
                { name: "Buy Me a Coffee", description: "Support with a virtual coffee", href: "https://buymeacoffee.com/flessan" },
                { name: "GitHub Sponsors", description: "Support via GitHub", href: "https://github.com/sponsors/flessan" },
                { name: "Open Collective", description: "Transparent funding", href: "https://opencollective.com/thio-saputra" },
              ].map((method) => (
                <a
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-[var(--radius-md)] border-2 border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-container)] transition-all duration-200 text-left"
                >
                  <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">
                    {method.name}
                  </h3>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    {method.description}
                  </p>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Thank You Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-lg text-[var(--color-on-surface-variant)]">
              Every donation, no matter how small, makes a difference. Thank you for
              supporting open-source software! 🙏
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
