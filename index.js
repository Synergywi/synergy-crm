
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = (context.bindingData && context.bindingData.id) || null;

  if (method === "OPTIONS") {
    return { status: 204, headers: corsHeaders };
  }

  try {
    if (method === "GET") {
      if (id) {
        const item = fakeCompanies().find(c => String(c.id) === String(id));
        if (!item) return json(404, { error: "Company not found" });
        return json(200, item);
      } else {
        return json(200, fakeCompanies());
      }
    }

    if (method === "POST") {
      const body = req.body || {};
      if (!body.name || typeof body.name !== "string") {
        return json(400, { error: "Field 'name' is required (string)" });
      }
      const created = {
        id: Date.now(),
        name: body.name.trim(),
        website: body.website || null,
        createdAt: new Date().toISOString()
      };
      return json(201, created);
    }

    return json(405, { error: "Method not allowed" }, { Allow: "GET, POST, OPTIONS" });
  } catch (err) {
    context.log.error("companies error", err);
    return json(500, { error: "Internal Server Error" });
  }
};

function json(status, data, extraHeaders = {}) {
  return {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extraHeaders },
    body: JSON.stringify(data)
  };
}

function fakeCompanies() {
  return [
    { id: 1, name: "Synergy Widgets", website: "https://synergywi.com.au", createdAt: new Date().toISOString() },
    { id: 2, name: "Contoso Pty Ltd", website: "https://contoso.example", createdAt: new Date().toISOString() },
    { id: 3, name: "Northwind Traders", website: null, createdAt: new Date().toISOString() }
  ];
}
