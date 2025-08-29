// /web/lib/contactsApi.ts

export type Contact = {
  id: string;
  givenNames: string;
  surname: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  notes?: string | null;
  lastSeen?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactInput = Omit<Contact, "id" | "createdAt" | "updatedAt">;

const JSON_HEADERS: Record<string, string> = { "Content-Type": "application/json" };

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    // Try to surface server text to the UI
    const msg = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${msg ? ` – ${msg}` : ""}`);
  }
  // Some endpoints may return 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// ---- CRUD ---------------------------------------------------------------

export async function listContacts(): Promise<Contact[]> {
  // GET /api/contacts
  return http<Contact[]>("/api/contacts");
}

export async function getContact(id: string): Promise<Contact> {
  // GET /api/contacts/{id}
  return http<Contact>(`/api/contacts/${encodeURIComponent(id)}`);
}

export async function addContact(input: ContactInput): Promise<Contact> {
  // POST /api/contacts
  return http<Contact>("/api/contacts", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  // PUT /api/contacts/{id}
  return http<Contact>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export async function deleteContact(id: string): Promise<void> {
  // DELETE /api/contacts/{id}
  await http<void>(`/api/contacts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
