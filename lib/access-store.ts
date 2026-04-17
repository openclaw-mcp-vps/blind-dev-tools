import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "purchases.json");

type AccessStore = {
  paidSessions: string[];
};

async function ensureStoreFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(STORE_FILE, "utf8");
  } catch {
    const initial: AccessStore = { paidSessions: [] };
    await writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

export async function readAccessStore(): Promise<AccessStore> {
  await ensureStoreFile();
  const content = await readFile(STORE_FILE, "utf8");
  return JSON.parse(content) as AccessStore;
}

export async function addPaidSession(sessionId: string) {
  const store = await readAccessStore();
  if (!store.paidSessions.includes(sessionId)) {
    store.paidSessions.push(sessionId);
    await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  }
}

export async function hasPaidAccess(sessionId?: string | null) {
  if (!sessionId) {
    return false;
  }

  const store = await readAccessStore();
  return store.paidSessions.includes(sessionId);
}
