import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const inquiriesPath = join(process.cwd(), "data", "contact-inquiries.json");

async function getInquiries() {
  try {
    const inquiries = JSON.parse(await readFile(inquiriesPath, "utf8"));
    return Array.isArray(inquiries) ? inquiries : [];
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return [];
    throw error;
  }
}

export async function POST(request) {
  try {
    const { "first-name": firstName, "last-name": lastName, email, message } = await request.json();
    const values = [firstName, lastName, email, message];
    if (values.some((value) => typeof value !== "string" || !value.trim())) return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });

    const inquiry = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), message: message.trim(), receivedAt: new Date().toISOString() };
    const directory = join(process.cwd(), "data");
    const temporaryPath = `${inquiriesPath}.tmp`;
    await mkdir(directory, { recursive: true });
    await writeFile(temporaryPath, `${JSON.stringify([...(await getInquiries()), inquiry], null, 2)}\n`, "utf8");
    await rename(temporaryPath, inquiriesPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send your enquiry." }, { status: 500 });
  }
}
