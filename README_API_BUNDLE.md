# Synergy CRM API (long-term bundle)

- Workflow uses `npm install` with pinned versions for stability.
- Functions exposed via SWA `/api/*`:
  - GET `/api/ping`
  - POST `/api/seed`  (header: `x-seed-key: <SEED_ADMIN_KEY>`)
  - CRUD: `/api/companies`, `/api/contacts`, `/api/cases`
