import { NextResponse } from "next/server";
import { getOrders, updateOrderStatus } from "../../../../actions/order-store";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ orders: await getOrders() });
}

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, status } = await request.json();
    return NextResponse.json({ order: await updateOrderStatus(id, status) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update order." }, { status: 400 });
  }
}
