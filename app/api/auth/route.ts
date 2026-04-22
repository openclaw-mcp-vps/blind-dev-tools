import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_TTL_SECONDS,
  createAccessCookieValue,
  isCheckoutSessionPaid,
} from "@/lib/lemonsqueezy";

function addAccessCookie(response: NextResponse, sessionId: string) {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: createAccessCookieValue(sessionId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_TTL_SECONDS,
    path: "/",
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const sessionId = requestUrl.searchParams.get("session_id");
  const mode = requestUrl.searchParams.get("mode");

  if (!sessionId) {
    if (mode === "json") {
      return NextResponse.json(
        { ok: false, error: "Missing session_id query parameter." },
        { status: 400 }
      );
    }

    return NextResponse.redirect(new URL("/editor?unlock=pending", request.url));
  }

  const isPaid = await isCheckoutSessionPaid(sessionId);

  if (!isPaid) {
    if (mode === "json") {
      return NextResponse.json(
        { ok: false, error: "Checkout session is not marked paid yet." },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL("/editor?unlock=pending", request.url));
  }

  if (mode === "json") {
    const response = NextResponse.json({ ok: true, unlocked: true, sessionId });
    addAccessCookie(response, sessionId);
    return response;
  }

  const response = NextResponse.redirect(new URL("/editor?unlock=success", request.url));
  addAccessCookie(response, sessionId);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, signedOut: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
