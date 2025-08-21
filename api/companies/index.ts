import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, http } from "../shared/cosmos";

const PK = "/id";

const handler: AzureFunction = async (context: Context, req: HttpRequest) => {
  const c = await getContainer("companies", PK);
  const id = context.bindingData.id as string | undefined;
  const method = (req.method || "GET").toUpperCase();

  try {
    if (method === "GET") {
      if (id) {
        const { resource } = await c.item(id, id).read();
        context.res = resource ? http.ok(resource) : http.notfound();
      } else {
        const { resources } = await c.items.query({ query: "SELECT * FROM c" }).fetchAll();
        context.res = http.ok(resources);
      }
      return;
    }

    if (method === "POST") {
      const body = req.body;
      if (!body?.id || !body?.name) { context.res = http.bad("id, name required"); return; }
      const { resource } = await c.items.create(body);
      context.res = http.created(resource);
      return;
    }

    if (method === "PATCH") {
      if (!id) { context.res = http.bad("id required"); return; }
      const { resource } = await c.item(id, id).read();
      if (!resource) { context.res = http.notfound(); return; }
      const updated = { ...resource, ...req.body };
      const { resource: saved } = await c.items.upsert(updated);
      context.res = http.ok(saved);
      return;
    }

    if (method === "DELETE") {
      if (!id) { context.res = http.bad("id required"); return; }
      await c.item(id, id).delete();
      context.res = http.ok({ id });
      return;
    }

    context.res = http.bad("Unsupported method");
  } catch (e: any) {
    context.log.error(e);
    context.res = { status: 500, body: { error: e.message } };
  }
};

export default handler;
