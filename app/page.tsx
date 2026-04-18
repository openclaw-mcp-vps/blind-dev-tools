import Link from "next/link";
import LandingActions from "@/components/LandingActions";

const faqs = [
  {
    q: "How is this different from turning on screen reader mode in mainstream IDEs?",
    a: "Blind Dev Tools is built around screen reader-first navigation, not visual-first workflows with screen reader support added later. Every command is keyboard reachable, code structure is exposed semantically, and syntax issues are prioritized through spoken and tonal feedback.",
  },
  {
    q: "Will this work with NVDA, JAWS, and VoiceOver?",
    a: "Yes. The editor is tuned for high-quality ARIA announcements, predictable focus movement, and keyboard shortcuts that avoid conflicting key combinations used by those screen readers.",
  },
  {
    q: "What do teams get for paying?",
    a: "Teams get accessible onboarding for blind engineers, lower context-switching overhead, and a development environment that helps retain engineers who are often blocked by inaccessible tooling in traditional IDEs.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section>
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Accessibility Tools
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Screen reader optimized development environment
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Blind Dev Tools gives blind and visually impaired engineers a modern web IDE that is actually optimized for
            audio and keyboard workflows, not retrofitted for them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#0d1117] hover:bg-cyan-300"
            >
              Open Editor
            </Link>
            <a
              href="#pricing"
              className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
            >
              View Pricing
            </a>
          </div>
        </section>

        <LandingActions />
      </header>

      <section className="mt-14 grid gap-5 md:grid-cols-3" aria-labelledby="problem-heading">
        <div className="rounded-xl border border-white/10 bg-[#151b23] p-5">
          <h2 id="problem-heading" className="text-xl font-semibold text-white">
            The problem
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Blind developers lose hours to inaccessible navigation, silent syntax errors, and mouse-centric debugging
            flows in mainstream IDEs.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#151b23] p-5">
          <h2 className="text-xl font-semibold text-white">The solution</h2>
          <p className="mt-2 text-sm text-slate-300">
            Semantic code landmarks, real-time spoken diagnostics, and keyboard-only commands built for screen reader
            users from the start.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#151b23] p-5">
          <h2 className="text-xl font-semibold text-white">Who pays</h2>
          <p className="mt-2 text-sm text-slate-300">
            Individual engineers, bootcamp graduates, and accessibility-focused engineering managers building inclusive
            teams.
          </p>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-white/10 bg-[#151b23] p-6" aria-labelledby="feature-heading">
        <h2 id="feature-heading" className="text-2xl font-semibold text-white">
          Built for real development, not demos
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
            <h3 className="text-lg font-medium text-white">Semantic code navigation</h3>
            <p className="mt-2 text-sm text-slate-300">
              Jump through functions, classes, and interfaces in logical order with explicit spoken context.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
            <h3 className="text-lg font-medium text-white">Intelligent audio diagnostics</h3>
            <p className="mt-2 text-sm text-slate-300">
              Hear new syntax errors immediately, prioritize severity by tone, and jump directly to each issue.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
            <h3 className="text-lg font-medium text-white">Keyboard-first interaction model</h3>
            <p className="mt-2 text-sm text-slate-300">
              Every core action has deterministic key bindings that avoid common screen reader conflicts.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-[#0d1117] p-4">
            <h3 className="text-lg font-medium text-white">Team inclusion at scale</h3>
            <p className="mt-2 text-sm text-slate-300">
              Support blind engineers without forcing them to fight inaccessible workflows in critical production work.
            </p>
          </article>
        </div>
      </section>

      <section id="pricing" className="mt-14">
        <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/8 p-6">
          <h2 className="text-2xl font-semibold text-white">Simple pricing</h2>
          <p className="mt-2 text-slate-300">
            One plan with all accessibility features included. No feature gating inside the editor.
          </p>
          <p className="mt-4 text-4xl font-semibold text-cyan-200">
            $15<span className="text-xl text-slate-300">/month</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Includes continuous updates for NVDA, JAWS, and VoiceOver compatibility improvements.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-semibold text-white">
          FAQ
        </h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-xl border border-white/10 bg-[#151b23] p-4">
              <h3 className="text-base font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-300">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
