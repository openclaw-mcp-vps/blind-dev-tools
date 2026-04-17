import { NextResponse } from "next/server";

import { addPaidSession } from "@/lib/access-store";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy-server";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      session_id?: string;
    };
  };
  data?: {
    attributes?: {
      custom_data?: {
        session_id?: string;
      };
      first_order_item?: {
        product_id?: number;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as LemonWebhookPayload;
  const eventName = payload.meta?.event_name;

  if (eventName !== "order_created" && eventName !== "subscription_created") {
    return NextResponse.json({ received: true });
  }

  const configuredProduct = Number(process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID ?? "0");
  const productId = payload.data?.attributes?.first_order_item?.product_id;

  if (configuredProduct && productId && configuredProduct !== productId) {
    return NextResponse.json({ received: true });
  }

  const sessionId = payload.meta?.custom_data?.session_id ?? payload.data?.attributes?.custom_data?.session_id;

  if (sessionId) {
    await addPaidSession(sessionId);
  }

  return NextResponse.json({ received: true });
}
