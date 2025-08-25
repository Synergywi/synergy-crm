HubSpot Theme Pack
-------------------

1. Place `hubspot-theme.css` into your `web/` folder.

2. Apply it either by:
   A) Linking in your index.html:
      <link rel="stylesheet" href="/web/hubspot-theme.css" />

   OR

   B) Importing at the top of your React entry (App.tsx or main.tsx):
      import "../web/hubspot-theme.css";

3. Use provided classes in your JSX:
   - Buttons: `btn btn-primary`, `btn btn-danger`, `btn btn-muted`
   - Inputs: `input`, `select`, `textarea`
   - Tables: `table`
   - Panels: `panel`, `card`
   - Pills: `pill`
   - Layout helpers: `row`, `space-between`, `mt-16`

That's it — your app now looks like HubSpot!
