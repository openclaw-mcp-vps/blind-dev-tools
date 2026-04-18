import { createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface PurchaseRecord {
  email: string;
  orderId: string;
  eventName: string;
  status: string;
  paid: boolean;
  productId?: string;
  updatedAt: string;
}

interface PurchaseStore {
  purchases: Record<string, PurchaseRecord>;
}

interface AccessTokenPayload {
  email: string;
  exp: number;
}

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const PURCHASE_STORE_FILE = path.join(DATA_DIRECTORY, "purchases.json");

const PAID_EVENTS = new Set([
  "order_created",
  "order_paid",
  "subscription_created",
  "subscription_payment_success",
  "subscription_resumed",
]);

const UNPAID_EVENTS = new Set([
  "order_refunded",
  "subscription_cancelled",
  "subscription_expired",
  "subscription_paused",
]);

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildCheckoutUrl(productOrVariantId: string): string {
  return `https://checkout.lemonsqueezy.com/buy/${productOrVariantId}?embed=1&media=0&logo=0`;
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(digestBuffer, signatureBuffer);
}

async function ensurePurchaseStore(): Promise<void> {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(PURCHASE_STORE_FILE);
  } catch {
    const initial: PurchaseStore = { purchases: {} };
    await fs.writeFile(PURCHASE_STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<PurchaseStore> {
  await ensurePurchaseStore();
  const data = await fs.readFile(PURCHASE_STORE_FILE, "utf8");
  const parsed = JSON.parse(data) as PurchaseStore;

  if (!parsed.purchases) {
    return { purchases: {} };
  }

  return parsed;
}

async function writeStore(store: PurchaseStore): Promise<void> {
  await fs.writeFile(PURCHASE_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

function readEmailFromPayload(payload: Record<string, unknown>): string {
  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const meta = payload.meta as Record<string, unknown> | undefined;
  const customData = meta?.custom_data as Record<string, unknown> | undefined;

  const candidates = [
    attributes?.user_email,
    attributes?.customer_email,
    customData?.email,
    customData?.user_email,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.includes("@")) {
      return normalizeEmail(candidate);
    }
  }

  return "";
}

function readOrderIdFromPayload(payload: Record<string, unknown>): string {
  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;

  if (typeof attributes?.order_id === "number") {
    return String(attributes.order_id);
  }

  if (typeof attributes?.order_id === "string") {
    return attributes.order_id;
  }

  if (typeof data?.id === "string") {
    return data.id;
  }

  return "unknown-order";
}

function readProductIdFromPayload(payload: Record<string, unknown>): string | undefined {
  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const firstOrderItem = attributes?.first_order_item as Record<string, unknown> | undefined;

  if (typeof firstOrderItem?.product_id === "number") {
    return String(firstOrderItem.product_id);
  }

  if (typeof firstOrderItem?.product_id === "string") {
    return firstOrderItem.product_id;
  }

  return undefined;
}

function resolvePaidFlag(eventName: string, status: string, previousValue?: boolean): boolean {
  if (PAID_EVENTS.has(eventName)) {
    return true;
  }

  if (UNPAID_EVENTS.has(eventName)) {
    return false;
  }

  const normalizedStatus = status.toLowerCase();
  if (["paid", "active", "on_trial"].includes(normalizedStatus)) {
    return true;
  }

  if (["refunded", "cancelled", "expired", "failed"].includes(normalizedStatus)) {
    return false;
  }

  return previousValue ?? false;
}

export async function upsertPurchaseFromWebhook(payload: Record<string, unknown>): Promise<PurchaseRecord | null> {
  const meta = payload.meta as Record<string, unknown> | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;

  const eventName = typeof meta?.event_name === "string" ? meta.event_name : "unknown_event";
  const email = readEmailFromPayload(payload);

  if (!email) {
    return null;
  }

  const orderId = readOrderIdFromPayload(payload);
  const statusRaw =
    typeof attributes?.status === "string"
      ? attributes.status
      : typeof attributes?.status_formatted === "string"
        ? attributes.status_formatted
        : "unknown";

  const productId = readProductIdFromPayload(payload);

  const store = await readStore();
  const previous = store.purchases[email];

  const nextRecord: PurchaseRecord = {
    email,
    orderId,
    eventName,
    status: statusRaw,
    paid: resolvePaidFlag(eventName, statusRaw, previous?.paid),
    productId,
    updatedAt: new Date().toISOString(),
  };

  store.purchases[email] = nextRecord;
  await writeStore(store);

  return nextRecord;
}

export async function findPurchaseByEmail(email: string): Promise<PurchaseRecord | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }

  const store = await readStore();
  return store.purchases[normalized] ?? null;
}

export function createAccessToken(email: string, secret: string, daysValid = 30): string {
  const payload: AccessTokenPayload = {
    email: normalizeEmail(email),
    exp: Date.now() + daysValid * 24 * 60 * 60 * 1000,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string, secret: string): { valid: boolean; email?: string } {
  if (!token.includes(".")) {
    return { valid: false };
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  if (signature.length !== expectedSignature.length) {
    return { valid: false };
  }

  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (!timingSafeEqual(provided, expected)) {
    return { valid: false };
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as AccessTokenPayload;
    if (!parsed.email || parsed.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, email: parsed.email };
  } catch {
    return { valid: false };
  }
}
