HubSpot Theme Override (orange/teal)
-----------------------------------
1) Upload `theme-hubspot.css` next to your index.html on your host.
2) Add this line inside <head> after any other CSS:
   <link rel="stylesheet" href="theme-hubspot.css">
3) Hard reload the page (Cmd/Ctrl+Shift+R). If using DevTools, tick "Disable cache".
This forces orange/teal and opaque cards even if older CSS is cached.