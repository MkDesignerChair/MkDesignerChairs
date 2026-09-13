import { createHash, createHmac, randomInt } from "node:crypto";
import { NextResponse } from "next/server";

const OTP_COOKIE = "mk_designer_chairs_otp";
const OTP_MAX_AGE_SECONDS = 10 * 60;

function getOtpSecret() {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured.");
  }

  return secret;
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function POST(request) {
  const { email } = await request.json();
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.OTP_SECRET) {
    return NextResponse.json({ error: "Email OTP delivery is not configured. Add the Resend and OTP variables to your environment." }, { status: 503 });
  }

  const code = String(randomInt(100000, 1000000));
  const expiresAt = Date.now() + OTP_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({ email: normalizedEmail, expiresAt, hash: createHash("sha256").update(code).digest("hex") });
  const value = Buffer.from(`${payload}.${sign(payload, getOtpSecret())}`).toString("base64url");
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [normalizedEmail],
      subject: "Your MK Designer Chairs sign-in code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!emailResponse.ok) {
    const details = await emailResponse.text();

    return NextResponse.json({ error: `Unable to send the verification email: ${details}` }, { status: emailResponse.status });
  }

  const response = NextResponse.json({ message: "Verification code sent." });
  response.cookies.set(OTP_COOKIE, value, { httpOnly: true, maxAge: OTP_MAX_AGE_SECONDS, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  return response;
}
