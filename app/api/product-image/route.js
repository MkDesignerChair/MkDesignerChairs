import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { NextResponse } from "next/server";

const imageTypes = new Map([
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
]);

export async function GET(request) {
  const name = request.nextUrl.searchParams.get("name");

  if (!name || basename(name) !== name) {
    return NextResponse.json({ error: "Invalid image name." }, { status: 400 });
  }

  const contentType = imageTypes.get(extname(name).toLowerCase());

  if (!contentType) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  try {
    const image = await readFile(join(process.cwd(), "public", "Products", name));

    return new NextResponse(image, {
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
