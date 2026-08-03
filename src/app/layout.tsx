import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KidSafe Food Analyzer",
    template: "%s · KidSafe",
  },
  description:
    "Instant, evidence-based ingredient analysis for parents. Check whether packaged foods are safe for your kids.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#131110" },
  ],
};

const navLinks = [
  { href: "/", label: "Browse" },
  { href: "/analyze", label: "Analyze" },
  { href: "/compare", label: "Compare" },
  { href: "/saved", label: "Saved" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
              <span aria-hidden className="text-xl">🥕</span>
              <span className="hidden min-[420px]:inline">
                KidSafe <span className="hidden text-muted font-normal md:inline">Food Analyzer</span>
              </span>
            </Link>
            <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-2.5 py-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-foreground sm:px-3"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          Ingredient analysis is informational, not medical advice. Grounded in FDA labeling
          guidance and AAP/AHA recommendations.
        </footer>
      </body>
    </html>
  );
}
