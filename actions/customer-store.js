import { readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { updateOrderCustomerByEmail, getOrders } from "./order-store";
import { getReviews, updateReviewCustomerName } from "./review-store";

const filePath = join(process.cwd(), "data", "customers.json");
const editableFields = new Set(["name", "email", "phone", "status"]);

async function readCustomers() {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeCustomers(customers) {
  await writeFile(`${filePath}.tmp`, `${JSON.stringify(customers, null, 2)}\n`, "utf8");
  await rename(`${filePath}.tmp`, filePath);
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function enrichCustomer(customer, orders, reviews) {
  const customerOrders = orders.filter((order) => normalize(order.customer.email) === normalize(customer.email));
  const customerReviews = reviews.filter((review) => normalize(review.customerName) === normalize(customer.name));
  const latestActivity = [...customerOrders.map((order) => order.createdAt), ...customerReviews.map((review) => review.createdAt), customer.registeredAt].sort((left, right) => new Date(right) - new Date(left))[0];

  return { ...customer, orders: customerOrders, reviews: customerReviews, orderCount: customerOrders.length, totalSpent: customerOrders.reduce((total, order) => total + Number(order.totalAmount || 0), 0), latestActivity };
}

export async function getCustomers() {
  const [customers, orders, reviews] = await Promise.all([readCustomers(), getOrders(), getReviews()]);
  return customers.map((customer) => enrichCustomer(customer, orders, reviews));
}

export async function getCustomerByEmail(email) {
  const normalizedEmail = normalize(email);
  const customers = await readCustomers();
  return customers.find((customer) => normalize(customer.email) === normalizedEmail) || null;
}

export async function createCustomerFromRegistration(email, registeredName) {
  const normalizedEmail = normalize(email);
  const customers = await readCustomers();
  const existing = customers.find((customer) => normalize(customer.email) === normalizedEmail);
  if (existing) return existing;

  const name = typeof registeredName === "string" && registeredName.trim() ? registeredName.trim() : normalizedEmail.split("@")[0].split(/[._-]+/).filter(Boolean).map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join(" ") || "New customer";
  const customer = { id: `customer-${randomUUID()}`, name, email: normalizedEmail, phone: "", status: "active", registeredAt: new Date().toISOString() };
  customers.push(customer);
  await writeCustomers(customers);
  return customer;
}

function sanitizeChanges(changes) {
  if (!changes || typeof changes !== "object") throw new Error("Invalid customer changes.");
  const next = {};

  for (const [field, value] of Object.entries(changes)) {
    if (!editableFields.has(field)) continue;
    if (["name", "email", "phone"].includes(field)) {
      if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${field}.`);
      next[field] = field === "email" ? normalize(value) : value.trim();
    }
    if (field === "status") {
      if (!["active", "deactivated"].includes(value)) throw new Error("Invalid account status.");
      next.status = value;
    }
  }

  if (next.email && !/^\S+@\S+\.\S+$/.test(next.email)) throw new Error("Enter a valid email address.");
  return next;
}

export async function updateCustomer(id, changes) {
  if (typeof id !== "string" || !id) throw new Error("Customer ID is required.");
  const customers = await readCustomers();
  const index = customers.findIndex((customer) => customer.id === id);
  if (index === -1) throw new Error("Customer not found.");

  const current = customers[index];
  const next = { ...current, ...sanitizeChanges(changes) };
  const duplicate = customers.some((customer) => customer.id !== id && normalize(customer.email) === normalize(next.email));
  if (duplicate) throw new Error("Another customer already uses this email address.");

  customers[index] = next;
  await writeCustomers(customers);
  await Promise.all([
    updateOrderCustomerByEmail(current.email, { name: next.name, email: next.email, phone: next.phone }),
    current.name === next.name ? Promise.resolve() : updateReviewCustomerName(current.name, next.name),
  ]);
  const [orders, reviews] = await Promise.all([getOrders(), getReviews()]);
  return enrichCustomer(next, orders, reviews);
}

export async function deleteCustomer(id) {
  if (typeof id !== "string" || !id) throw new Error("Customer ID is required.");
  const customers = await readCustomers();
  const nextCustomers = customers.filter((customer) => customer.id !== id);
  if (nextCustomers.length === customers.length) throw new Error("Customer not found.");
  await writeCustomers(nextCustomers);
}
