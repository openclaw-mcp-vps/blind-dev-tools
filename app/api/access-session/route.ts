import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const current = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith("bdt_session="))
    ?.split("=")[1];

  const sessionId = current || randomUUID();
  const response = NextResponse.json({ sessionId });

  if (!current) {
    response.cookies.set("bdt_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
