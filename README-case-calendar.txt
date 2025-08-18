
Case Calendar + Edit Modal + Notifications (non-invasive add-on)

Installation:
1) Drop `case-calendar-addon.v1.js` next to your existing `app.js`.
2) In `index.html`, include it *after* the main app script:
     <script src="app.js"></script>
     <script src="case-calendar-addon.v1.js"></script>
3) Hard refresh with cache disabled.

Features:
- Investigators can assign events to their cases (filtered case list).
- Case page gains a Calendar panel with list + "Add case event" form.
- Click "Open" on any event to edit/save/delete in a modal (Admin can change Owner; investigators cannot).
- Dashboard shows Calendar notifications with Open/Dismiss and Show all/Show unread.

This add-on doesn't change your theme or layout; it only appends panels that use your existing classes.
