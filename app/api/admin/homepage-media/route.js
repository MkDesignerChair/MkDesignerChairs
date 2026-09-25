import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const uploadDirectory = join(process.cwd(), "public", "uploads");

function isManagedUpload(image) {
  return typeof image === "string" && image.startsWith("/uploads/") && basename(image) === image.slice("/uploads/".length);
}

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });

  const extension = extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image." }, { status: 400 });

  const fileName = `homepage-${Date.now()}${extension}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ image: `/uploads/${fileName}` });
}

export async function DELETE(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { image } = await request.json();
  if (!isManagedUpload(image)) return NextResponse.json({ error: "Only uploaded homepage images can be deleted." }, { status: 400 });

  await rm(join(uploadDirectory, basename(image)), { force: true });
  return NextResponse.json({ success: true });
}
