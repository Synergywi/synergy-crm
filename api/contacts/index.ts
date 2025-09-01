import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { contacts, joinContactCompany } from "../shared/data";

export async function getContacts(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const joined = contacts.map(joinContactCompany);
  return { status: 200, jsonBody: joined };
}

app.http("contacts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "contacts",
  handler: getContacts
});
