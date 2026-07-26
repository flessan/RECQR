import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Native app safe-areas
};

export const metadata: Metadata = {
  title: {
    default: "RECQR | Next-Gen QR Scanner & Generator",
    template: "%s | RECQR",
  },
  description:
    "The fastest way to scan, generate, and decode QR codes instantly on the edge. Built with modern web tech, Cloudflare Workers, and native-app level performance.",
  keywords: ["QR code", "scanner", "generator", "PWA", "Cloudflare Workers", "React", "Next.js"],
  applicationName: "RECQR",
  authors: [{ name: "Flessan" }],
  generator: "Next.js",
  creator: "RECQR Team",
  publisher: "RECQR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RECQR",
  },
  openGraph: {
    type: "website",
    siteName: "RECQR",
    title: "RECQR - The Ultimate QR Platform",
    description: "Scan, decode, and generate QR codes instantly on the edge. Zero installs required.",
    url: "https://flessan.github.io/RECQR",
  },
  twitter: {
    card: "summary_large_image",
    title: "RECQR - The Ultimate QR Platform",
    description: "Scan, decode, and generate QR codes instantly on the edge. Zero installs required.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='5' height='5' x='3' y='3' rx='1'/><rect width='5' height='5' x='16' y='3' rx='1'/><rect width='5' height='5' x='3' y='16' rx='1'/><path d='M21 16h-3a2 2 0 0 0-2 2v3'/><path d='M21 21v.01'/><path d='M12 7v3a2 2 0 0 1-2 2H7'/><path d='M3 12h.01'/><path d='M12 3h.01'/><path d='M12 16v.01'/><path d='M16 12h1'/><path d='M21 12v.01'/><path d='M12 21v-1'/></svg>"
        />
        {/* JSON-LD for Super SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "RECQR",
              url: "https://flessan.github.io/RECQR",
              description: "The fastest way to scan, generate, and decode QR codes instantly.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              }
            })
          }}
        />
      </head>
      {/* We apply overscroll-none and select-none to give it that strict native feel, 
          but allow text selection on explicit prose classes if needed */}
      <body className="antialiased min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-primary)] selection:text-white overscroll-none">
        <div className="relative flex flex-col min-h-screen supports-[min-height:100dvh]:min-h-[100dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
