"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Scanner", href: "/scanner" },
  { name: "Generator", href: "/generator" },
  { name: "Features", href: "/features" },
  { name: "Documentation", href: "/documentation" },
  { name: "API", href: "/api" },
  { name: "Support", href: "/support" },
  { name: "GitHub", href: "https://github.com/flessan/RECQR", external: true },
  { name: "Donate", href: "/donate" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-surface-container-lowest)]/95 backdrop-blur-md md-elevation-2"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-[var(--color-on-surface)]">
              RECQR
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/scanner" className="px-4 py-2 rounded-full text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">Scan QR</Link>
            <Link href="/generator" className="md-filled-button">Create QR</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)]"
          >
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  target={item.external ? "_blank" : undefined}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                      : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 pb-2 flex flex-col space-y-2">
                <Link href="/scanner" className="w-full md-outlined-button inline-flex justify-center items-center">Scan QR</Link>
                <Link href="/generator" className="w-full md-filled-button inline-flex justify-center items-center">Create QR</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
