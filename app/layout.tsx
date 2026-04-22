import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blind-dev-tools.com"),
  title: {
    default: "blind-dev-tools | Screen reader optimized development environment",
    template: "%s | blind-dev-tools",
  },
  description:
    "blind-dev-tools is a screen reader optimized development environment with semantic code navigation, intelligent audio feedback, and keyboard-first workflows for NVDA, JAWS, and VoiceOver.",
  keywords: [
    "accessible IDE",
    "screen reader developer tools",
    "NVDA coding",
    "JAWS coding",
    "VoiceOver programming",
    "blind developer tools",
  ],
  openGraph: {
    type: "website",
    title: "blind-dev-tools | Screen reader optimized development environment",
    description:
      "A web-based IDE designed for blind and visually impaired developers with fast keyboard workflows and real-time spoken diagnostics.",
    siteName: "blind-dev-tools",
    url: "https://blind-dev-tools.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "blind-dev-tools",
    description:
      "Screen reader optimized coding with semantic navigation and intelligent audio feedback.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
