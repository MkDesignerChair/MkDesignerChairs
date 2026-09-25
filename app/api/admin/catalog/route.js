import { NextResponse } from "next/server";
import { deleteCatalogProduct, updateCatalogOverride } from "../../../../actions/catalog";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

export async function PATCH(request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id, changes } = await request.json();
    const override = await updateCatalogOverride(id, changes);

    return NextResponse.json({ success: true, override });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update the product." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await deleteCatalogProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete the product." }, { status: 400 });
  }
}
