// /web/lib/contactsApi.ts
// Clean, minimal API client used by Contacts & ContactDetail pages.

export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  lastSeen?: string | null;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

/** List all contacts */
export async function listContacts(): Promise<Contact[]> {
  return api<Contact[]>("/api/contacts");
}

/** Get a single contact */
export async function getContact(id: string): Promise<Contact> {
  return api<Contact>(`/api/contacts/${encodeURIComponent(id)}`);
}

/** Update a contact (partial patch) */
export async function updateContact(
  id: string,
  patch: Partial<Contact>
): Promise<Contact> {
  return api<Contact>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** Delete a contact */
export async function deleteContact(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function simulateLogin(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(
    `/api/contacts/${encodeURIComponent(id)}/simulate-login`,
    { method: "POST" }
  );
}

export async function clearLog(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(
    `/api/contacts/${encodeURIComponent(id)}/clear-log`,
    { method: "POST" }
  );
}
