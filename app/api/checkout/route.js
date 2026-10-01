import { NextResponse } from "next/server";
import { savePendingOrder } from "../../../actions/order-store";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "../../lib/customer-auth";
import { CheckoutError, createCheckoutToken, newOrderNumber, priceCart, razorpayRequest, validateDeliveryRegion, validatePaymentSettings, validateShipping } from "../../lib/checkout";
import { getSiteContent } from "../../../actions/site-content";

export async function POST(request) {
  const user = getCustomerSession(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Sign in to continue checkout." }, { status: 401 });

  try {
    const { items, shipping } = await request.json();
    const address = validateShipping(shipping);
    const { settings } = await getSiteContent();
    validateDeliveryRegion(settings.deliveryRegions, address.postalCode);
    const priced = await priceCart(items);
    const keyId = validatePaymentSettings(settings);
    const orderNumber = newOrderNumber(settings.orderPrefix);
    const razorpayOrder = await razorpayRequest("orders", {
      method: "POST",
      body: JSON.stringify({ amount: priced.totalAmount * 100, currency: "INR", receipt: orderNumber }),
    });
    if (!razorpayOrder.id || razorpayOrder.amount !== priced.totalAmount * 100 || razorpayOrder.currency !== "INR") {
      throw new CheckoutError("Razorpay returned an unexpected order. Please try again.", 502);
    }
    const now = new Date().toISOString();
    await savePendingOrder({
      id: orderNumber,
      orderNumber,
      customer: { ...user, phone: address.phone },
      items: priced.items.map(({ image, name, quantity, unitPrice }) => ({ image, name, quantity, unitPrice })),
      subtotal: priced.subtotal,
      shippingCost: priced.shippingCost,
      totalAmount: priced.totalAmount,
      createdAt: now,
      payment: { method: "Online Payment (Razorpay)", status: "Pending", transactionId: "", razorpayOrderId: razorpayOrder.id },
      status: "placed",
      timeline: { placed: now },
      shipping: { ...address, courier: "Not assigned", trackingNumber: "Not assigned", estimatedDeliveryDate: settings.estimatedDeliveryTime },
      policies: { cancellationWindowHours: settings.cancellationWindowDays, returnWindowDays: settings.returnWindowDays, refundConfiguration: settings.refundConfiguration, workflow: settings.orderWorkflow },
      statusUpdatedAt: now,
    });
    const token = createCheckoutToken({ ...priced, shipping: address, customer: user, orderNumber, razorpayOrderId: razorpayOrder.id });
    return NextResponse.json({ keyId, orderId: razorpayOrder.id, amount: razorpayOrder.amount, token, subtotal: priced.subtotal, shippingCost: priced.shippingCost, totalAmount: priced.totalAmount }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment." }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
