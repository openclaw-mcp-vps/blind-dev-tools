import type { Metadata } from "next";
import "@/app/globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://blind-dev-tools.com"),
  title: {
    default: "Blind Dev Tools | Screen Reader Optimized Development Environment",
    template: "%s | Blind Dev Tools",
  },
  description:
    "Blind Dev Tools is a screen reader optimized IDE for NVDA, JAWS, and VoiceOver with intelligent audio syntax feedback and keyboard-first navigation.",
  keywords: [
    "accessible IDE",
    "screen reader development tools",
    "blind developers",
    "NVDA coding",
    "JAWS IDE",
    "VoiceOver programming",
    "accessible engineering tools",
  ],
  openGraph: {
    type: "website",
    url: "https://blind-dev-tools.com",
    title: "Blind Dev Tools",
    description:
      "A screen reader optimized coding environment with semantic navigation, spoken syntax diagnostics, and keyboard-first workflows.",
    siteName: "Blind Dev Tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blind Dev Tools",
    description:
      "Screen reader optimized development environment with semantic navigation and intelligent audio feedback.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="bg-[#0d1117] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
