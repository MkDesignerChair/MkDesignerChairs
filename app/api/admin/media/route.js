import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { uploadProductImage } from "../../../lib/imagekit-store";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });

    if (!allowedMimeTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image." }, { status: 400 });

    return NextResponse.json(await uploadProductImage(file));
  } catch (error) {
    console.error("Product image upload failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Unable to store the image. This deployment needs persistent media storage configured." }, { status: 500 });
  }
}
