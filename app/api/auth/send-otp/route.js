import { createHash, createHmac, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { getCustomerByEmail } from "../../../../actions/customer-store";

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
  const { email, name } = await request.json();
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (normalizedName && normalizedName.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 });
  }

  const existingCustomer = await getCustomerByEmail(normalizedEmail);
  if (!normalizedName && !existingCustomer) {
    return NextResponse.json({ error: "User does not exist. Please create an account first." }, { status: 404 });
  }
  if (!normalizedName && existingCustomer.status !== "active") {
    return NextResponse.json({ error: "This account is unavailable. Contact support for help." }, { status: 403 });
  }
  if (normalizedName && existingCustomer) {
    return NextResponse.json({ error: "An account already exists for this email. Please sign in instead." }, { status: 409 });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const brevoSenderName = process.env.BREVO_SENDER_NAME;

  if (!brevoApiKey || !brevoSenderEmail || !brevoSenderName || !process.env.OTP_SECRET) {
    return NextResponse.json({ error: "Email OTP delivery is not configured. Add the Brevo and OTP variables to your environment." }, { status: 503 });
  }

  const code = String(randomInt(100000, 1000000));
  const expiresAt = Date.now() + OTP_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({ email: normalizedEmail, name: normalizedName, expiresAt, hash: createHash("sha256").update(code).digest("hex") });
  const value = Buffer.from(`${payload}.${sign(payload, getOtpSecret())}`).toString("base64url");
  const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: brevoSenderEmail,
        name: brevoSenderName,
      },
      to: [
        {
          email: normalizedEmail,
          ...(normalizedName ? { name: normalizedName } : {}),
        },
      ],
      subject: "Your MK Designer Chairs sign-in code",
      textContent: `Your verification code is ${code}. It expires in 10 minutes.`,
      htmlContent: `<p>Use this verification code to continue with MK Designer Chairs:</p><p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${code}</p><p>This code expires in 10 minutes.</p>`,
    }),
  });

  if (!emailResponse.ok) {
    const details = await emailResponse.text();
    const providerError = (() => {
      try {
        return JSON.parse(details);
      } catch {
        return null;
      }
    })();
    const smtpActivationRequired =
      emailResponse.status === 403 &&
      providerError?.code === "permission_denied" &&
      /SMTP account is not yet activated/i.test(providerError?.message ?? "");

    console.error("Brevo verification email send failed.", {
      status: emailResponse.status,
      details,
    });

    return NextResponse.json(
      {
        error:
          smtpActivationRequired
            ? "Email delivery is awaiting Brevo SMTP activation. Activate transactional email in Brevo, then try again."
            : emailResponse.status === 429
            ? "Too many verification email requests. Please wait a moment and try again."
            : "Unable to send verification email. Confirm your Brevo API key and verified sender details.",
      },
      { status: smtpActivationRequired ? 503 : emailResponse.status === 429 ? 429 : 502 },
    );
  }

  const response = NextResponse.json({ message: "Verification code sent." });
  response.cookies.set(OTP_COOKIE, value, { httpOnly: true, maxAge: OTP_MAX_AGE_SECONDS, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  return response;
}
