// /web/lib/contactsApi.ts
export type Contact = {
  id: string;
  name: string;
  email?: string;
  company?: string;
  role?: string;
  phone?: string;
  notes?: string;
  lastSeen?: string;
};

const KEY = "synergy.contacts";

function read(): Contact[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function write(list: Contact[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function listContacts(): Promise<Contact[]> {
  return read();
}

export async function createContact(data: Partial<Contact>): Promise<Contact> {
  const list = read();
  const contact: Contact = {
    id: crypto.randomUUID(),
    name: data.name || "Unnamed",
    email: data.email || "",
    company: data.company || "",
    role: data.role || "",
    phone: data.phone || "",
    notes: data.notes || "",
    lastSeen: new Date().toISOString(),
  };
  list.push(contact);
  write(list);
  return contact;
}

export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact> {
  const list = read();
  const i = list.findIndex(c => c.id === id);
  if (i === -1) throw new Error("Not found");
  list[i] = { ...list[i], ...patch };
  write(list);
  return list[i];
}

export async function deleteContact(id: string): Promise<void> {
  write(read().filter(c => c.id !== id));
}

/** Optional: seed one example on first run */
export function seedOnce() {
  const list = read();
  if (list.length === 0) {
    write([{
      id: crypto.randomUUID(),
      name: "John",
      email: "jsmith@hotmail.com",
      lastSeen: new Date().toISOString()
    }]);
  }
}
