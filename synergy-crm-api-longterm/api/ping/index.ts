import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
  context.res = { status: 200, body: { ok: true, method: req.method, db: process.env.COSMOS_DB_NAME || "(none)" } };
};
export default httpTrigger;
