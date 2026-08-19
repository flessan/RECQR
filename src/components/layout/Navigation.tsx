"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, QrCode, Sun, X } from "lucide-react";

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
    const onScroll = () => setIsScrolled(window.scrollY > 12);
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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`mx-auto flex w-full max-w-6xl items-center gap-2 rounded-full border-2 px-3 py-2 transition-all duration-300 sm:px-4 ${
          isScrolled
            ? "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]/92 backdrop-blur-xl shadow-[var(--ui-shadow-sm)]"
            : "border-transparent bg-[var(--color-surface-container-lowest)]/55 backdrop-blur-md"
        }`}
        aria-label="Main"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full pr-2"
          aria-label="RECQR home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-[var(--color-outline)] bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--ui-shadow-sm)]">
            <QrCode className="h-5 w-5" />
          </span>
          <span className="text-xl font-black tracking-tight text-[var(--color-on-surface)]">
            RECQR
          </span>
        </Link>

        <div className="mx-auto hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="ui-icon-btn h-10 w-10"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link href="/generator" className="ui-btn ui-btn-primary ui-btn-sm hidden sm:inline-flex">
            Create QR
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="ui-icon-btn h-10 w-10 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-3xl border-2 border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-3 shadow-[var(--ui-shadow)] lg:hidden"
          >
            <div className="grid gap-1">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                      active
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                        : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/scanner" className="ui-btn ui-btn-surface ui-btn-sm">
                Scan
              </Link>
              <Link href="/generator" className="ui-btn ui-btn-primary ui-btn-sm">
                Create
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
