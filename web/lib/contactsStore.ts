// web/lib/contactsStore.ts
export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  lastSeen?: string; // ISO
};

const STORAGE_KEY = "synergycrm.contacts.v1";

function load(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Contact[]) : [];
  } catch {
    return [];
  }
}

function save(list: Contact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function listContacts(): Contact[] {
  return load().sort((a, b) => a.name.localeCompare(b.name));
}

export function getContact(id: string): Contact | undefined {
  return load().find(c => c.id === id);
}

export function createContact(input: Omit<Contact, "id">): Contact {
  const all = load();
  const contact: Contact = {
    id: (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    lastSeen: input.lastSeen ?? new Date().toISOString(),
    ...input,
  };
  all.push(contact);
  save(all);
  return contact;
}

export function updateContact(id: string, updates: Partial<Contact>): Contact {
  const all = load();
  const i = all.findIndex(c => c.id === id);
  if (i === -1) throw new Error("Contact not found");
  const updated = { ...all[i], ...updates };
  all[i] = updated;
  save(all);
  return updated;
}

export function deleteContact(id: string) {
  save(load().filter(c => c.id !== id));
}

// seed demo row if empty (first run)
export function ensureSeed() {
  if (load().length) return;
  save([
    {
      id: (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}-seed`,
      name: "Alex Ng",
      email: "alex@synergy.com",
      company: "Sunrise Mining Pty Ltd",
      role: "Investigator",
      phone: "07 345 5678",
      lastSeen: new Date().toISOString(),
    },
  ]);
}
