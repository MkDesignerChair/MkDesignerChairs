const API_ORIGIN = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_REFRESH_BUFFER_MS = 60 * 60 * 1000;

let cachedToken = "";
let tokenExpiresAt = 0;
let authenticationBlockedUntil = 0;

export class ShiprocketError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ShiprocketError";
    this.status = status;
  }
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new ShiprocketError(`${name} is not configured.`, 503);
  return value;
}

function positiveNumberEnv(name) {
  const value = Number(requiredEnv(name));
  if (!Number.isFinite(value) || value <= 0) {
    throw new ShiprocketError(`${name} must be a positive number.`, 503);
  }
  return value;
}

function configuration() {
  const defaultCourierId = process.env.SHIPROCKET_DEFAULT_COURIER_ID?.trim() || "";
  if (defaultCourierId && !/^\d+$/.test(defaultCourierId)) {
    throw new ShiprocketError("SHIPROCKET_DEFAULT_COURIER_ID must be numeric.", 503);
  }

  return {
    email: requiredEnv("SHIPROCKET_EMAIL"),
    password: requiredEnv("SHIPROCKET_PASSWORD"),
    pickupLocation: requiredEnv("SHIPROCKET_PICKUP_LOCATION"),
    defaultCourierId,
    parcel: {
      length: positiveNumberEnv("SHIPROCKET_DEFAULT_LENGTH_CM"),
      breadth: positiveNumberEnv("SHIPROCKET_DEFAULT_BREADTH_CM"),
      height: positiveNumberEnv("SHIPROCKET_DEFAULT_HEIGHT_CM"),
      weight: positiveNumberEnv("SHIPROCKET_DEFAULT_WEIGHT_KG"),
    },
  };
}

async function responseData(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function providerMessage(data, fallback) {
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(" ");
  return fallback;
}

async function authenticate(force = false) {
  const now = Date.now();
  if (authenticationBlockedUntil > now) {
    throw new ShiprocketError("Shiprocket has temporarily blocked this API user after failed sign-in attempts. Wait for Shiprocket to unblock the user, then restart the app before trying again.", 429);
  }
  if (!force && cachedToken && tokenExpiresAt > now + TOKEN_REFRESH_BUFFER_MS) return cachedToken;

  const { email, password } = configuration();
  const response = await fetch(`${API_ORIGIN}/auth/login`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await responseData(response);

  if (!response.ok || typeof data.token !== "string" || !data.token) {
    const message = providerMessage(data, "Shiprocket authentication failed.");
    if (/blocked due to too many failed login attempts/i.test(message)) {
      authenticationBlockedUntil = now + (15 * 60 * 1000);
      throw new ShiprocketError("Shiprocket has temporarily blocked this API user after failed sign-in attempts. Wait for Shiprocket to unblock the user, then restart the app before trying again.", 429);
    }
    throw new ShiprocketError(message, response.status || 502);
  }

  cachedToken = data.token;
  tokenExpiresAt = now + (9 * 24 * 60 * 60 * 1000);
  authenticationBlockedUntil = 0;
  return cachedToken;
}

async function request(path, options = {}, canRefresh = true) {
  const token = await authenticate(!canRefresh);
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await responseData(response);

  if (response.status === 401 && canRefresh) {
    cachedToken = "";
    tokenExpiresAt = 0;
    return request(path, options, false);
  }
  if (!response.ok) {
    throw new ShiprocketError(providerMessage(data, "Shiprocket request failed."), response.status || 502);
  }

  return data;
}

function customerNameParts(name) {
  const parts = String(name || "Customer").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "Customer", lastName: parts.slice(1).join(" ") };
}

function phoneDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const phone = digits.length > 10 ? digits.slice(-10) : digits;
  if (!/^\d{10}$/.test(phone)) throw new ShiprocketError("A valid 10-digit customer phone number is required before creating a shipment.", 400);
  return phone;
}

function orderReference(order) {
  const reference = String(order.id || order.orderNumber || "").replace(/\D/g, "");
  if (!reference || reference.length > 50) throw new ShiprocketError("Order needs a valid numeric reference number before creating a shipment.", 400);
  return reference;
}

function orderPayload(order, config) {
  const shipping = order.shipping || {};
  const customer = order.customer || {};
  const { firstName, lastName } = customerNameParts(customer.name);
  if (!shipping.addressLine1 || !shipping.city || !shipping.state || !/^\d{6}$/.test(String(shipping.postalCode || ""))) {
    throw new ShiprocketError("Order needs a complete Indian shipping address before creating a shipment.", 400);
  }
  if (!/^\S+@\S+\.\S+$/.test(String(customer.email || ""))) {
    throw new ShiprocketError("Order needs a valid customer email before creating a shipment.", 400);
  }
  if (!Array.isArray(order.items) || !order.items.length) throw new ShiprocketError("Order needs at least one item before creating a shipment.", 400);

  const isCod = /cash|cod/i.test(String(order.payment?.method || ""));
  return {
    order_id: orderReference(order),
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 16).replace("T", " "),
    pickup_location: config.pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: shipping.addressLine1,
    billing_address_2: shipping.addressLine2 || "",
    billing_city: shipping.city,
    billing_pincode: String(shipping.postalCode),
    billing_state: shipping.state,
    billing_country: "India",
    billing_email: customer.email,
    billing_phone: phoneDigits(customer.phone),
    shipping_is_billing: true,
    order_items: order.items.map((item, index) => ({
      name: String(item.name || "Product").slice(0, 190),
      sku: `MK-${orderReference(order)}-${index + 1}`.slice(0, 100),
      units: Number(item.quantity),
      selling_price: Number(item.unitPrice),
      discount: 0,
      tax: 0,
    })),
    payment_method: isCod ? "COD" : "Prepaid",
    shipping_charges: Number(order.shippingCost || 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: Number(order.subtotal || 0),
    length: config.parcel.length,
    breadth: config.parcel.breadth,
    height: config.parcel.height,
    weight: config.parcel.weight,
  };
}

export async function createShipment(order) {
  const config = configuration();
  const data = await request("/orders/create/adhoc", { method: "POST", body: JSON.stringify(orderPayload(order, config)) });
  if (!data.shipment_id || !data.order_id) throw new ShiprocketError(providerMessage(data, "Shiprocket did not return a shipment ID."), 502);

  return {
    sourceOrderId: orderReference(order),
    orderId: String(data.order_id),
    shipmentId: String(data.shipment_id),
    courierId: data.courier_company_id ? String(data.courier_company_id) : "",
    courierName: data.courier_name || "",
    awb: data.awb_code || "",
    status: data.status || "NEW",
    createdAt: new Date().toISOString(),
  };
}

async function selectServiceableCourier(order, shipment, config) {
  const locations = await request("/settings/company/pickup");
  const location = locations?.data?.shipping_address?.find(
    (entry) => String(entry.pickup_location || "").trim().toLowerCase() === config.pickupLocation.toLowerCase(),
  );
  const pickupPostcode = String(location?.pin_code || "").replace(/\D/g, "");
  const deliveryPostcode = String(order.shipping?.postalCode || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(pickupPostcode)) {
    throw new ShiprocketError("The configured Shiprocket pickup location could not be found or has no valid PIN code.", 400);
  }

  const isCod = /cash|cod/i.test(String(order.payment?.method || ""));
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    order_id: String(shipment.orderId),
    cod: isCod ? "1" : "0",
    weight: String(config.parcel.weight),
    length: String(config.parcel.length),
    breadth: String(config.parcel.breadth),
    height: String(config.parcel.height),
    declared_value: String(order.totalAmount || order.subtotal || 0),
  });
  const data = await request(`/courier/serviceability/?${params}`);
  const available = data?.data?.available_courier_companies || data?.available_courier_companies || [];
  if (!Array.isArray(available) || !available.length) {
    throw new ShiprocketError("No serviceable courier is available for this order's delivery PIN code.", 400);
  }

  const recommendedId = data?.data?.recommended_courier_company_id || data?.recommended_courier_company_id;
  const selected = available.find((courier) => String(courier.courier_company_id) === String(recommendedId)) || available[0];
  return { id: String(selected.courier_company_id), name: selected.courier_name || "Shiprocket courier", estimatedDelivery: selected.etd || "" };
}

export async function assignAwb(order, shipment, courierIdInput) {
  const config = configuration();
  const selectedCourier = courierIdInput || shipment.courierId || config.defaultCourierId
    ? null
    : await selectServiceableCourier(order, shipment, config);
  const courierId = String(courierIdInput || shipment.courierId || config.defaultCourierId || selectedCourier?.id || "");
  if (!/^\d+$/.test(courierId)) throw new ShiprocketError("A serviceable courier could not be selected. Add SHIPROCKET_DEFAULT_COURIER_ID or select one in Shiprocket.", 400);

  const data = await request("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: Number(shipment.shipmentId), courier_id: Number(courierId) }),
  });
  const result = data.data || data;
  if (!result.awb_code) throw new ShiprocketError(providerMessage(data, "Shiprocket did not return an AWB."), 502);

  return {
    ...shipment,
    courierId: String(result.courier_company_id || courierId),
    courierName: result.courier_name || selectedCourier?.name || shipment.courierName || "Shiprocket courier",
    awb: String(result.awb_code),
    status: result.status || shipment.status || "AWB ASSIGNED",
    awbAssignedAt: new Date().toISOString(),
    estimatedDelivery: selectedCourier?.estimatedDelivery || shipment.estimatedDelivery || "",
  };
}

export async function schedulePickup(shipment) {
  const data = await request("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipment.shipmentId)] }),
  });
  const result = data.data || data;

  return {
    ...shipment,
    pickupToken: String(result.pickup_token_number || result.pickup_token || shipment.pickupToken || ""),
    pickupScheduledAt: new Date().toISOString(),
    status: result.status || shipment.status || "PICKUP SCHEDULED",
  };
}
