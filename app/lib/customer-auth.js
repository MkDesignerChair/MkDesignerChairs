import { createHmac, timingSafeEqual } from "node:crypto";

export const CUSTOMER_SESSION_COOKIE = "mk_designer_chairs_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function signaturesMatch(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createCustomerSession(email, name) {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET is not configured.");

  const payload = JSON.stringify({ email, name, expiresAt: Date.now() + SESSION_MAX_AGE_MS });
  const signedPayload = `${payload}.${sign(payload, secret)}`;
  return Buffer.from(signedPayload).toString("base64url");
}

export function getCustomerSession(value) {
  const secret = process.env.OTP_SECRET;
  if (!secret || !value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf(".");
    if (separator === -1) return null;

    const payload = decoded.slice(0, separator);
    const signature = decoded.slice(separator + 1);
    if (!signaturesMatch(signature, sign(payload, secret))) return null;

    const session = JSON.parse(payload);
    if (typeof session.email !== "string" || typeof session.name !== "string" || !/^\S+@\S+\.\S+$/.test(session.email) || !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()) return null;
    return { email: session.email, name: session.name };
  } catch {
    return null;
  }
}
