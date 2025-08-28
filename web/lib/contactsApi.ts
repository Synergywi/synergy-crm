// /web/lib/contactsApi.ts
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

const KEY = "contacts.v1";

function load(): Contact[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Contact[];
  } catch {
    return seed();
  }
}

function save(list: Contact[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function seed(): Contact[] {
  const seeded: Contact[] = [
    { id: "c-1", name: "John", email: "jsmith@hotmail.com", lastSeen: "2025-08-25T22:03:30.593Z" },
  ];
  save(seeded);
  return seeded;
}

export async function listContacts(): Promise<Contact[]> {
  return load();
}

export async function addContact(input: Partial<Contact>): Promise<Contact> {
  const list = load();
  const c: Contact = {
    id: `c-${Date.now()}`,
    name: input.name?.trim() || "New Contact",
    email: input.email?.trim(),
    phone: input.phone?.trim(),
    company: input.company?.trim(),
    role: input.role?.trim(),
    notes: input.notes?.trim(),
    lastSeen: null,
  };
  list.unshift(c);
  save(list);
  return c;
}

export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact | null> {
  const list = load();
  const i = list.findIndex(c => c.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...patch };
  save(list);
  return list[i];
}

export async function deleteContact(id: string): Promise<void> {
  save(load().filter(c => c.id !== id));
}

export async function simulateLogin(id: string): Promise<void> {
  await updateContact(id, { lastSeen: new Date().toISOString() });
}

export async function clearLog(id: string): Promise<void> {
  await updateContact(id, { lastSeen: null });
}
