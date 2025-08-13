
# Synergy CRM v15.3 (with API)

This build adds **Contacts** and **Companies** API endpoints backed by Azure Functions.

- API base path: `/api`
  - `GET /api/contacts` — list contacts
  - `POST /api/contacts` — create (JSON body)
  - `PUT /api/contacts/{id}` — update (JSON body)
  - `GET /api/companies` — list companies
  - `POST /api/companies` — create
  - `PUT /api/companies/{id}` — update

The front‑end automatically tries to **load** contacts & companies from `/api` at boot and **falls back** to local demo data if the API is offline.

> Demo store is in‑memory (resets on cold start). Wire to Cosmos DB next for persistence.

## Deploy to Azure Static Web Apps

In your SWA configuration:
- **App location**: `/`
- **API location**: `/api`

Push this folder to GitHub and connect it to your Static Web App.
