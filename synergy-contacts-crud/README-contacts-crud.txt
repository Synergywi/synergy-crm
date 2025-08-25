What this zip contains
----------------------
1) pages/contacts.tsx
   - Full Contacts UI with:
     • List of contacts
     • Add Contact form (name/email/companyId)
     • Edit & Delete for the selected contact
     • Polished dark UI consistent with the app
   - Talks to:
       GET    /api/contacts
       POST   /api/contacts
       PATCH  /api/contacts/{id}
       DELETE /api/contacts/{id}

2) api/contacts/index.js
   - Azure Function implementing the above CRUD against Cosmos DB.
   - Uses env vars: COSMOS_CONNECTION_STRING (or COSMOS_ENDPOINT + COSMOS_KEY),
                   COSMOS_DB (e.g. "crm").
     Container is hard-coded as "contacts" with partition key "/id".

3) api/contacts/function.json
   - Trigger + route: contacts/{id?} with GET/POST/PATCH/DELETE/OPTIONS.

How to install
--------------
• Drop the files into your repo at the exact paths shown above.
• Ensure the following Static Web App App Settings are present:
    COSMOS_CONNECTION_STRING  (or COSMOS_ENDPOINT + COSMOS_KEY)
    COSMOS_DB=crm
• In Cosmos DB, create container "contacts" in DB "crm" with partition key "/id".
• Commit to main; GitHub Actions will deploy. Then visit /contacts in the app.

Notes
-----
• If your App.tsx doesn't already route "/contacts" to this page,
  import the component and add a <Route path="/contacts" .../>.
• The API returns JSON and is CORS-enabled for the Static Web App.
Generated: 2025-08-25T20:19:09.672296Z
