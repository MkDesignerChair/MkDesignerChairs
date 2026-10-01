import { NextResponse } from "next/server";
import { priceCart, CheckoutError } from "../../../lib/checkout";
import { getSiteContent } from "../../../../actions/site-content";

export async function POST(request) {
  try {
    const { items } = await request.json();
    const [{ subtotal, shippingCost, totalAmount }, { settings }] = await Promise.all([priceCart(items), getSiteContent()]);
    return NextResponse.json({ subtotal, shippingCost, totalAmount, estimatedDeliveryTime: settings.estimatedDeliveryTime }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to calculate total." }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
