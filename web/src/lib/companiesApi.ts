// REST client for Companies (Azure Functions under /api)
import api from './api'
import type { Company } from '../types'

export async function listCompanies(): Promise<Company[]> {
  return api.get<Company[]>('/companies')
}
export async function getCompany(id: string): Promise<Company> {
  return api.get<Company>(`/companies/${encodeURIComponent(id)}`)
}
export async function createCompany(input: Partial<Company>): Promise<Company> {
  return api.post<Company>('/companies', input)
}
export async function updateCompany(id: string, input: Partial<Company>): Promise<Company> {
  return api.put<Company>(`/companies/${encodeURIComponent(id)}`, input)
}
export async function deleteCompany(id: string): Promise<void> {
  return api.del<void>(`/companies/${encodeURIComponent(id)}`)
}
