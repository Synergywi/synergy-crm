// Minimal in-memory store + helpers for Contacts.
// Provides subscribe/get/set functions and async loaders that call contactsApi.

import type { Contact } from '../types'
import * as contactsApi from './contactsApi'

type Listener = () => void

type ContactsState = {
  all: Contact[]
  byId: Map<string, Contact>
  loading: boolean
  error: string | null
}

const state: ContactsState = {
  all: [],
  byId: new Map(),
  loading: false,
  error: null,
}

const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l()
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState(): ContactsState {
  return state
}

function set(partial: Partial<ContactsState>) {
  Object.assign(state, partial)
  emit()
}

// ---------- Async actions ----------

export async function loadAll() {
  try {
    set({ loading: true, error: null })
    const rows = await contactsApi.listContacts()
    const byId = new Map<string, Contact>()
    rows.forEach((c) => byId.set(c.id, c))
    set({ all: rows, byId, loading: false })
    return rows
  } catch (e: any) {
    set({ loading: false, error: e?.message ?? 'Failed to load contacts' })
    throw e
  }
}

export async function loadOne(id: string) {
  try {
    set({ loading: true, error: null })
    const c = await contactsApi.getContact(id)
    // merge into state
    const nextById = new Map(state.byId)
    nextById.set(c.id, c)
    const idx = state.all.findIndex((x) => x.id === c.id)
    const nextAll = [...state.all]
    if (idx >= 0) nextAll[idx] = c
    else nextAll.unshift(c)
    set({ all: nextAll, byId: nextById, loading: false })
    return c
  } catch (e: any) {
    set({ loading: false, error: e?.message ?? 'Failed to load contact' })
    throw e
  }
}

export async function createOne(input: Partial<Contact>) {
  const created = await contactsApi.createContact(input)
  const nextAll = [created, ...state.all]
  const nextById = new Map(state.byId)
  nextById.set(created.id, created)
  set({ all: nextAll, byId: nextById })
  return created
}

export async function updateOne(id: string, input: Partial<Contact>) {
  const updated = await contactsApi.updateContact(id, input)
  const idx = state.all.findIndex((x) => x.id === id)
  const nextAll = [...state.all]
  if (idx >= 0) nextAll[idx] = updated
  const nextById = new Map(state.byId)
  nextById.set(updated.id, updated)
  set({ all: nextAll, byId: nextById })
  return updated
}

export async function deleteOne(id: string) {
  await contactsApi.deleteContact(id)
  const nextAll = state.all.filter((x) => x.id !== id)
  const nextById = new Map(state.byId)
  nextById.delete(id)
  set({ all: nextAll, byId: nextById })
}
