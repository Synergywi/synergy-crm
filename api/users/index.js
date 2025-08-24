// Simple in-memory store for now (swap with real DB later)
const store: any[] = [
  { id: "u_001", firstName: "Ava", lastName: "Nguyen", email: "ava@example.com" },
  { id: "u_002", firstName: "Leo", lastName: "Khan",   email: "leo@example.com" },
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
    const data = q
      ? store.filter(
          u =>
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
      : store;

    return json(context.res, 200, { ok: true, count: data.length, users: data });
  }

  if (method === "POST") {
    try {
      const payload = typeof body === "string" ? JSON.parse(body) : body || {};
      const { firstName, lastName, email } = payload;

      if (!firstName || !lastName || !email) {
        return json(context.res, 400, { ok: false, error: "firstName, lastName, and email are required" });
      }

      const id = "u_" + Math.random().toString(36).slice(2, 8);
      const user = { id, firstName, lastName, email };
      store.push(user);
      return json(context.res, 201, { ok: true, user });
    } catch (e: any) {
      return json(context.res, 400, { ok: false, error: "Invalid JSON body" });
    }
  }

  return json(context.res, 405, { ok: false, error: "Method Not Allowed" });
}
