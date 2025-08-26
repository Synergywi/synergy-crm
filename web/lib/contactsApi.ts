// Simple typed fetch helpers for /api/contacts
export interface ContactPayload {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  lastSeen?: string;
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getContacts() {
  // GET /api/contacts  -> Contact list
  return http<ContactPayload[]>("/api/contacts");
}

export async function addContact(payload: ContactPayload) {
  // POST /api/contacts  -> create
  return http<ContactPayload>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContact(id: string, payload: ContactPayload) {
  // PATCH /api/contacts/:id  -> update
  return http<ContactPayload>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteContact(id: string) {
  // DELETE /api/contacts/:id  -> delete
  return http<{ ok: true }>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
