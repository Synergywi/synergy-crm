const { app } = require('@azure/functions');
const { container } = require('../_shared/cosmos');

app.http('contacts', {
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (req, ctx) => {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // works for /api/contacts/:id
    const method = req.method;

    try {
      if (method === 'GET') {
        if (id && id !== 'contacts') {
          const { resource } = await container.item(id, id).read();
          return { body: JSON.stringify(resource ?? null) };
        }
        const { resources } = await container.items.readAll().fetchAll();
        return { body: JSON.stringify(resources) };
      }

      if (method === 'POST') {
        const body = await req.json();
        const newContact = {
          id: crypto.randomUUID(),
          name: body.name,
          company: body.company ?? null,
          email: body.email ?? null,
          phone: body.phone ?? null,
          role: body.role ?? null,
          lastSeenTs: new Date().toISOString(),
        };
        await container.items.create(newContact);
        return { body: JSON.stringify(newContact) };
      }

      if (method === 'PATCH' && id && id !== 'contacts') {
        const body = await req.json();
        const { resource: existing } = await container.item(id, id).read();
        if (!existing) return { status: 404 };

        const updated = { ...existing, ...body };
        await container.item(id, id).replace(updated);
        return { body: JSON.stringify(updated) };
      }

      if (method === 'DELETE' && id && id !== 'contacts') {
        await container.item(id, id).delete();
        return { status: 204 };
      }

      return { status: 405 };
    } catch (err) {
      ctx.error(`Contacts API error: ${err.message}`);
      return { status: 500, body: JSON.stringify({ error: err.message }) };
    }
  },
});
