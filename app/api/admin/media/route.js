import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../lib/admin-auth";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function POST(request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });

  const extension = extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image." }, { status: 400 });

  const fileName = `chair-${Date.now()}${extension}`;
  const productDirectory = join(process.cwd(), "public", "Products");
  await mkdir(productDirectory, { recursive: true });
  await writeFile(join(productDirectory, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ id: fileName, image: `/api/product-image?name=${encodeURIComponent(fileName)}` });
}
