const container = require("../shared/cosmos");

function json(status, body) {
  return {
    status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = context.bindingData && context.bindingData.id;

  try {
    if (method === "OPTIONS") {
      return { status: 204 };
    }

    if (method === "GET") {
      if (id) {
        const { resource } = await container.item(id, id).read();
        if (!resource) return json(404, { error: "Not found" });
        return json(200, resource);
      } else {
        const query = { query: "SELECT TOP 100 * FROM c ORDER BY c._ts DESC" };
        const { resources } = await container.items.query(query).fetchAll();
        return json(200, resources);
      }
    }

    if (method === "POST") {
      const b = req.body || {};
      if (!b.name || typeof b.name !== "string") {
        return json(400, { error: "Field 'name' required" });
      }

      const newItem = {
        id: b.id || Date.now().toString(), // always give Cosmos an id
        name: b.name.trim(),
        website: b.website || null,
        createdAt: new Date().toISOString()
      };

      const { resource } = await container.items.upsert(newItem, {
        disableAutomaticIdGeneration: false
      });

      return json(201, resource);
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("companies error", err);
    return json(500, { error: "Internal Server Error", detail: err.message || err });
  }
};
