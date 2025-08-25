
Synergy CRM — Contacts CRUD (HubSpot style + green live dots)
=============================================================

What this zip includes
----------------------
- **web/components/AddEditContactModal.tsx** — Drawer modal for add/edit
- **web/components/ContactsTable.tsx** — Table with Edit/Delete and "last seen" green/yellow/orange dots
- **web/lib/contactsApi.ts** — Thin API client for `/api/contacts`
- **web/pages/contacts.tsx** — Full Contacts page that uses the components above

How to install
--------------
1) Unzip at the **repo root** (keep the `web/` paths intact).
2) Wire the page into your app shell. In your root `App.tsx` (where routes are handled):
   - Import: `import ContactsPage from "./web/pages/contacts";`
   - Render `ContactsPage` when the current path is `/contacts`.
   Example (pseudo):
      ```tsx
      if (path === "/contacts") return <ContactsPage />;
      ```
   If your App already switches pages by path *without react-router*, follow the same pattern you used for Companies.
3) Commit & push to trigger the Azure Static Web Apps build.
4) Open the app, go to **Contacts**, try **Add Contact**, **Edit**, **Delete**.

Requirements
------------
- Backend function folder `/api/contacts/index.js` that implements GET, POST, PATCH, DELETE
  (you installed this earlier). It should use Cosmos container **crm** (partition `/id`).

Notes
-----
- The green dot appears when `lastSeen` is within 10 minutes; yellow up to 48h; orange after.
- If your contacts documents don't have `lastSeen`, the UI will show `—` and a grey dot.
- Styling matches your dark/HubSpot-like theme; buttons and rounded cards align with Companies.

Generated: 2025-08-25T21:03:51.187884Z
