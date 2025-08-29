// Lightweight Contacts API client that talks to your Azure Functions under /api
import api from './api'
import type { Contact } from '../types'

export async function listContacts(): Promise<Contact[]> {
  return api.get<Contact[]>('/contacts')
}

export async function getContact(id: string): Promise<Contact> {
  return api.get<Contact>(`/contacts/${encodeURIComponent(id)}`)
}

export async function createContact(input: Partial<Contact>): Promise<Contact> {
  return api.post<Contact>('/contacts', input)
}

export async function updateContact(id: string, input: Partial<Contact>): Promise<Contact> {
  return api.put<Contact>(`/contacts/${encodeURIComponent(id)}`, input)
}

export async function deleteContact(id: string): Promise<void> {
  return api.del<void>(`/contacts/${encodeURIComponent(id)}`)
}

// Optional: convenience upsert
export async function upsertContact(input: Contact): Promise<Contact> {
  return input.id ? updateContact(input.id, input) : createContact(input)
}
