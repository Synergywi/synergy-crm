import { Contact, Company } from "./types";

export const companies: Company[] = [
  { id: "co_wayne", name: "Wayne Enterprises", domain: "wayne.com" },
  { id: "co_themyscira", name: "Themyscira Embassy", domain: "embassy.org" }
];

export const contacts: Contact[] = [
  { id:"ct_brucie", givenName:"Bruce", surname:"Wayne", email:"bruce@wayne.com", companyId:"co_wayne" },
  { id:"ct_diana", givenName:"Diana", surname:"Prince", email:"diana@embassy.org", companyId:"co_themyscira" }
];

export function joinContactCompany(c: Contact){
  const co = companies.find(x=>x.id===c.companyId);
  return { ...c, companyName: co?.name };
}
