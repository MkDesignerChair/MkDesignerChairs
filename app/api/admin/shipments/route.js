import { NextResponse } from "next/server";
import {
  assignShiprocketAwbForOrder,
  createShiprocketShipmentForOrder,
  scheduleShiprocketPickupForOrder,
} from "../../../../actions/shiprocket-store";
import { ShiprocketError } from "../../../lib/shiprocket";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, action, courierId } = await request.json();
    if (typeof id !== "string" || !id) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });

    const order = action === "create"
      ? await createShiprocketShipmentForOrder(id)
      : action === "assign_awb"
        ? await assignShiprocketAwbForOrder(id, courierId)
        : action === "schedule_pickup"
          ? await scheduleShiprocketPickupForOrder(id)
          : null;

    if (!order) return NextResponse.json({ error: "Invalid shipment action." }, { status: 400 });
    return NextResponse.json({ order });
  } catch (error) {
    const status = error instanceof ShiprocketError ? error.status : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update the Shiprocket shipment." },
      { status: status >= 400 && status < 600 ? status : 502 },
    );
  }
}
