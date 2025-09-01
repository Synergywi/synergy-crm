import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { companies } from "../shared/data";

export async function getCompanies(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  return { status: 200, jsonBody: companies };
}

app.http("companies", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "companies",
  handler: getCompanies
});
