"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const codeExample = `// REST API Example - Hosted on Cloudflare Workers
// 1. Generate QR Code (Returns SVG image directly)
curl -X GET "https://qr-api.your-worker-subdomain.workers.dev/v1/qr/generate?text=https://example.com"

// Or get JSON response
curl -X GET "https://qr-api.your-worker-subdomain.workers.dev/v1/qr/generate?text=https://example.com&format=json"

// JSON Response
{
  "success": true,
  "data": {
    "text": "https://example.com",
    "svg": "<svg>...</svg>"
  }
}`;

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-[var(--color-on-surface)] mb-6">
              API Documentation
            </h1>
            <p className="text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              Integrate RECQR into your applications with our blazing-fast REST API, proudly powered by Cloudflare Workers.
            </p>
          </motion.div>

          {/* API Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Cloudflare Workers",
                description: "Global edge network ensures sub-50ms latency anywhere in the world.",
              },
              {
                title: "No Auth Required",
                description: "Get started immediately. Zero configuration or API keys needed.",
              },
              {
                title: "High Availability",
                description: "Built on serverless architecture for unparalleled uptime and scale.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="md-card p-6"
              >
                <h3 className="text-xl font-semibold text-[var(--color-on-surface)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-on-surface-variant)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md-card overflow-hidden"
          >
            <div className="bg-[var(--color-surface-container)] px-6 py-4 border-b border-[var(--color-outline-variant)]">
              <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
                Quick Start
              </h2>
            </div>
            <div className="p-6">
              <pre className="bg-[var(--color-surface-container-low)] rounded-[var(--radius-md)] p-6 overflow-x-auto">
                <code className="text-sm text-[var(--color-on-surface-variant)] font-mono">
                  {codeExample}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* SDK Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">
              Official SDKs
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {["JavaScript", "React", "Flutter", "Node.js", "Python", "Go"].map(
                (sdk) => (
                  <span
                    key={sdk}
                    className="px-6 py-3 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-medium"
                  >
                    {sdk}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
