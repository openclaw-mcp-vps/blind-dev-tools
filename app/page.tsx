import Link from "next/link";
import { ArrowRight, CheckCircle2, Headphones, Keyboard, Navigation, TriangleAlert } from "lucide-react";

import { CheckoutButton } from "@/components/CheckoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10">
      <header className="space-y-6 border-b border-[var(--border)] pb-14">
        <p className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm text-[var(--muted)]">
          accessibility-tools • Screen Reader First
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
          Screen reader optimized development environment for engineering teams that value output, not eyesight.
        </h1>
        <p className="max-w-3xl text-lg text-[var(--muted)]">
          Blind Dev Tools is a web-based IDE built for NVDA, JAWS, and VoiceOver with keyboard-first navigation, syntax
          announcements, and audio feedback that keeps you coding instead of wrestling inaccessible UI.
        </p>
        <div className="flex flex-wrap gap-4">
          <CheckoutButton />
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card)]"
          >
            Open Editor <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <section className="grid gap-6 py-14 md:grid-cols-3" aria-label="Core outcomes">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Navigation className="h-5 w-5 text-[var(--brand)]" aria-hidden />
              Fast Orientation
            </CardTitle>
            <CardDescription>Jump through syntax issues and landmarks without losing context.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Skip visual panels and navigate files, errors, and editor controls with predictable keyboard commands.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Headphones className="h-5 w-5 text-[var(--brand)]" aria-hidden />
              Intelligent Audio
            </CardTitle>
            <CardDescription>Hear syntax errors as they happen before they snowball into debugging sessions.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Audio tones and speech synthesis report severity, line position, and message details immediately.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Keyboard className="h-5 w-5 text-[var(--brand)]" aria-hidden />
              Keyboard-First Flow
            </CardTitle>
            <CardDescription>No mouse assumptions, no hidden hover menus, no inaccessible toolbars.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Every core action is available from the keyboard with clear announcements and repeatable workflows.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 border-y border-[var(--border)] py-14" aria-label="Problem and solution">
        <h2 className="text-3xl font-semibold">Why this matters</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TriangleAlert className="h-5 w-5 text-[var(--warning)]" aria-hidden />
                Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[var(--muted)]">
              <p>
                Blind developers regularly spend hours interpreting inaccessible IDE controls, visual-only diagnostics, and
                mouse-centric workflows.
              </p>
              <p>
                Bootcamp graduates with vision impairments often leave software careers because basic tooling creates
                constant friction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
                Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[var(--muted)]">
              <p>
                Blind Dev Tools ships a focused coding workspace where spoken announcements, audio cues, and semantic
                structure are built in from day one.
              </p>
              <p>
                Teams get a practical way to onboard and retain blind engineers while improving accessibility maturity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-14" aria-label="Pricing">
        <Card className="mx-auto max-w-2xl border-[var(--brand)]">
          <CardHeader>
            <CardTitle className="text-center text-3xl">$15 per month</CardTitle>
            <CardDescription className="text-center text-base">
              Built for blind and visually impaired developers who need tooling that keeps pace with real production work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--muted)]">
            <p>Includes screen-reader optimized editor, keyboard command palette, syntax audio feedback, and webhook-based access control.</p>
            <p>Available for individual engineers, accessibility champions, and engineering managers building inclusive teams.</p>
            <div className="flex justify-center">
              <CheckoutButton label="Unlock Full Workspace" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 pb-10" aria-label="FAQ">
        <h2 className="text-3xl font-semibold">FAQ</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Does this work with NVDA, JAWS, and VoiceOver?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--muted)]">
              Yes. The workspace uses semantic HTML regions, assertive ARIA live announcements, and keyboard-first
              controls tuned for all three screen readers.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does payment unlock access?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--muted)]">
              Lemon Squeezy sends a webhook after purchase. We match a secure session identifier and unlock the editor by
              cookie so paid users can open the workspace immediately.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can engineering managers buy licenses for teams?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--muted)]">
              Yes. You can provision checkout links per engineer and route webhook events into internal onboarding
              workflows.
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
