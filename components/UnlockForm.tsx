"use client";

import { FormEvent, useState } from "react";

interface UnlockFormProps {
  buttonText?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function UnlockForm({
  buttonText = "Unlock Workspace",
  title = "Already purchased?",
  description = "Enter the billing email from your Lemon Squeezy order to unlock your editor cookie.",
  className,
}: UnlockFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? "Unable to unlock access.");
        setLoading(false);
        return;
      }

      setMessage("Access granted. Redirecting to the editor.");
      window.location.href = "/editor";
    } catch {
      setMessage("Network error while verifying purchase.");
      setLoading(false);
    }
  }

  return (
    <section className={className} aria-live="polite">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <label htmlFor="unlock-email" className="sr-only">
          Billing email
        </label>
        <input
          id="unlock-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@company.com"
          className="w-full rounded-md border border-white/15 bg-[#0d1117] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-[#0b1020] transition hover:bg-cyan-400 disabled:opacity-70"
        >
          {loading ? "Verifying..." : buttonText}
        </button>
      </form>
      {message ? <p className="mt-2 text-sm text-slate-200">{message}</p> : null}
    </section>
  );
}
