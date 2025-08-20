
Synergy CRM — Calendar Patch (v2126)

What’s included
- Event modal with “Attach to case” (and Owner for Admins)
- Click a date to open New Event prefilled with the exact local date
- Create/Edit/Delete events
- Events persist in localStorage (key: synergy_calendar_v2126)

How to run
1) Unzip and open index.html in a browser.
2) Click any date cell → modal opens with that date. Save.
3) Reopen the event to attach it to a case (dropdown).
4) (Optional) Use createCaseEvent in your existing Case page to link events by caseId.

Integrating into your app
- If you want to keep your file names, rename app.v2126.js to your bundle name and update your HTML <script> tag accordingly.
