# Azure Functions API Smoke Test

This folder contains a minimal Functions app for Azure Static Web Apps (Node ~4).

## Structure
api/
├─ host.json
├─ package.json
└─ ping/
   ├─ function.json
   └─ index.js

## How to use
1. Place the `api` folder at the **root of your repository** (same level as package.json).
2. Commit and push to `main`.
3. Your GitHub Action should deploy the frontend and this API. 
   After deployment, test `GET /api/ping` — it should return `pong`.
