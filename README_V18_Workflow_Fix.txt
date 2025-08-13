# V18 Workflow Fix + Version Badge Instructions

This zip contains ONLY the GitHub Actions workflow for Azure Static Web Apps,
configured to **skip the Node build step** (Oryx) for a plain static site.
It also includes instructions to add a visible "V18" version badge in the UI.

## 1) Install the workflow

- In GitHub, click **Add file → Upload files**.
- Drag the `.github/` folder from this zip into the repo root.
- Commit to `main` (or a branch + PR). A new deploy run will start.

> The action uses secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_STONE_05D05E710`.
> If your secret name differs, edit the workflow file and replace it with your secret.

## 2) Add a visible version badge "V18" (manual edit)

Open `app.js` and make three tiny edits:

1. **Add a distribution version constant** near the existing BUILD constant:
   ```js
   const BUILD = "v2.10.7";        // keep your current build if you like
   const DIST  = "V18";            // <-- add this line
   const STAMP = /* existing value */;
   ```

2. **Show it in the top bar** (inside `Topbar()`), append a badge to the string:
   ```js
   s += '<span class="badge">Build ' + DIST + '</span>';
   ```

3. **Show it in the dashboard footer/status** (search for 'Ready ('+BUILD+')'):
   ```js
   // replace:
   'Ready (' + BUILD + ')'
   // with:
   'Ready (' + DIST + ')'
   ```

Optional: also include on the Dashboard "Welcome" card:
```js
'<div class="mono">Build: ' + STAMP + ' • Version: ' + DIST + '</div>'
```

That’s it. Commit the change; the next deploy will display **V18** visibly.

## Notes
- This workflow sets:
  - `app_location: "/"` (your `index.html` in repo root)
  - `api_location: ""` (no API build)
  - `skip_app_build: true` and `skip_api_build: true` (bypass Oryx build)
- If you re‑enable an API later, set `api_location: "api"` and remove `skip_api_build`.
