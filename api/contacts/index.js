const { db } = require("../shared/cosmos"); // uses your shared Cosmos client

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const json = (status, body) => ({
  status,
  headers: { "Content-Type": "application/json", ...CORS },
  body: JSON.stringify(body)
});

// If your container has a different name, set CONTACTS_CONTAINER in SWA env vars
const CONTACTS_CONTAINER = process.env.CONTACTS_CONTAINER || "contacts";
const container = db.container(CONTACTS_CONTAINER);

module.exports = async function (context, req) {
  const method = (req?.method || "GET").toUpperCase();
  const id = context?.bindingData?.id;

  if (method === "OPTIONS") return { status: 204, headers: CORS };

  try {
    if (method === "GET") {
      if (id) {
        const { resource } = await container.item(String(id), String(id)).read();
        if (!resource) return json(404, { error: "Not found" });
        return json(200, resource);
      }
      const query = { query: "SELECT TOP 100 * FROM c ORDER BY c._ts DESC" };
      const { resources } = await container.items.query(query).fetchAll();
      return json(200, resources);
    }

    if (method === "POST") {
      const b = req.body || {};
      if (!b.name || typeof b.name !== "string") {
        return json(400, { error: "Field 'name' required" });
      }

      const item = {
        id: String(b.id || Date.now()),   // partition key /id
        name: b.name.trim(),
        email: b.email || null,
        companyId: b.companyId || null,
        lastSeen: b.lastSeen || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const { resource } = await container.items.create(item);
      return json(201, resource);
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("contacts error", err);
    return json(500, { error: "Internal Server Error", detail: String(err?.message || err) });
  }
};
