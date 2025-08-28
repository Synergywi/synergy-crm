// /pages/Contacts.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listContacts,
  addContact,
  updateContact,
  deleteContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

type TabKey = "profile" | "portal" | "cases";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const selected = useMemo(
    () => contacts.find(c => c.id === selectedId) || null,
    [contacts, selectedId]
  );

  useEffect(() => {
    (async () => {
      const data = await listContacts();
      setContacts(data);
      if (data.length && !selectedId) setSelectedId(data[0].id);
    })();
  }, []);

  // Form state for "Add contact"
  const [form, setForm] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    notes: "",
  });

  function resetForm() {
    setForm({ name: "", email: "", phone: "", company: "", role: "", notes: "" });
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const created = await addContact(form);
    const data = await listContacts();
    setContacts(data);
    setSelectedId(created.id);
    resetForm();
    setShowForm(false);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    const data = await listContacts();
    setContacts(data);
    if (selectedId === id) setSelectedId(data[0]?.id ?? null);
  }

  return (
    <div className="page">
      <div className="header">
        <div className="row space-between">
          <h1 className="title">Contacts</h1>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => setShowForm(s => !s)}>
              + Add contact
            </button>
          </div>
        </div>
      </div>

      {/* Add Contact form card */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>New contact</h3>
          <form onSubmit={onCreate} className="row" style={{ flexWrap: "wrap", gap: 12 }}>
            <input
              required
              placeholder="Name"
              value={form.name || ""}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ flex: "1 1 260px" }}
            />
            <input
              placeholder="Email"
              value={form.email || ""}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ flex: "1 1 260px" }}
            />
            <input
              placeholder="Phone"
              value={form.phone || ""}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ flex: "1 1 200px" }}
            />
            <input
              placeholder="Company"
              value={form.company || ""}
              onChange={e => setForm({ ...form, company: e.target.value })}
              style={{ flex: "1 1 260px" }}
            />
            <input
              placeholder="Role"
              value={form.role || ""}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ flex: "1 1 200px" }}
            />
            <textarea
              placeholder="Notes"
              value={form.notes || ""}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ flex: "1 1 100%", minHeight: 80 }}
            />
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List + Details */}
      <div className="panel">
        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "32%" }}>Name</th>
              <th style={{ width: "28%" }}>Company</th>
              <th style={{ width: "28%" }}>Last seen</th>
              <th style={{ width: "12%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{ cursor: "pointer", background: c.id === selectedId ? "rgba(2,16,32,.03)" : undefined }}
              >
                <td>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.lastSeen ?? "—"}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="btn"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                        setActiveTab("profile");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--text-muted)" }}>No contacts yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Details with tabs */}
        {selected && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px" }}>{selected.name}</h3>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`tab ${activeTab === "portal" ? "active" : ""}`}
                onClick={() => setActiveTab("portal")}
              >
                Portal
              </button>
              <button
                className={`tab ${activeTab === "cases" ? "active" : ""}`}
                onClick={() => setActiveTab("cases")}
              >
                Cases
              </button>
            </div>

            {activeTab === "profile" && (
              <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
                <ReadOnlyField label="Company" value={selected.company || "—"} />
                <ReadOnlyField label="Email" value={selected.email || "—"} />
                <ReadOnlyField label="Phone" value={selected.phone || "—"} />
                <ReadOnlyField label="Role" value={selected.role || "—"} />
                <ReadOnlyField label="Last seen" value={selected.lastSeen || "—"} />

                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <button className="btn" onClick={() => simulateLogin(selected.id)}>Simulate login</button>
                  <button className="btn" onClick={() => clearLog(selected.id)}>Clear log</button>
                </div>
              </div>
            )}

            {activeTab === "portal" && (
              <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
            )}

            {activeTab === "cases" && (
              <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField(props: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ flex: "1 1 260px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          minHeight: 38,
        }}
      >
        {props.value}
      </div>
    </div>
  );
}
