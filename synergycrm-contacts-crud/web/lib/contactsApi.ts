
export type Contact = {
  id?: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  lastSeen?: string;
};

const base = "/api/contacts";

export async function listContacts(): Promise<Contact[]> {
  const r = await fetch(base, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`List failed: ${r.status}`);
  return r.json();
}

export async function createContact(input: Contact): Promise<Contact> {
  const r = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`Create failed: ${r.status}`);
  return r.json();
}

export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact> {
  const r = await fetch(`${base}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Update failed: ${r.status}`);
  return r.json();
}

export async function deleteContact(id: string): Promise<void> {
  const r = await fetch(`${base}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
}
