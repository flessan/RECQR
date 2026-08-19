"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Moon, Sun } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Scanner", href: "/scanner" },
  { name: "Generator", href: "/generator" },
  { name: "Features", href: "/features" },
  { name: "Docs", href: "/documentation" },
  { name: "Support", href: "/support" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Read the initial theme from the DOM set by the no-flash inline script.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("recqr-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

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
          <Link href="/" className="flex items-center space-x-2" aria-label="RECQR home">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-[var(--color-on-surface)]">RECQR</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)] transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/scanner" className="px-4 py-2 rounded-full text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">Scan</Link>
              <Link href="/generator" className="md-filled-button">Create</Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)]"
          >
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    pathname === item.href
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                      : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-highest)]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link href="/scanner" className="w-full md-outlined-button inline-flex justify-center">Scan QR</Link>
                <Link href="/generator" className="w-full md-filled-button inline-flex justify-center">Create QR</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
