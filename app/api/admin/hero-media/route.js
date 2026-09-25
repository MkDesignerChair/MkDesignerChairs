import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../lib/admin-auth";
import { deleteContentImage, uploadContentImage } from "../../../lib/imagekit-store";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
    if (!allowedMimeTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image." }, { status: 400 });
    return NextResponse.json(await uploadContentImage(file, "hero"));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload the hero image." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { image } = await request.json();
    if (typeof image !== "string" || !image.trim()) return NextResponse.json({ error: "Choose a valid uploaded hero image." }, { status: 400 });
    await deleteContentImage("hero", image);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete the hero image." }, { status: 500 });
  }
}
