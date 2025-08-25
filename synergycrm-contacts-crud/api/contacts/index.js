const container = require("../_shared/cosmos")("contacts");
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

function json(status, body) {
  return { status, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(body) };
}

module.exports = async function (context, req) {
  const method = (req.method || "").toUpperCase();
  const id = context.bindingData.id;

  if (method === "OPTIONS") return { status: 204, headers: cors };

  try {
    if (method === "GET") {
      if (id) {
        const { resource } = await container.item(id, id).read();
        return resource ? json(200, resource) : json(404, { error: "Not found" });
      }
      const { resources } = await container.items.query("SELECT * FROM c").fetchAll();
      return json(200, resources);
    }

    if (method === "POST") {
      const body = req.body || {};
      if (!body.name) return json(400, { error: "Name is required" });
      const item = { id: String(Date.now()), ...body, createdAt: new Date().toISOString() };
      const { resource } = await container.items.upsert(item);
      return json(201, resource);
    }

    if (method === "PATCH") {
      if (!id) return json(400, { error: "ID required" });
      const body = req.body || {};
      const { resource: existing } = await container.item(id, id).read();
      if (!existing) return json(404, { error: "Not found" });
      const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
      const { resource } = await container.items.upsert(updated);
      return json(200, resource);
    }

    if (method === "DELETE") {
      if (!id) return json(400, { error: "ID required" });
      await container.item(id, id).delete();
      return json(204, {});
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    context.log.error("contacts error", err);
    return json(500, { error: "Server error", detail: err.message });
  }
};