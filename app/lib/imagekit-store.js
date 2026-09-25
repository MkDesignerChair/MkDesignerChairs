const IMAGEKIT_API_URL = "https://api.imagekit.io/v1";
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const DATA_FOLDER = "/mk-designer-chairs-data";
const PRODUCT_FOLDER = "/mk-designer-chairs-products";
const CATEGORY_FOLDER = "/mk-designer-chairs-categories";
const CONTENT_FOLDERS = {
  hero: "/mk-designer-chairs-hero",
  homepage: "/mk-designer-chairs-homepage",
};

function getSupabaseConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

function getSupabaseHeaders(configuration, extraHeaders = {}) {
  return {
    apikey: configuration.serviceRoleKey,
    Authorization: `Bearer ${configuration.serviceRoleKey}`,
    ...extraHeaders,
  };
}

async function getSupabaseResponse(response, fallbackMessage) {
  const body = await response.text();
  let data = null;

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.hint || data?.error || fallbackMessage;
    throw new Error(message);
  }

  return data;
}

async function getSupabasePersistentJson(name, fallbackValue) {
  const configuration = getSupabaseConfiguration();
  if (!configuration) throw new Error("Supabase persistent storage is not configured.");

  const response = await fetch(`${configuration.url}/rest/v1/admin_state?state_key=eq.${encodeURIComponent(name)}&select=data`, {
    cache: "no-store",
    headers: getSupabaseHeaders(configuration),
  });
  const rows = await getSupabaseResponse(response, "Unable to read persistent Supabase data.");
  if (Array.isArray(rows) && rows[0]?.data && typeof rows[0].data === "object") return rows[0].data;

  await saveSupabasePersistentJson(name, fallbackValue);
  return fallbackValue;
}

async function saveSupabasePersistentJson(name, value) {
  const configuration = getSupabaseConfiguration();
  if (!configuration) throw new Error("Supabase persistent storage is not configured.");

  const response = await fetch(`${configuration.url}/rest/v1/admin_state?on_conflict=state_key`, {
    method: "POST",
    headers: getSupabaseHeaders(configuration, {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify({ state_key: name, data: value }),
  });
  return getSupabaseResponse(response, "Unable to save persistent Supabase data.");
}

function getImageKitPrivateKey() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error("ImageKit private key is not configured.");
  return privateKey;
}

function getAuthorizationHeader() {
  return `Basic ${Buffer.from(`${getImageKitPrivateKey()}:`).toString("base64")}`;
}

function getFileExtension(fileName) {
  const match = fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return match ? `.${match[1]}` : ".jpg";
}

async function getImageKitResponse(response, fallbackMessage) {
  const body = await response.text();
  let data = {};

  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  if (!response.ok) throw new Error(data.message || data.error || fallbackMessage);
  return data;
}

async function listFolderFiles(folder) {
  const response = await fetch(`${IMAGEKIT_API_URL}/files?path=${encodeURIComponent(folder)}&limit=1000`, {
    cache: "no-store",
    headers: { Authorization: getAuthorizationHeader() },
  });
  const files = await getImageKitResponse(response, "Unable to read persistent ImageKit data.");
  return Array.isArray(files) ? files : [];
}

async function uploadFile({ content, fileName, folder, overwrite }) {
  const formData = new FormData();
  formData.set("file", content);
  formData.set("fileName", fileName);
  formData.set("folder", folder);
  formData.set("useUniqueFileName", "false");
  formData.set("overwriteFile", overwrite ? "true" : "false");

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: getAuthorizationHeader() },
    body: formData,
  });
  return getImageKitResponse(response, "Unable to save data to ImageKit.");
}

export function isImageKitConfigured() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);
}

export function isPersistentDataConfigured() {
  return Boolean(getSupabaseConfiguration() || isImageKitConfigured());
}

export async function getPersistentJson(name, fallbackValue) {
  if (getSupabaseConfiguration()) return getSupabasePersistentJson(name, fallbackValue);

  const files = await listFolderFiles(DATA_FOLDER);
  const file = files.find((item) => item.name === name);

  if (!file?.url) {
    await savePersistentJson(name, fallbackValue);
    return fallbackValue;
  }

  const response = await fetch(file.url, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to read persistent application data.");

  try {
    return JSON.parse(await response.text());
  } catch {
    throw new Error("Persistent application data is invalid.");
  }
}

export async function savePersistentJson(name, value) {
  if (getSupabaseConfiguration()) return saveSupabasePersistentJson(name, value);

  const content = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  return uploadFile({ content, fileName: name, folder: DATA_FOLDER, overwrite: true });
}

export async function uploadProductImage(file) {
  const extension = getFileExtension(file.name);
  const fileName = `chair-${crypto.randomUUID()}${extension}`;
  const uploadedFile = await uploadFile({ content: file, fileName, folder: PRODUCT_FOLDER, overwrite: false });

  if (!uploadedFile.fileId || !uploadedFile.url) throw new Error("ImageKit did not return an uploaded image.");
  return { id: uploadedFile.fileId, image: uploadedFile.url };
}

export async function uploadCategoryImage(file) {
  const extension = getFileExtension(file.name);
  const fileName = `category-${crypto.randomUUID()}${extension}`;
  const uploadedFile = await uploadFile({ content: file, fileName, folder: CATEGORY_FOLDER, overwrite: false });

  if (!uploadedFile.fileId || !uploadedFile.url) throw new Error("ImageKit did not return an uploaded image.");
  return { id: uploadedFile.fileId, image: uploadedFile.url };
}

export async function deleteCategoryImage(image) {
  await deleteImageFromFolder(CATEGORY_FOLDER, image);
}

async function deleteImageFromFolder(folder, image) {
  const files = await listFolderFiles(folder);
  const file = files.find((item) => item.url === image);
  if (!file?.fileId) return;

  const response = await fetch(`${IMAGEKIT_API_URL}/files/${encodeURIComponent(file.fileId)}`, {
    method: "DELETE",
    headers: { Authorization: getAuthorizationHeader() },
  });
  await getImageKitResponse(response, "Unable to delete the image from ImageKit.");
}

export async function uploadContentImage(file, type) {
  const folder = CONTENT_FOLDERS[type];
  if (!folder) throw new Error("Invalid content image type.");

  const extension = getFileExtension(file.name);
  const uploadedFile = await uploadFile({ content: file, fileName: `${type}-${crypto.randomUUID()}${extension}`, folder, overwrite: false });
  if (!uploadedFile.fileId || !uploadedFile.url) throw new Error("ImageKit did not return an uploaded image.");
  return { id: uploadedFile.fileId, image: uploadedFile.url };
}

export async function deleteContentImage(type, image) {
  const folder = CONTENT_FOLDERS[type];
  if (!folder) throw new Error("Invalid content image type.");
  await deleteImageFromFolder(folder, image);
}
