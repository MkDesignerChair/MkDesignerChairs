import { NextResponse } from "next/server";
import { createCategory, deleteCategory, updateCategory } from "../../../../actions/category-catalog";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id, changes } = await request.json();
    return NextResponse.json({ success: true, category: await updateCategory(id, changes) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update category." }, { status: 400 });
  }
}

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { changes } = await request.json();
    return NextResponse.json({ success: true, category: await createCategory(changes) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create category." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await request.json();
    return NextResponse.json({ success: true, ...(await deleteCategory(id)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete category." }, { status: 400 });
  }
}
