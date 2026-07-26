import Link from "next/link";
import { QrCode } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Documentation", href: "/documentation" },
        { name: "API", href: "/api" },
        { name: "Pricing", href: "https://placehold.co/600x400?text=There%27s+No+Pricing!+It%27s%20FREE!", external: true },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Support", href: "/support" },
        { name: "FAQ", href: "/support#faq" },
        { name: "Changelog", href: "https://github.com/flessan/RECQR/commits/main/", external: true },
        { name: "Status", href: "https://www.isitdownrightnow.com/flessan.github.io.html", external: true },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "https://www.termsfeed.com/live/3077ef18-a403-4631-a676-5707224e959b", external: true },
        { name: "Terms of Service", href: "https://www.termsfeed.com/live/41b2a89e-6250-4238-9653-c7a4f397d22a", external: true },
        { name: "License", href: "https://choosealicense.com/licenses/mit/", external: true },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "GitHub", href: "https://github.com/flessan/recqr", external: true },
        // { name: "Discord", href: "https://discord.com", external: true },
        // { name: "Twitter", href: "https://twitter.com", external: true },
        { name: "Donate", href: "/donate" },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-[var(--color-on-surface)]">
                RECQR
              </span>
            </Link>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              Modern QR code platform for scanning, generating, and managing QR codes with developer-friendly APIs.
            </p>
            <div className="flex space-x-2">
              <a
                href="https://github.com/flessan/recqr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[var(--color-surface-container)] hover:bg-[var(--color-surface-container-high)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--color-on-surface-variant)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-outline-variant)]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              © {currentYear} RECQR. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-[var(--color-on-surface-variant)]">
              <span>Version 1.5.0</span>
              <span>•</span>
              <Link href="https://www.termsfeed.com/live/3077ef18-a403-4631-a676-5707224e959b" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">
                Privacy
              </Link>
              <span>•</span>
              <Link href="https://www.termsfeed.com/live/41b2a89e-6250-4238-9653-c7a4f397d22a" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
