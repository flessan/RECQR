"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const codeExample = `# Generate an SVG QR code (optional server endpoint)
curl "https://your-worker.workers.dev/v1/qr/generate?text=https://example.com"

# With colors and margin
curl "https://your-worker.workers.dev/v1/qr/generate?text=Hello&fg=%236750A4&bg=%23FFFFFF&margin=2"

# JSON response (returns the SVG as a string)
curl "https://your-worker.workers.dev/v1/qr/generate?text=Hello&format=json"`;

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navigation />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-on-surface)] mb-4">
              Optional Edge API
            </h1>
            <p className="text-lg text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              The RECQR web app needs <strong>no backend</strong> - scanning,
              image decoding, and QR generation all run in the browser. The
              Cloudflare Worker in <code>worker/</code> is an optional,
              standalone endpoint for generating QR SVGs over HTTP.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { title: "SVG output", body: "Returns a crisp SVG or a JSON wrapper." },
              { title: "No auth required", body: "Self-host the Worker; call it directly." },
              { title: "Serverless", body: "Runs on Cloudflare's global edge network." },
            ].map((f) => (
              <div key={f.title} className="md-card p-5">
                <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--color-on-surface-variant)]">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="md-card overflow-hidden">
            <div className="bg-[var(--color-surface-container)] px-6 py-4 border-b border-[var(--color-outline-variant)]">
              <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
                GET /v1/qr/generate
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Query parameters</h3>
                <ul className="text-sm text-[var(--color-on-surface-variant)] space-y-1">
                  <li><code className="text-[var(--color-primary)]">text</code> - content to encode (required)</li>
                  <li><code className="text-[var(--color-primary)]">margin</code> - quiet-zone modules (default 2)</li>
                  <li><code className="text-[var(--color-primary)]">fg</code> - foreground color (default #000000)</li>
                  <li><code className="text-[var(--color-primary)]">bg</code> - background color (default #ffffff)</li>
                  <li><code className="text-[var(--color-primary)]">format</code> - <code>svg</code> (default) or <code>json</code></li>
                </ul>
              </div>
              <div className="bg-[var(--color-surface-container-low)] rounded-xl overflow-hidden">
                <div className="flex px-4 py-2 border-b border-[var(--color-outline-variant)]">
                  <span className="text-xs text-[var(--color-on-surface-variant)] font-mono">Terminal</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-[var(--color-on-surface-variant)] font-mono">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface-variant)]">
            <strong className="text-[var(--color-on-surface)]">Note:</strong> There
            is no server-side QR <em>decoding</em> endpoint. Decoding camera
            frames and uploaded images always happens locally with jsQR - by
            design, because sending those to a server would violate RECQR&apos;s
            privacy model. Official SDKs, dynamic QR codes, analytics, and
            webhooks are not implemented.
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
