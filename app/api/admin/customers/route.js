import { NextResponse } from "next/server";
import { deleteCustomer, getCustomers, updateCustomer } from "../../../../actions/customer-store";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ customers: await getCustomers() });
}

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, changes } = await request.json();
    return NextResponse.json({ customer: await updateCustomer(id, changes) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update customer." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id } = await request.json();
    await deleteCustomer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete customer." }, { status: 400 });
  }
}
