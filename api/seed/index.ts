import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, http } from "../shared/cosmos";
import companies from "./data/companies.json";
import contacts from "./data/contacts.json";
import cases from "./data/cases.json";
import users from "./data/users.json";

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
  const adminKey = process.env.SEED_ADMIN_KEY;
  const headerKey = (req.headers["x-seed-key"] || req.headers["X-Seed-Key"]) as string | undefined;
  if (!adminKey || headerKey !== adminKey) {
    context.res = { status: 401, body: { error: "Unauthorized" } };
    return;
  }

  const [co, ct, cs, us] = await Promise.all([
    getContainer("companies", "/id"),
    getContainer("contacts", "/companyId"),
    getContainer("cases", "/companyId"),
    getContainer("users", "/email")
  ]);

  // Upsert data
  await Promise.all([
    ...companies.map((d: any) => co.items.upsert(d)),
    ...contacts.map((d: any) => ct.items.upsert(d)),
    ...cases.map((d: any) => cs.items.upsert(d)),
    ...users.map((d: any) => us.items.upsert(d))
  ]);

  context.res = http.ok({ seeded: true, counts: {
    companies: companies.length, contacts: contacts.length, cases: cases.length, users: users.length
  }});
};

export default httpTrigger;
