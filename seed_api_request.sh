# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD (staging)

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install frontend deps
        run: |
          cd app
          npm ci

      - name: Build frontend
        run: |
          cd app
          npm run build

      - name: Install and build API
        run: |
          cd api
          npm ci
          npm run build

      - name: Copy function.json files
        run: |
          rsync -a --include='*/' --include='function.json' --exclude='*' api/ api/dist/

      - name: Deploy to Azure Static Web Apps (staging)
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'app'
          output_location: 'dist'
          api_location: 'api/dist'

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close PR previews
        uses: Azure/static-web-apps-deploy@v1
        with:
          action: 'close'
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}

---
# /api/package.json
{
  "name": "synergy-crm-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@azure/cosmos": "^4.2.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.12.12"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}

---
# /api/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": ".",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"]
}


---
# ⬆️ API build & deploy fixes (TypeScript Azure Functions)

## /api/package.json (UPDATED)
{
  "name": "synergy-crm-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@azure/cosmos": "^4.2.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.12.12"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json"
  }
}

---
## /api/tsconfig.json (NEW)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": ".",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"]
}

---
## .github/workflows/azure-static-web-apps.yml (UPDATED excerpt)
```yaml
      - name: Install & build API
        run: |
          cd api
          npm ci
          npm run build

      - name: Copy function.json to dist (if needed)
        run: |
          rsync -a --include='*/' --include='function.json' --exclude='*' api/ api/dist/

      - name: Deploy to Azure Static Web Apps (staging)
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: app
          output_location: dist
          api_location: api/dist
```

> Ensure your Functions source still lives under `/api/<functionName>/index.ts` with `function.json` in each folder. After build, Azure must see `api/dist/<functionName>/index.js` **and** `api/dist/<functionName>/function.json`.

---
## Re-run seed after deploy
```bash
curl -i -X POST "https://ambitious-stone-05d05e710.1.azurestaticapps.net/api/seed" \
  -H 'x-seed-key: synergy-seed-2025-xyz!'
```

Expected: `HTTP/2 200` with `{ "seeded": true }`.
