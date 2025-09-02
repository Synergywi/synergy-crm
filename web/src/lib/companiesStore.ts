// Simple in-memory demo data for Companies

export type Company = {
  id: string;
  name: string;
  domain: string;
  city: string;
};

export const companies: Company[] = [
  { id: "co1", name: "Wayne Enterprises",    domain: "wayne.com",   city: "Gotham" },
  { id: "co2", name: "Themyscira Embassy",   domain: "embassy.org", city: "Washington DC" },
  { id: "co3", name: "Stark Industries",     domain: "stark.com",   city: "Malibu" },
];

export function getCompanies(): Company[] {
  return companies;
}

export function getCompany(id: string): Company | null {
  return companies.find(c => c.id === id) ?? null;
}
