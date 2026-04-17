import { NextResponse } from "next/server";

import { hasPaidAccess } from "@/lib/access-store";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionId = cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith("bdt_session="))
    ?.split("=")[1];

  const access = await hasPaidAccess(sessionId);
  const response = NextResponse.json({ access });

  if (access) {
    response.cookies.set("bdt_access", "paid", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
