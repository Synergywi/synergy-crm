# Synergy CRM - Contacts Add/Edit/Delete (Drop-in)

This zip contains:
- **Azure Functions API** for `contacts` with CRUD routes backed by Cosmos DB (partition key `/id`).
- **React components** to show a Contacts table with **Add**, **Edit**, and **Delete** actions.

## API (Azure Static Web Apps / Azure Functions)

**Files**: `api/contacts/index.ts`, `api/contacts/function.json`, `api/_shared/cosmos.ts`

- Route base: `/api/contacts`
- Routes:
  - `GET /api/contacts` — list contacts (ordered by `updatedAt`)
  - `GET /api/contacts/{id}` — get one
  - `POST /api/contacts` — create (requires `firstName`, `lastName`)
  - `PUT /api/contacts/{id}` — update
  - `DELETE /api/contacts/{id}` — delete

**Environment variables** (configure in Azure or `local.settings.json`):
- `COSMOS_CONNECTION_STRING` — connection string with permissions for the DB
- `COSMOS_DB` — default `synergycrm`
- `COSMOS_CONTAINER_CONTACTS` — default `contacts` (container must use partition key `/id`)

> The function `authLevel` is set to `anonymous` for Static Web Apps. If you need stricter auth, change it to `function` or implement your own checks.

## Web

**Files** (place inside your app):
- `web/components/ContactsTable.tsx`
- `web/components/AddEditContactModal.tsx`
- `web/lib/contactsApi.ts`
- `web/pages/contacts.tsx` (for Next.js Pages Router; adapt as needed)
- `web/types.ts`

The components assume **Tailwind CSS** is available for styling. They call the API at `/api/contacts` which is the default SWA convention.

## Notes
- IDs are created with `crypto.randomUUID()`.
- Timestamps are ISO strings (`createdAt`, `updatedAt`).
- List endpoint supports simple paging via `continuationToken` if you extend the UI; currently it just fetches the first page.
- If your API is already TypeScript, this should compile during your build. Ensure the Functions build outputs `index.js` alongside `function.json`.

## Quick test (locally)
1. Set `COSMOS_CONNECTION_STRING` and ensure the `contacts` container exists with partition key `/id`.
2. Start your Static Web App or Functions runtime.
3. Open the `/contacts` page (Next.js) and try add/edit/delete.

Happy shipping!
