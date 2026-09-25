import { NextResponse } from "next/server";
import { createInquiry } from "../../../actions/inquiry-store";

export async function POST(request) {
  try {
    const values = await request.json();
    const inquiry = await createInquiry({ firstName: values["first-name"], lastName: values["last-name"], email: values.email, phone: values.phone, message: values.message });
    return NextResponse.json({ success: true, inquiry: { id: inquiry.id, receivedAt: inquiry.receivedAt } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send your enquiry." }, { status: 400 });
  }
}
