"use client";

import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { BookOpen, Code, Terminal, Zap, ChevronRight, Hash, Play, Blocks } from "lucide-react";
import Link from "next/link";

const sidebarLinks = [
  {
    title: "Overview",
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      { name: "Introduction", id: "intro" },
      { name: "Why RECQR?", id: "why-recqr" },
    ]
  },
  {
    title: "Getting Started",
    icon: <Play className="w-4 h-4" />,
    items: [
      { name: "Quick Start", id: "quickstart" },
      { name: "Using the Scanner", id: "scanner" },
      { name: "Generating Codes", id: "generator" },
    ]
  },
  {
    title: "Edge API",
    icon: <Terminal className="w-4 h-4" />,
    items: [
      { name: "API Reference", id: "api-reference" },
      { name: "Cloudflare Workers", id: "workers" },
    ]
  },
  {
    title: "Integration",
    icon: <Blocks className="w-4 h-4" />,
    items: [
      { name: "React SDK", id: "react" },
      { name: "Webhooks", id: "webhooks" },
    ]
  }
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("intro");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-primary)] selection:text-white">
      <Navigation />

      <div className="pt-24 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 pb-16">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-6 custom-scrollbar border-r border-[var(--color-outline-variant)]/30">
          <div className="space-y-8 pb-8">
            {sidebarLinks.map((section) => (
              <div key={section.title}>
                <h3 className="flex items-center space-x-2 text-sm font-bold text-[var(--color-on-surface)] mb-3 select-none tracking-wider uppercase">
                  {section.icon}
                  <span>{section.title}</span>
                </h3>
                <ul className="space-y-1 pl-6 border-l border-[var(--color-outline-variant)]/50 ml-2">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollTo(item.id)}
                        className={`text-sm w-full text-left py-1.5 px-3 rounded-md transition-colors relative -left-[1px] border-l-2 ${
                          activeSection === item.id 
                            ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold" 
                            : "border-transparent text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]"
                        }`}
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <article className="flex-1 min-w-0 max-w-4xl pt-8 md:pt-0">
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            
            {/* Intro */}
            <section id="intro" className="scroll-mt-32">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight mb-4">
                Documentation
              </h1>
              <p className="text-xl text-[var(--color-on-surface-variant)] mb-8">
                Welcome to the RECQR documentation. Learn how to instantly scan, decode, and generate QR codes at the edge using our platform and APIs.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/scanner" className="p-6 rounded-2xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-surface-container-high)] transition-colors group cursor-pointer">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-2 flex items-center">
                    Try the Scanner <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1" />
                  </h3>
                  <p className="text-[var(--color-on-surface-variant)] text-sm">Experience the blazing fast client-side decoding immediately.</p>
                </Link>
                <Link href="/generator" className="p-6 rounded-2xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/50 hover:bg-[var(--color-surface-container-high)] transition-colors group cursor-pointer">
                  <div className="w-12 h-12 bg-purple-500/20 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-2 flex items-center">
                    Build a QR Code <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 group-hover:translate-x-1" />
                  </h3>
                  <p className="text-[var(--color-on-surface-variant)] text-sm">Generate beautiful SVG/PNG codes with our easy-to-use tool.</p>
                </Link>
              </div>
            </section>

            {/* Why RECQR */}
            <section id="why-recqr" className="scroll-mt-32">
              <h2 className="text-3xl font-bold text-[var(--color-on-surface)] mb-6 flex items-center">
                <Hash className="w-6 h-6 mr-2 text-[var(--color-primary)]" />
                Why RECQR?
              </h2>
              <div className="prose prose-invert prose-p:text-[var(--color-on-surface-variant)] prose-strong:text-[var(--color-on-surface)] max-w-none">
                <p>
                  Most QR code platforms are slow, littered with ads, and require a backend server just to decode an image. 
                  <strong> RECQR flips this paradigm</strong>.
                </p>
                <ul>
                  <li><strong>100% Client-Side Scanning:</strong> We use WASM and modern browser APIs to decode QR codes directly on your device. Your camera feed never touches our servers.</li>
                  <li><strong>Rich Payloads:</strong> Automatically identifies WiFi, vCards, Calendar Events, Geo-locations, and Maps them to beautiful, actionable UI cards.</li>
                  <li><strong>Edge API:</strong> Our generator API is hosted on Cloudflare Workers, meaning the generation happens on an edge node just milliseconds away from your users.</li>
                </ul>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="scroll-mt-32">
              <h2 className="text-3xl font-bold text-[var(--color-on-surface)] mb-6 flex items-center">
                <Hash className="w-6 h-6 mr-2 text-[var(--color-primary)]" />
                Quick Start
              </h2>
              <p className="text-[var(--color-on-surface-variant)] mb-4">
                Want to host RECQR yourself? It's a statically exported Next.js 14 application that can be deployed to GitHub Pages, Vercel, or Netlify instantly.
              </p>
              <div className="bg-[#111111] rounded-xl border border-white/10 overflow-hidden mb-6 shadow-xl">
                <div className="flex px-4 py-2 border-b border-white/10 bg-[#1A1A1A]">
                  <span className="text-xs text-white/50 font-mono">Terminal</span>
                </div>
                <div className="p-4 overflow-x-auto custom-scrollbar">
                  <pre className="text-sm font-mono text-green-400">
                    <code>git clone https://github.com/flessan/RECQR.git
cd RECQR
npm install
npm run dev</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="scroll-mt-32">
              <h2 className="text-3xl font-bold text-[var(--color-on-surface)] mb-6 flex items-center">
                <Hash className="w-6 h-6 mr-2 text-[var(--color-primary)]" />
                API Reference
              </h2>
              <p className="text-[var(--color-on-surface-variant)] mb-4">
                Our Cloudflare Workers API allows you to programmatically generate QR codes on the edge. No authentication is required for basic usage.
              </p>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">Generate QR Code</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-green-500/20 text-green-500 font-mono text-xs px-2 py-1 rounded">GET</span>
                  <code className="text-sm text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-high)] px-2 py-1 rounded">/v1/qr/generate</code>
                </div>
                
                <div className="bg-[var(--color-surface-container)] rounded-xl border border-[var(--color-outline-variant)]/50 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--color-surface-container-high)] border-b border-[var(--color-outline-variant)]/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-[var(--color-on-surface)]">Parameter</th>
                        <th className="px-4 py-3 font-semibold text-[var(--color-on-surface)]">Type</th>
                        <th className="px-4 py-3 font-semibold text-[var(--color-on-surface)]">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)]">
                      <tr>
                        <td className="px-4 py-3 font-mono text-indigo-400">text</td>
                        <td className="px-4 py-3">string</td>
                        <td className="px-4 py-3">Required. The content to encode.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-indigo-400">margin</td>
                        <td className="px-4 py-3">number</td>
                        <td className="px-4 py-3">Border margin. Default: 2</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-indigo-400">format</td>
                        <td className="px-4 py-3">string</td>
                        <td className="px-4 py-3">Response type ('svg' | 'json'). Default: svg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#111111] rounded-xl border border-white/10 overflow-hidden mb-6 shadow-xl">
                <div className="flex px-4 py-2 border-b border-white/10 bg-[#1A1A1A]">
                  <span className="text-xs text-white/50 font-mono">Example Request</span>
                </div>
                <div className="p-4 overflow-x-auto custom-scrollbar">
                  <pre className="text-sm font-mono text-cyan-400">
                    <code>curl -X GET "https://api.yourdomain.com/v1/qr/generate?text=https://example.com"</code>
                  </pre>
                </div>
              </div>
            </section>

          </motion.div>
        </article>
      </div>

      <Footer />
    </main>
  );
}
