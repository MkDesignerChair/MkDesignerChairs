import { NextResponse } from "next/server";
import { getOrders, updateOrderParcel, updateOrderStatus } from "../../../../actions/order-store";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ orders: await getOrders() });
}

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, status, parcel } = await request.json();
    const order = parcel ? await updateOrderParcel(id, parcel) : await updateOrderStatus(id, status);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update order." }, { status: 400 });
  }
}
