import { NextResponse } from "next/server";
import {
  recordSuccessfulSessionFromStripeEvent,
  verifyStripeWebhookSignature,
} from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  let event: unknown;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Webhook payload is not valid JSON." },
      { status: 400 }
    );
  }

  const result = await recordSuccessfulSessionFromStripeEvent(event);

  if (!result) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  return NextResponse.json({
    ok: true,
    recorded: true,
    sessionId: result.sessionId,
    email: result.customerEmail ?? null,
  });
}
