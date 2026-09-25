import { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "../../../lib/customer-auth";

export async function GET(request) {
  const session = getCustomerSession(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  return NextResponse.json({ user: session }, { headers: { "Cache-Control": "no-store" } });
}
