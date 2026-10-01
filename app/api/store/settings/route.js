import { NextResponse } from "next/server";
import { getStorefrontRevision } from "../../../lib/storefront-revision";

export async function GET() {
  const revision = await getStorefrontRevision();
  return NextResponse.json({ revision }, { headers: { "Cache-Control": "no-store" } });
}
