import { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE } from "../../../lib/customer-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { expires: new Date(0), httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
