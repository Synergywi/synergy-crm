// /web/lib/contactsApi.ts
export type Contact = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  notes?: string | null;
  lastSeen?: string | null;
};

const BASE = "/api/contacts";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

/** List all contacts */
export async function listContacts(): Promise<Contact[]> {
  const res = await fetch(`${BASE}`, { headers: { "Accept": "application/json" } });
  return json<Contact[]>(res);
}

/** Get a single contact by id. Tries /api/contacts/:id; falls back to list+find. */
export async function getContact(id: string): Promise<Contact | null> {
  // Try direct endpoint first
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    headers: { "Accept": "application/json" },
  });
  if (res.ok) return json<Contact>(res);

  // Fallback to list and find
  const all = await listContacts();
  return all.find(c => c.id === id) ?? null;
}

/** Create a contact (supply at least "name"). Returns created Contact. */
export async function addContact(data: Partial<Contact>): Promise<Contact> {
  const res = await fetch(`${BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return json<Contact>(res);
}

/** Update contact fields. Returns updated Contact. */
export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return json<Contact>(res);
}

/** Delete a contact by id. */
export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

/** Utilities used by the UI — keep endpoints to what your API expects. */
export async function simulateLogin(id: string): Promise<void> {
  await fetch(`${BASE}/${encodeURIComponent(id)}/simulate-login`, { method: "POST" });
}
export async function clearLog(id: string): Promise<void> {
  await fetch(`${BASE}/${encodeURIComponent(id)}/clear-log`, { method: "POST" });
}
