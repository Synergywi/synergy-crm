
# Synergy CRM (Starter)

- Vite + React + TS front-end
- Azure Functions API (`/api/companies`) with GET/POST
- SPA routing + fallback via `staticwebapp.config.json`

## Run locally
```bash
npm install
npm run dev
```
Open the printed URL (e.g., http://localhost:5173).

## Build
```bash
npm run build
```
Artifacts go to `dist/` (set your GitHub Action `output_location: "dist"`).

## API endpoints
- `GET /api/companies`
- `POST /api/companies` (body: `{ "name": "Acme", "website": "https://..." }`)

