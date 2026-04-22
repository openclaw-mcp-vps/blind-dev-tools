import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const ACCESS_COOKIE_NAME = "blind_dev_tools_access";
export const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

interface PurchaseRecord {
  sessionId: string;
  status: "paid" | "pending";
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  eventId: string;
  updatedAt: string;
}

interface PurchaseStore {
  sessions: Record<string, PurchaseRecord>;
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data?: {
    object?: Record<string, unknown>;
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");
const LOCAL_FALLBACK_SECRET = "blind-dev-tools-local-signing-secret";

function getSigningSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || LOCAL_FALLBACK_SECRET;
}

function hashWithSecret(payload: string): string {
  return crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

function timingSafeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

async function ensureStore(): Promise<PurchaseStore> {
  try {
    const raw = await fs.readFile(PURCHASES_FILE, "utf8");
    const parsed = JSON.parse(raw) as PurchaseStore;

    if (!parsed.sessions || typeof parsed.sessions !== "object") {
      return { sessions: {} };
    }

    return parsed;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const initialStore: PurchaseStore = { sessions: {} };
    await fs.writeFile(PURCHASES_FILE, JSON.stringify(initialStore, null, 2), "utf8");
    return initialStore;
  }
}

async function saveStore(store: PurchaseStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PURCHASES_FILE, JSON.stringify(store, null, 2), "utf8");
}

function parseStripeEvent(payload: unknown): StripeWebhookEvent | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as StripeWebhookEvent;

  if (typeof candidate.id !== "string" || typeof candidate.type !== "string") {
    return null;
  }

  return candidate;
}

export async function recordSuccessfulSessionFromStripeEvent(
  payload: unknown
): Promise<PurchaseRecord | null> {
  const event = parseStripeEvent(payload);
  if (!event) {
    return null;
  }

  const acceptedEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);

  if (!acceptedEvents.has(event.type)) {
    return null;
  }

  const session = event.data?.object;
  if (!session) {
    return null;
  }

  const sessionId = typeof session.id === "string" ? session.id : null;
  if (!sessionId) {
    return null;
  }

  const paymentStatus =
    typeof session.payment_status === "string" ? session.payment_status : "pending";

  if (paymentStatus !== "paid" && event.type !== "checkout.session.async_payment_succeeded") {
    return null;
  }

  const store = await ensureStore();
  const record: PurchaseRecord = {
    sessionId,
    status: "paid",
    customerEmail:
      typeof session.customer_email === "string" ? session.customer_email : undefined,
    amountTotal:
      typeof session.amount_total === "number" ? session.amount_total : undefined,
    currency: typeof session.currency === "string" ? session.currency : undefined,
    eventId: event.id,
    updatedAt: new Date().toISOString(),
  };

  store.sessions[sessionId] = record;
  await saveStore(store);

  return record;
}

export async function isCheckoutSessionPaid(sessionId: string): Promise<boolean> {
  const store = await ensureStore();
  return store.sessions[sessionId]?.status === "paid";
}

export function createAccessCookieValue(sessionId: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${sessionId}.${issuedAt}`;
  const signature = hashWithSecret(payload);
  return `${payload}.${signature}`;
}

export function verifyAccessCookieValue(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const chunks = value.split(".");
  if (chunks.length < 3) {
    return null;
  }

  const signature = chunks.pop();
  const issuedAt = chunks.pop();
  const sessionId = chunks.join(".");

  if (!signature || !issuedAt || !sessionId) {
    return null;
  }

  if (!/^\d+$/.test(issuedAt)) {
    return null;
  }

  const signedPayload = `${sessionId}.${issuedAt}`;
  const expectedSignature = hashWithSecret(signedPayload);

  if (!timingSafeCompare(signature, expectedSignature)) {
    return null;
  }

  const ageMs = Date.now() - Number(issuedAt);
  const maxAgeMs = ACCESS_COOKIE_TTL_SECONDS * 1000;
  if (ageMs > maxAgeMs) {
    return null;
  }

  return sessionId;
}

export function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !rawBody) {
    return false;
  }

  const entries = signatureHeader.split(",").map((entry) => entry.trim());
  let timestamp: string | null = null;
  const v1Signatures: string[] = [];

  entries.forEach((entry) => {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = entry.slice(0, separatorIndex);
    const value = entry.slice(separatorIndex + 1);

    if (key === "t") {
      timestamp = value;
      return;
    }

    if (key === "v1") {
      v1Signatures.push(value);
    }
  });

  if (!timestamp || v1Signatures.length === 0) {
    return false;
  }

  const expected = hashWithSecret(`${timestamp}.${rawBody}`);
  return v1Signatures.some((signature) => timingSafeCompare(signature, expected));
}
