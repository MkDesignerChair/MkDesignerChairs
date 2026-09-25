import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const filePath = join(process.cwd(), "data", "contact-inquiries.json");
const statuses = new Set(["new", "contacted", "in_progress", "resolved"]);

async function readInquiries() {
  try {
    const inquiries = JSON.parse(await readFile(filePath, "utf8"));
    return Array.isArray(inquiries) ? inquiries : [];
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeInquiries(inquiries) {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(inquiries, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
}

function requiredText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new Error(`${label} is too long.`);
  return trimmed;
}

export async function getInquiries() {
  const inquiries = await readInquiries();
  return inquiries.sort((left, right) => new Date(right.receivedAt) - new Date(left.receivedAt));
}

export async function createInquiry(values) {
  const firstName = requiredText(values.firstName, "First name", 80);
  const lastName = requiredText(values.lastName, "Last name", 80);
  const email = requiredText(values.email, "Email address", 254).toLowerCase();
  const message = requiredText(values.message, "Message", 3000);
  const phone = typeof values.phone === "string" ? values.phone.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Please provide a valid email address.");
  if (phone && !/^[+\d()\s-]{7,30}$/.test(phone)) throw new Error("Please provide a valid phone number.");

  const inquiries = await readInquiries();
  const inquiry = { id: `enquiry-${randomUUID()}`, firstName, lastName, email, phone, message, status: "new", isRead: false, receivedAt: new Date().toISOString() };
  inquiries.push(inquiry);
  await writeInquiries(inquiries);
  return inquiry;
}

export async function updateInquiry(id, changes) {
  if (typeof id !== "string" || !id) throw new Error("Enquiry ID is required.");
  if (!changes || typeof changes !== "object") throw new Error("Invalid enquiry changes.");
  const inquiries = await readInquiries();
  const index = inquiries.findIndex((inquiry) => inquiry.id === id);
  if (index === -1) throw new Error("Enquiry not found.");
  const next = { ...inquiries[index] };

  if (Object.hasOwn(changes, "isRead")) {
    if (typeof changes.isRead !== "boolean") throw new Error("Invalid read status.");
    next.isRead = changes.isRead;
  }
  if (Object.hasOwn(changes, "status")) {
    if (!statuses.has(changes.status)) throw new Error("Invalid enquiry status.");
    next.status = changes.status;
  }

  inquiries[index] = next;
  await writeInquiries(inquiries);
  return next;
}

export async function deleteInquiry(id) {
  if (typeof id !== "string" || !id) throw new Error("Enquiry ID is required.");
  const inquiries = await readInquiries();
  const nextInquiries = inquiries.filter((inquiry) => inquiry.id !== id);
  if (nextInquiries.length === inquiries.length) throw new Error("Enquiry not found.");
  await writeInquiries(nextInquiries);
}
