import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionMaxAge, createAdminSession, credentialsAreValid, isAdminLoginConfigured } from "../../../lib/admin-auth";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!isAdminLoginConfigured()) {
    return NextResponse.json({ error: "Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET to your environment." }, { status: 503 });
  }

  if (typeof email !== "string" || typeof password !== "string" || !credentialsAreValid(email, password)) {
    return NextResponse.json({ error: "Incorrect admin email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(email.trim().toLowerCase()), { httpOnly: true, maxAge: adminSessionMaxAge, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  return response;
}
