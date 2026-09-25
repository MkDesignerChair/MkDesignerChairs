import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyShiprocketTrackingEvent } from "../../../../actions/order-store";

function validSecret(received, expected) {
  const receivedBuffer = Buffer.from(received || "");
  const expectedBuffer = Buffer.from(expected || "");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  if (!validSecret(request.headers.get("x-api-key"), secret)) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const order = await applyShiprocketTrackingEvent(payload);
    return NextResponse.json({ received: true, matchedOrder: Boolean(order) });
  } catch (error) {
    console.error("Shiprocket tracking webhook failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
