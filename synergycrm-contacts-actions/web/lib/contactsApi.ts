import { Contact } from "../types";

const base = "/api/contacts";

export async function listContacts(): Promise<Contact[]> {
  const res = await fetch(base, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  const data = await res.json();
  return data.items ?? data; // support both array and paged {items}
}

export async function createContact(input: Partial<Contact>): Promise<Contact> {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateContact(id: string, input: Partial<Contact>): Promise<Contact> {
  const res = await fetch(`${base}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${base}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
