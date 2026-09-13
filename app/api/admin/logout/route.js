import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "../../../lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { expires: new Date(0), path: "/" });

  return response;
}
