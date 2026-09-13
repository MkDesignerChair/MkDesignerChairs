import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const OTP_COOKIE = "mk_designer_chairs_otp";

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function matches(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request) {
  const { code, email } = await request.json();
  const secret = process.env.OTP_SECRET;
  const cookieValue = request.cookies.get(OTP_COOKIE)?.value;

  if (!secret || !cookieValue || typeof code !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Request a new verification code and try again." }, { status: 400 });
  }

  const decoded = Buffer.from(cookieValue, "base64url").toString("utf8");
  const separator = decoded.lastIndexOf(".");

  if (separator === -1) {
    return NextResponse.json({ error: "Verification code is invalid." }, { status: 400 });
  }

  const payload = decoded.slice(0, separator);
  const signature = decoded.slice(separator + 1);

  if (!matches(signature, sign(payload, secret))) {
    return NextResponse.json({ error: "Verification code is invalid." }, { status: 400 });
  }

  const verification = JSON.parse(payload);
  const normalizedEmail = email.trim().toLowerCase();
  const hash = createHash("sha256").update(code).digest("hex");

  if (verification.email !== normalizedEmail || verification.expiresAt < Date.now() || !matches(verification.hash, hash)) {
    return NextResponse.json({ error: "The code is incorrect or has expired." }, { status: 400 });
  }

  const sessionPayload = JSON.stringify({ email: normalizedEmail, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const sessionValue = Buffer.from(`${sessionPayload}.${sign(sessionPayload, secret)}`).toString("base64url");
  const response = NextResponse.json({ message: "You are signed in." });
  response.cookies.set(OTP_COOKIE, "", { expires: new Date(0), path: "/" });
  response.cookies.set("mk_designer_chairs_session", sessionValue, { httpOnly: true, maxAge: 7 * 24 * 60 * 60, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  return response;
}
