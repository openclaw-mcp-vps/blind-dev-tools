import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ScreenReaderOptimizedUI from "@/components/ScreenReaderOptimizedUI";
import { ACCESS_COOKIE_NAME, verifyAccessCookieValue } from "@/lib/lemonsqueezy";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Paywalled screen-reader optimized coding workspace with semantic navigation and audio diagnostics.",
};

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ unlock?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const paidSessionId = verifyAccessCookieValue(accessToken);
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!paidSessionId) {
    const pendingUnlock = params.unlock === "pending";

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-10 md:px-8">
        <Card className="border-border/80 bg-card/95">
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              Paywall Active
            </Badge>
            <CardTitle className="text-2xl">Workspace Access Required</CardTitle>
            <CardDescription>
              The editor is available to active subscribers. Complete checkout,
              then return through your Stripe success URL to set the secure access
              cookie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Configure Stripe Payment Link success redirect to:
              <code className="ml-1 rounded bg-black/30 px-1 py-0.5 text-xs text-foreground">
                /api/auth?session_id={"{CHECKOUT_SESSION_ID}"}
              </code>
            </p>
            {pendingUnlock ? (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
                We could not verify your checkout session yet. Confirm your webhook
                is forwarding completed events, then open the success URL again.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <a
                href={paymentLink}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Subscribe for $15/month
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 font-semibold transition-colors hover:bg-accent"
              >
                Back to landing page
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <ScreenReaderOptimizedUI accessSessionId={paidSessionId} />;
}
