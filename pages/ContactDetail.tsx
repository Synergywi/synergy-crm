// pages/ContactDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { Contact, getContact, updateContact } from "../web/lib/contactsStore";

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [tab, setTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const c = getContact(id);
    if (!c) return navigate("/contacts");
    setContact(c);
  }, [id, navigate]);

  const lastSeenDisplay = useMemo(
    () => (contact?.lastSeen ? new Date(contact.lastSeen).toISOString() : "—"),
    [contact?.lastSeen]
  );

  if (!contact) return null;

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const updated = updateContact(contact.id, {
      name: (fd.get("name") as string).trim(),
      email: (fd.get("email") as string)?.trim() || undefined,
      company: (fd.get("company") as string)?.trim() || undefined,
      phone: (fd.get("phone") as string)?.trim() || undefined,
      role: (fd.get("role") as string)?.trim() || undefined,
    });
    setContact(updated);
    setSaving(false);
  }

  return (
    <div className="panel">
      <div className="row space-between mb-16">
        <div className="row">
          <NavLink to="/contacts" className="btn btn-muted" style={{ marginRight: 8 }}>Back</NavLink>
          <h2 className="title" style={{ margin: 0 }}>{contact.name}</h2>
        </div>
      </div>

      <div className="card">
        <div className="tabs mb-16">
          <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
          <button className={`tab ${tab === "portal" ? "active" : ""}`} onClick={() => setTab("portal")}>Portal</button>
          <button className={`tab ${tab === "cases" ? "active" : ""}`} onClick={() => setTab("cases")}>Cases</button>
        </div>

        {tab === "profile" && (
          <form onSubmit={onSave}>
            <div className="row space-between">
              <div style={{ flex: 1, marginRight: 8 }}>
                <label>Name</label>
                <input name="name" defaultValue={contact.name} required className="input" />
              </div>
              <div style={{ flex: 1, marginLeft: 8 }}>
                <label>Email</label>
                <input name="email" type="email" defaultValue={contact.email} className="input" />
              </div>
            </div>

            <div className="row space-between mt-8">
              <div style={{ flex: 1, marginRight: 8 }}>
                <label>Company</label>
                <input name="company" defaultValue={contact.company} className="input" />
              </div>
              <div style={{ flex: 1, marginLeft: 8 }}>
                <label>Phone</label>
                <input name="phone" defaultValue={contact.phone} className="input" />
              </div>
            </div>

            <div className="row space-between mt-8">
              <div style={{ flex: 1, marginRight: 8 }}>
                <label>Role</label>
                <input name="role" defaultValue={contact.role} className="input" />
              </div>
              <div style={{ flex: 1, marginLeft: 8 }}>
                <label>Last seen</label>
                <input disabled className="input" value={lastSeenDisplay} />
              </div>
            </div>

            <div className="row mt-16">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </form>
        )}

        {tab === "portal" && (
          <div className="panel">
            <p>Portal access controls and invites will appear here.</p>
            <button className="btn" disabled>Invite to portal (coming soon)</button>
          </div>
        )}

        {tab === "cases" && (
          <div className="panel">
            <p>No related cases yet.</p>
            <button className="btn" disabled>Link a case (coming soon)</button>
          </div>
        )}
      </div>
    </div>
  );
}
