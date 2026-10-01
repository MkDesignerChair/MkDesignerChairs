import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { savePaidOrder } from "../../../../actions/order-store";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession } from "../../../lib/customer-auth";
import { CheckoutError, razorpayConfiguration, razorpayRequest, readCheckoutToken, safeEqual } from "../../../lib/checkout";
import { getSiteContent } from "../../../../actions/site-content";

export async function POST(request) {
  const user = getCustomerSession(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Sign in to verify payment." }, { status: 401 });

  try {
    const { token, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();
    const order = readCheckoutToken(token);
    if (order.customer.email !== user.email || order.razorpayOrderId !== razorpay_order_id || !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id || "")) {
      throw new CheckoutError("Payment does not match this checkout session.");
    }
    const { keySecret } = razorpayConfiguration();
    const signature = createHmac("sha256", keySecret).update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest("hex");
    if (!safeEqual(signature, razorpay_signature)) throw new CheckoutError("Payment signature is invalid.");

    const payment = await razorpayRequest(`payments/${encodeURIComponent(razorpay_payment_id)}`);
    if (payment.order_id !== order.razorpayOrderId || payment.amount !== order.totalAmount * 100 || payment.currency !== "INR" || payment.status !== "captured") {
      throw new CheckoutError("Payment has not been captured for this order. Please contact support if your account was charged.");
    }

    const now = new Date().toISOString();
    const { settings } = await getSiteContent();
    const saved = await savePaidOrder({
      id: order.orderNumber,
      orderNumber: order.orderNumber,
      customer: { ...order.customer, phone: order.shipping.phone },
      items: order.items.map(({ image, name, quantity, unitPrice }) => ({ image, name, quantity, unitPrice })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      createdAt: now,
      payment: { method: "Online Payment (Razorpay)", status: "Paid", transactionId: razorpay_payment_id, razorpayOrderId: order.razorpayOrderId },
      status: "placed",
      timeline: { placed: now },
      shipping: { ...order.shipping, courier: "Not assigned", trackingNumber: "Not assigned", estimatedDeliveryDate: settings.estimatedDeliveryTime },
      policies: { cancellationWindowHours: settings.cancellationWindowDays, returnWindowDays: settings.returnWindowDays, refundConfiguration: settings.refundConfiguration, workflow: settings.orderWorkflow },
      statusUpdatedAt: now,
    });
    return NextResponse.json({ orderNumber: saved.orderNumber }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify payment." }, { status: error instanceof CheckoutError ? error.status : 500 });
  }
}
