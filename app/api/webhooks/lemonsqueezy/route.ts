import { NextRequest, NextResponse } from "next/server";
import { upsertPurchaseFromWebhook, verifyWebhookSignature } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("x-signature") ?? "";
  const rawBody = await request.text();

  if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const record = await upsertPurchaseFromWebhook(payload);

    return NextResponse.json({ ok: true, stored: Boolean(record) });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
