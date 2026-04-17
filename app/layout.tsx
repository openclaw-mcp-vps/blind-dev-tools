import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blind-dev-tools.com"),
  title: "Blind Dev Tools | Screen Reader Optimized Development Environment",
  description:
    "A screen reader optimized development environment with intelligent audio syntax feedback, precise keyboard navigation, and workflows that work with NVDA, JAWS, and VoiceOver.",
  openGraph: {
    title: "Blind Dev Tools",
    description:
      "Screen reader optimized coding with audio syntax feedback, keyboard-first controls, and practical workflows for blind developers.",
    type: "website",
    url: "https://blind-dev-tools.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[var(--foreground)] antialiased">
        {children}
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
