import { NextResponse } from "next/server";
import { deleteInquiry, getInquiries, updateInquiry } from "../../../../actions/inquiry-store";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ inquiries: await getInquiries() });
}

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, changes } = await request.json();
    return NextResponse.json({ inquiry: await updateInquiry(id, changes) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update enquiry." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id } = await request.json();
    await deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete enquiry." }, { status: 400 });
  }
}
