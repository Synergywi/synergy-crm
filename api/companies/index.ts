/** 
 * Companies HTTP Function
 * Supports:
 *  - GET /api/companies            -> list
 *  - GET /api/companies/{id}       -> single
 *  - POST /api/companies           -> create (demo)
 * Also responds to OPTIONS for CORS preflight.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

module.exports = async function (context, req) {
  const method = (req.method || "GET").toUpperCase();
  const id = (context.bindingData && context.bindingData.id) || null;

  // Preflight / CORS
  if (method === "OPTIONS") {
    return { status: 204, headers: corsHeaders };
  }

  try {
    if (method === "GET") {
      if (id) {
        // Demo: pretend to fetch one company
        const item = fakeCompanies().find(c => String(c.id) === String(id));
        if (!item) {
          return json(404, { error: "Company not found" });
        }
        return json(200, item);
      } else {
        // Demo: pretend to fetch a list
        return json(200, fakeCompanies());
      }
    }

    if (method === "POST") {
      const body = req.body || {};
      // Minimal validation
      if (!body.name || typeof body.name !== "string") {
        return json(400, { error: "Field 'name' is required (string)" });
      }

      // Demo: create a new company (normally you'd write to a DB)
      const created = {
        id: Date.now(),
        name: body.name.trim(),
        website: body.website || null,
        createdAt: new Date().toISOString()
      };

      return json(201, created);
    }

    // Method not allowed
    return json(405, { error: "Method not allowed" }, { Allow: "GET, POST, OPTIONS" });
  } catch (err) {
    context.log.error("companies error", err);
    return json(500, { error: "Internal Server Error" });
  }
};

// ---- helpers

function json(status, data, extraHeaders = {}) {
  return {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extraHeaders },
    body: JSON.stringify(data)
  };
}

function fakeCompanies() {
  return [
    { id: 1, name: "Synergy Widgets", website: "https://synergywi.com.au" },
    { id: 2, name: "Contoso Pty Ltd", website: "https://contoso.example" },
    { id: 3, name: "Northwind Traders", website: null }
  ];
}
