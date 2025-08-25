import type { Context, HttpRequest } from "@azure/functions";
import { getContactsContainer } from "../_shared/cosmos";
import crypto from "node:crypto";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function ok(body: any, status = 200) {
  return { status, body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...CORS_HEADERS } };
}
function err(body: any, status = 400) {
  return { status, body: JSON.stringify({ error: body }), headers: { "Content-Type": "application/json", ...CORS_HEADERS } };
}

export default async function (context: Context, req: HttpRequest): Promise<any> {
  if (req.method === "OPTIONS") {
    return { status: 204, headers: CORS_HEADERS };
  }

  const container = getContactsContainer();
  const id = context.bindingData?.id as string | undefined;

  try {
    switch ((req.method || "GET").toUpperCase()) {
      case "GET": {
        if (id) {
          const { resource } = await container.item(id, id).read<Contact>();
          if (!resource) return err(`Contact ${id} not found`, 404);
          return ok(resource);
        }
        const pageSize = Number(req.query?.pageSize || 50);
        const continuation = req.query?.continuationToken;
        const query = {
          query: "SELECT * FROM c ORDER BY c.updatedAt DESC",
        };
        const options: any = { maxItemCount: pageSize };
        if (continuation) options.continuationToken = continuation;

        const iterator = container.items.query<Contact>(query, options);
        const { resources, continuationToken } = await iterator.fetchNext();
        return ok({ items: resources, continuationToken });
      }

      case "POST": {
        const body = req.body || {};
        if (!body.firstName || !body.lastName) return err("firstName and lastName are required", 422);

        const now = new Date().toISOString();
        const contact: Contact = {
          id: body.id || crypto.randomUUID(),
          firstName: String(body.firstName),
          lastName: String(body.lastName),
          email: body.email ? String(body.email) : undefined,
          phone: body.phone ? String(body.phone) : undefined,
          companyId: body.companyId ? String(body.companyId) : undefined,
          createdAt: now,
          updatedAt: now
        };

        const { resource } = await container.items.create<Contact>(contact);
        return ok(resource, 201);
      }

      case "PUT": {
        if (!id) return err("id path parameter required", 400);
        const { resource: existing } = await container.item(id, id).read<Contact>();
        if (!existing) return err(`Contact ${id} not found`, 404);

        const body = req.body || {};
        const updated: Contact = {
          ...existing,
          ...body,
          id: existing.id, // do not allow id change
          updatedAt: new Date().toISOString()
        };
        const { resource } = await container.item(id, id).replace<Contact>(updated);
        return ok(resource);
      }

      case "DELETE": {
        if (!id) return err("id path parameter required", 400);
        await container.item(id, id).delete();
        return ok({ ok: true, id });
      }

      default:
        return err("Method not allowed", 405);
    }
  } catch (e: any) {
    context.log.error("contacts api error", e?.message || e);
    return err(e?.message || "Unexpected error", 500);
  }
}
