/**
 * Contacts CRUD (GET, POST, PATCH, DELETE)
 * Uses Cosmos DB container "contacts" with partition key "/id"
 */
const { CosmosClient } = require("@azure/cosmos");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(status, body) {
  return { status, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(body) };
}

function getCosmos() {
  const conn = process.env.COSMOS_CONNECTION_STRING;
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const dbName = process.env.COSMOS_DB || "crm";
  const containerName = "contacts";

  const client = conn ? new CosmosClient({ endpoint: undefined, key: undefined, connectionString: conn }) : new CosmosClient({ endpoint, key });
  const database = client.database(dbName);
  const container = database.container(containerName);
  return { client, database, container };
}

module.exports = async function (context, req) {
  try {
    if ((req.method || "").toUpperCase() === "OPTIONS") {
      context.res = { status: 204, headers: cors };
      return;
    }

    const id = (context.bindingData && context.bindingData.id) ? String(context.bindingData.id) : null;
    const { container } = getCosmos();

    // GET /api/contacts or /api/contacts/{id}
    if (req.method === "GET") {
      if (id) {
        try {
          const { resource } = await container.item(id, id).read();
          if (!resource) {
            context.res = json(404, { error: "Not found" });
          } else {
            context.res = json(200, resource);
          }
        } catch (e) {
          if (e.code === 404) context.res = json(404, { error: "Not found" });
          else throw e;
        }
      } else {
        const query = { query: "SELECT TOP 200 c.id, c.name, c.email, c.companyId, c.lastSeen, c.createdAt FROM c ORDER BY c._ts DESC" };
        const { resources } = await container.items.query(query).fetchAll();
        context.res = json(200, resources || []);
      }
      return;
    }

    // POST /api/contacts
    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.name || typeof b.name !== "string") {
        context.res = json(400, { error: "Field 'name' required" });
        return;
      }
      const item = {
        id: String(b.id || Date.now()),
        name: b.name.trim(),
        email: b.email || null,
        companyId: b.companyId || null,
        createdAt: new Date().toISOString(),
      };
      const { resource } = await container.items.upsert(item, { disableAutomaticIdGeneration: true });
      context.res = json(201, resource);
      return;
    }

    // PATCH /api/contacts/{id}
    if (req.method === "PATCH") {
      if (!id) { context.res = json(400, { error: "Missing id" }); return; }
      const b = req.body || {};
      // read current
      const { resource: existing } = await container.item(id, id).read();
      if (!existing) { context.res = json(404, { error: "Not found" }); return; }
      // merge
      const updated = {
        ...existing,
        name: (typeof b.name === "string" && b.name.trim()) || existing.name,
        email: (b.email === null ? null : (b.email || existing.email)),
        companyId: (b.companyId === null ? null : (b.companyId || existing.companyId)),
      };
      const { resource } = await container.items.upsert(updated, { disableAutomaticIdGeneration: true });
      context.res = json(200, resource);
      return;
    }

    // DELETE /api/contacts/{id}
    if (req.method === "DELETE") {
      if (!id) { context.res = json(400, { error: "Missing id" }); return; }
      await container.item(id, id).delete();
      context.res = json(204, {});
      return;
    }

    context.res = json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("contacts error", err);
    context.res = json(500, { error: "Internal Server Error", detail: String(err.message || err) });
  }
};
