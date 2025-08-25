const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const { container } = require("../shared/cosmos");

async function json(status, body) {
  return { status, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(body) };
}

module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = context.bindingData && context.bindingData.id;

  if (method === "OPTIONS") return { status: 204, headers: cors };

  try {
    if (method === "GET") {
      if (id) {
        const { resource } = await container.item(String(id), String(id)).read();
        if (!resource) return json(404, { error: "Not found" });
        return json(200, resource);
      }
      // List all (limited)
      const query = { query: "SELECT TOP 100 * FROM c ORDER BY c._ts DESC" };
      const { resources } = await container.items.query(query).fetchAll();
      return json(200, resources);
    }

    if (method === "POST") {
      const b = req.body || {};
      if (!b.name || typeof b.name !== "string") return json(400, { error: "Field 'name' required" });
      const item = {
        id: String(b.id || Date.now()),
        name: b.name.trim(),
        website: b.website || null,
        createdAt: new Date().toISOString()
      };
      const { resource } = await container.items.upsert(item, { disableAutomaticIdGeneration: true });
      return json(201, resource);
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("companies error", err);
    return json(500, { error: "Internal Server Error", detail: String(err.message || err) });
  }
};
