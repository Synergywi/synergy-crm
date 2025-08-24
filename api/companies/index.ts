const companies: any[] = [
  { id: "c_001", name: "Acme Pty Ltd",    domain: "acme.example",    ownerId: "u_001" },
  { id: "c_002", name: "Globex Holdings", domain: "globex.example",  ownerId: "u_002" }
];

function json(res: any, status: number, body: any) {
  res.status = status;
  res.headers = { "content-type": "application/json" };
  res.body = JSON.stringify(body);
}

export default async function (context: any, req: any) {
  const { method, query, body } = req;

  if (method === "GET") {
    const q = (query?.q || "").toString().toLowerCase();
    const data = q ? companies.filter(c => c.name.toLowerCase().includes(q) || (c.domain||"").toLowerCase().includes(q)) : companies;
    return json(context.res, 200, { ok: true, count: data.length, companies: data });
  }

  if (method === "POST") {
    try {
      const payload = typeof body === "string" ? JSON.parse(body) : body || {};
      const { name, domain, ownerId } = payload;

      if (!name) return json(context.res, 400, { ok: false, error: "name is required" });

      const id = "c_" + Math.random().toString(36).slice(2, 8);
      const company = { id, name, domain: domain || null, ownerId: ownerId || null };
      companies.push(company);
      return json(context.res, 201, { ok: true, company });
    } catch {
      return json(context.res, 400, { ok: false, error: "Invalid JSON body" });
    }
  }

  return json(context.res, 405, { ok: false, error: "Method Not Allowed" });
}
