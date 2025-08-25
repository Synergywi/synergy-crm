const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = context.bindingData && context.bindingData.id;

  if (method === "OPTIONS") {
    return { status: 204, headers: cors };
  }

  if (method === "GET") {
    const data = [
      { id: 1, name: "Synergy Test Company", website: "https://synergywi.com.au", createdAt: new Date().toISOString() }
    ];
    if (id) {
      const item = data.find(d => String(d.id) === String(id));
      if (!item) return { status: 404, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify({ error: "Not found" }) };
      return { status: 200, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(item) };
    }
    return { status: 200, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(data) };
  }

  if (method === "POST") {
    const body = req.body || {};
    const created = { id: Date.now(), name: body.name || "Untitled", website: body.website || null, createdAt: new Date().toISOString() };
    return { status: 201, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify(created) };
  }

  return { status: 405, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify({ error: "Method not allowed" }) };
};
