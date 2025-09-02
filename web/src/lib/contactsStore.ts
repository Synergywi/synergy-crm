// Simple in-memory demo data for Contacts

export type Contact = {
  id: string;
  name: string;
  email: string;
  companyId: string;
};

export const contacts: Contact[] = [
  { id: "ct1", name: "Bruce Wayne",  email: "bruce@wayne.com",   companyId: "co1" },
  { id: "ct2", name: "Diana Prince", email: "diana@embassy.org", companyId: "co2" },
];

export function getContacts(): Contact[] {
  return contacts;
}

export function getContact(id: string): Contact | null {
  return contacts.find(c => c.id === id) ?? null;
}
