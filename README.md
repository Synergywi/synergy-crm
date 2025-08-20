# Synergy CRM — Investigations (Prototype)

This is a Vite + React + TypeScript + Tailwind prototype that mirrors the Synergy CRM Investigations UI.

## Local Dev
```bash
npm install
npm run dev
```
Visit the printed local URL.

## Build
```bash
npm run build
npm run preview
```

## Deploy to Azure Static Web Apps via GitHub
1. Create a new GitHub repo and push this project.
2. In the Azure Portal, create a **Static Web App** and choose **GitHub** as the source.
3. For the build inputs, set:
   - App location: `/`
   - Api location: *(leave blank)*
   - Output location: `dist`
4. Azure will create a GitHub Actions workflow in `.github/workflows/azure-static-web-apps.yml` and deploy on each push to `main`.

If you prefer to configure the workflow now, this repo already includes one. You just need to set the secret
`AZURE_STATIC_WEB_APPS_API_TOKEN` on your GitHub repository settings (if Azure does not auto-inject).
