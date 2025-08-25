export async function getContacts() {
  const res = await fetch("/api/contacts");
  return res.json();
}

export async function addContact(contact: any) {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  return res.json();
}

export async function updateContact(id: string, updates: any) {
  const res = await fetch(`/api/contacts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteContact(id: string) {
  await fetch(`/api/contacts/${id}`, { method: "DELETE" });
}