import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "mk_chairs_admin_session_v2";
export const LEGACY_ADMIN_SESSION_COOKIE = "mk_chairs_admin_session";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.OTP_SECRET || "";
}

function sign(payload) {
  return createHmac("sha256", getAdminSecret()).update(payload).digest("hex");
}

function signaturesMatch(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminLoginConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && getAdminSecret());
}

export function credentialsAreValid(email, password) {
  if (!isAdminLoginConfigured()) return false;

  return email.trim().toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD;
}

export function createAdminSession(email) {
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export async function isAdminAuthenticated() {
  if (!isAdminLoginConfigured()) return false;

  const cookieValue = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;

  const separator = cookieValue.lastIndexOf(".");
  if (separator === -1) return false;

  const payload = cookieValue.slice(0, separator);
  const signature = cookieValue.slice(separator + 1);
  if (!signaturesMatch(signature, sign(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.email === process.env.ADMIN_EMAIL.toLowerCase() && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const adminSessionMaxAge = SESSION_MAX_AGE_SECONDS;
