import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAccessToken, findPurchaseByEmail, verifyAccessToken } from "@/lib/lemonsqueezy";

const payloadSchema = z.object({
  email: z.string().email(),
});

const COOKIE_NAME = "bdt_access";

function resolveSecret() {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "development-secret";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const purchase = await findPurchaseByEmail(parsed.data.email);
    if (!purchase?.paid) {
      return NextResponse.json(
        { error: "No paid subscription found for this email. Complete checkout first." },
        { status: 403 },
      );
    }

    const token = createAccessToken(purchase.email, resolveSecret(), 30);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to verify access." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value ?? "";
  const result = verifyAccessToken(token, resolveSecret());
  return NextResponse.json({ authenticated: result.valid, email: result.email ?? null });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
