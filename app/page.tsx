"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  AudioLines,
  Keyboard,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const problems = [
  {
    title: "Visual-first editors hide code structure",
    detail:
      "Critical actions are buried in icon-heavy panels and mouse-first gestures that screen readers announce poorly or too late.",
  },
  {
    title: "Error feedback is delayed and fragmented",
    detail:
      "Blind developers often discover syntax issues after full builds instead of getting immediate, spoken diagnostics while typing.",
  },
  {
    title: "Keyboard workflows are inconsistent",
    detail:
      "Common shortcuts conflict with assistive tech, forcing developers to memorize brittle workarounds for every project and platform.",
  },
];

const solutions = [
  {
    icon: Navigation,
    title: "Semantic Code Navigation",
    detail:
      "Jump by function, class, export, and interface using a screen-reader-optimized symbol navigator with line-precise announcements.",
  },
  {
    icon: AudioLines,
    title: "Intelligent Audio Diagnostics",
    detail:
      "Hear high-priority errors in real time, with severity-aware tones and concise speech summaries tuned for coding flow.",
  },
  {
    icon: Keyboard,
    title: "Assistive-Tech Safe Shortcuts",
    detail:
      "Keyboard-first command sets designed to avoid collisions with NVDA, JAWS, and VoiceOver defaults.",
  },
  {
    icon: ShieldCheck,
    title: "Paywalled Pro Workspace",
    detail:
      "Hosted and maintained tooling with a simple subscription model, so teams can onboard blind engineers quickly.",
  },
];

const faqs = [
  {
    question: "How does access unlock after payment?",
    answer:
      "Set your Stripe Payment Link success redirect to /api/auth?session_id={CHECKOUT_SESSION_ID}. After checkout, we verify the session from your webhook event and set an HttpOnly access cookie for the editor.",
  },
  {
    question: "Which screen readers are supported?",
    answer:
      "blind-dev-tools is designed for NVDA, JAWS, and VoiceOver. The keyboard model and spoken feedback are intentionally consistent across all three.",
  },
  {
    question: "Does this replace my local IDE?",
    answer:
      "It is purpose-built for focused coding sessions where accessibility speed matters most. Many developers keep their existing stack and use blind-dev-tools for high-intensity implementation and debugging.",
  },
  {
    question: "Can engineering managers buy this for their teams?",
    answer:
      "Yes. Accessibility-focused engineering managers can standardize workflows for blind contributors with a low monthly cost and immediate onboarding.",
  },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

export default function Home() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-5 py-8 md:px-8 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/80 px-4 py-3 backdrop-blur md:px-5">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/20 px-2 py-1 font-mono text-xs text-primary">
            blind-dev-tools
          </span>
          <Badge variant="secondary">Accessibility Tools</Badge>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <a href="#problem" className="hover:text-foreground">
            Problem
          </a>
          <a href="#solution" className="hover:text-foreground">
            Solution
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
      </header>

      <motion.section
        {...reveal}
        className="relative overflow-hidden rounded-3xl border border-primary/35 bg-gradient-to-br from-[#101923] via-[#0d1117] to-[#101923] p-6 md:p-10"
      >
        <div className="absolute -top-16 right-0 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge>Screen Reader Optimized Development Environment</Badge>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-5xl">
            Code faster without fighting the interface.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            blind-dev-tools is a web IDE tuned for blind and visually impaired
            developers. Navigate code semantically, hear syntax feedback instantly,
            and stay in flow with keyboard commands built to coexist with NVDA,
            JAWS, and VoiceOver.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={paymentLink}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Start for $15/month
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Open paywalled editor
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            For instant unlocks, configure your Stripe success redirect to
            <code className="ml-1 rounded bg-black/30 px-1 py-0.5 text-xs">
              /api/auth?session_id={"{CHECKOUT_SESSION_ID}"}
            </code>
            .
          </p>
        </div>
      </motion.section>

      <motion.section {...reveal} id="problem" className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          The Problem We Solve
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          Blind developers lose hours each week compensating for visual IDE
          assumptions. That friction blocks careers, slows teams, and hides a large,
          underutilized engineering talent pool.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="border-border/80 bg-card/90">
              <CardHeader>
                <CardTitle>{problem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{problem.detail}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} id="solution" className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Built For Accessible Engineering Velocity
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {solutions.map(({ icon: Icon, title, detail }) => (
            <Card key={title} className="border-border/80 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{detail}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} id="pricing" className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Pricing
        </h2>
        <Card className="border-primary/35 bg-gradient-to-br from-card to-[#121a24]">
          <CardHeader>
            <CardTitle className="text-2xl">Pro Accessibility Workspace</CardTitle>
            <CardDescription>
              Complete access to the paywalled editor, semantic navigation,
              real-time audio diagnostics, and keyboard command layers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-4xl font-semibold">
              $15
              <span className="text-base font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Monaco-based editor with screen-reader-aware defaults</li>
              <li>Spoken and tonal feedback for syntax and compile issues</li>
              <li>Function/class/export symbol navigator with line jump support</li>
              <li>Workflow designed for individual engineers and inclusive teams</li>
            </ul>
            <a
              href={paymentLink}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Subscribe via Stripe Checkout
            </a>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section {...reveal} id="faq" className="space-y-5 pb-8">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">FAQ</h2>
        <Card className="border-border/80 bg-card/90">
          <CardContent className="pt-4">
            <Accordion defaultValue={[faqs[0].question]}>
              {faqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
}
