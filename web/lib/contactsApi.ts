// /web/lib/contactsApi.ts

export type Contact = {
  id: string;
  // Newer fields
  givenNames?: string;
  surname?: string;

  // Legacy/compat field (some screens still show "name")
  name?: string;

  // Common profile details
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;

  // System fields
  lastSeen?: string | null;
};

const API_BASE = "/api";

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}${text ? ` – ${text}` : ""}`);
  }

  // 204 No Content handling
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

/** List all contacts (minimal list model) */
export function listContacts(): Promise<Contact[]> {
  return request<Contact[]>(`${API_BASE}/contacts`);
}

/** Get a single contact by id */
export function getContact(id: string): Promise<Contact> {
  return request<Contact>(`${API_BASE}/contacts/${encodeURIComponent(id)}`);
}

/**
 * Create a contact and return the created record.
 * Accepts either the new split fields (givenNames/surname) or a legacy `name`.
 */
export function addContact(payload: Partial<Contact>): Promise<Contact> {
  // If only a single `name` was provided, send it along; the API can split or store as-is
  return request<Contact>(`${API_BASE}/contacts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Patch/update fields on a contact. Returns the updated record. */
export function updateContact(
  id: string,
  patch: Partial<Contact>
): Promise<Contact> {
  return request<Contact>(`${API_BASE}/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** Delete a contact */
export function deleteContact(id: string): Promise<void> {
  return request<void>(`${API_BASE}/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** Utility actions used on the detail page */
export function simulateLogin(id: string): Promise<Contact> {
  return request<Contact>(
    `${API_BASE}/contacts/${encodeURIComponent(id)}/simulate-login`,
    { method: "POST" }
  );
}

export function clearLog(id: string): Promise<Contact> {
  return request<Contact>(
    `${API_BASE}/contacts/${encodeURIComponent(id)}/clear-log`,
    { method: "POST" }
  );
}
