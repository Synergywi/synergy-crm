// api/contacts/index.js
const { CosmosClient } = require("@azure/cosmos");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(status, body) {
  return { status, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(body) };
}

function required(name, val) {
  if (val == null || val === "") throw new Error(`Missing required field: ${name}`);
}

function getClient() {
  const conn = process.env.COSMOS_CONNECTION_STRING;
  required("COSMOS_CONNECTION_STRING", conn);
  return new CosmosClient(conn);
}

async function getContainer() {
  const dbName = process.env.COSMOS_DB || "synergycrm";
  // Use a dedicated contacts container to avoid collisions with companies
  const containerName = process.env.COSMOS_CONTACTS_CONTAINER || "contacts";
  const client = getClient();
  const { database } = await client.databases.createIfNotExists({ id: dbName });
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: { paths: ["/id"] }, // we standardized on /id
    throughput: 400,
  });
  return container;
}

module.exports = async function (context, req) {
  try {
    const method = (req.method || "GET").toUpperCase();
    if (method === "OPTIONS") return json(204, {});

    const container = await getContainer();

    // GET /api/contacts or /api/contacts?id=123
    if (method === "GET") {
      const id = (req.query && req.query.id) || (context.bindingData && context.bindingData.id);
      if (id) {
        try {
          const { resource } = await container.item(String(id), String(id)).read();
          if (!resource) return json(404, { error: "Not found" });
          return json(200, resource);
        } catch (e) {
          if (e.code === 404) return json(404, { error: "Not found" });
          throw e;
        }
      } else {
        const query = {
          query: "SELECT TOP 200 c.id, c.name, c.company, c.email, c.phone, c.role, c.lastSeen FROM c ORDER BY c._ts DESC",
        };
        const { resources } = await container.items.query(query).fetchAll();
        return json(200, resources || []);
      }
    }

    // POST /api/contacts
    if (method === "POST") {
      const b = req.body || {};
      required("name", b.name);
      const now = new Date().toISOString();
      const item = {
        id: String(b.id || Date.now()),
        name: String(b.name).trim(),
        company: b.company || null,
        email: b.email || null,
        phone: b.phone || null,
        role: b.role || null,
        lastSeen: b.lastSeen || null,
        createdAt: now,
        updatedAt: now,
        type: "contact",
      };
      const { resource } = await container.items.upsert(item, { disableAutomaticIdGeneration: true });
      return json(201, resource);
    }

    // PATCH /api/contacts
    if (method === "PATCH") {
      const b = req.body || {};
      required("id", b.id);
      const id = String(b.id);
      const { resource: existing } = await container.item(id, id).read();
      if (!existing) return json(404, { error: "Not found" });

      const updated = {
        ...existing,
        ...(b.name !== undefined ? { name: b.name } : {}),
        ...(b.company !== undefined ? { company: b.company } : {}),
        ...(b.email !== undefined ? { email: b.email } : {}),
        ...(b.phone !== undefined ? { phone: b.phone } : {}),
        ...(b.role !== undefined ? { role: b.role } : {}),
        ...(b.lastSeen !== undefined ? { lastSeen: b.lastSeen } : {}),
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await container.items.upsert(updated, { disableAutomaticIdGeneration: true });
      return json(200, resource);
    }

    // DELETE /api/contacts?id=123
    if (method === "DELETE") {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      required("id", id);
      await container.item(String(id), String(id)).delete();
      return json(204, {});
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("contacts.error", err);
    return json(500, { error: "Internal Server Error", detail: String(err.message || err) });
  }
};
