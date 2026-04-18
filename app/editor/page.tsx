import Link from "next/link";
import { cookies } from "next/headers";
import AccessibleEditor from "@/components/AccessibleEditor";
import UnlockForm from "@/components/UnlockForm";
import { verifyAccessToken } from "@/lib/lemonsqueezy";

export const metadata = {
  title: "Editor",
  description: "Screen reader optimized coding workspace",
};

export default async function EditorPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("bdt_access")?.value ?? "";
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "development-secret";
  const access = verifyAccessToken(accessCookie, secret);

  if (!access.valid) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-[#151b23] p-6">
          <h1 className="text-2xl font-semibold text-white">Editor access is locked</h1>
          <p className="mt-2 text-sm text-slate-300">
            The workspace is available after purchase. Complete checkout, then unlock access with your billing email.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/"
              className="inline-flex rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
            >
              Back to pricing
            </Link>
            <UnlockForm className="rounded-xl border border-white/10 bg-[#0d1117] p-4" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <header className="mb-4 rounded-xl border border-white/10 bg-[#151b23] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Active Subscription</p>
        <h1 className="mt-1 text-xl font-semibold text-white">Blind Dev Tools Editor</h1>
        <p className="mt-1 text-sm text-slate-300">Signed in as {access.email}</p>
      </header>
      <AccessibleEditor />
    </main>
  );
}
