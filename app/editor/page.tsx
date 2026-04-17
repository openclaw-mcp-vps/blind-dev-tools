import Link from "next/link";
import { cookies } from "next/headers";

import { AccessibleEditor } from "@/components/AccessibleEditor";
import { CheckoutButton } from "@/components/CheckoutButton";
import { hasPaidAccess } from "@/lib/access-store";

export default async function EditorPage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("bdt_access")?.value;
  const sessionId = cookieStore.get("bdt_session")?.value;
  const paid = accessCookie === "paid" || (await hasPaidAccess(sessionId));

  if (!paid) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-semibold">Editor locked behind active subscription</h1>
        <p className="max-w-2xl text-[var(--muted)]">
          This coding workspace is available to paying users so we can fund ongoing accessibility improvements and
          maintain compatibility with NVDA, JAWS, and VoiceOver updates.
        </p>
        <CheckoutButton label="Subscribe for $15/month" />
        <Link href="/" className="text-sm text-[var(--muted)] underline underline-offset-4">
          Back to landing page
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <AccessibleEditor />
    </main>
  );
}
