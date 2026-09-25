import { NextResponse } from "next/server";
import { deleteReview, getReviews, updateReview } from "../../../../actions/review-store";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ reviews: await getReviews() });
}

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id, changes } = await request.json();
    return NextResponse.json({ review: await updateReview(id, changes) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update review." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id } = await request.json();
    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete review." }, { status: 400 });
  }
}
