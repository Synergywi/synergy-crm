// web/src/types.ts

// Core domain models
export type Contact = {
  id: string
  givenNames: string
  surname: string
  phone?: string
  email?: string
  company?: string
  lastSeen?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// Add more as you build out:
export type Company = {
  id: string
  name: string
  domain?: string
  createdAt?: string
  updatedAt?: string
}

// Generic helpers (optional)
export type Id = string
export type ApiList<T> = T[] // swap to {items:T[], next?:string} if you paginate later
