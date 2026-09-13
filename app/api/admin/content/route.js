import { NextResponse } from "next/server";
import { updateSiteContent } from "../../../../actions/site-content";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { section, values } = await request.json();
    return NextResponse.json({ success: true, content: await updateSiteContent(section, values) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save content." }, { status: 400 });
  }
}
