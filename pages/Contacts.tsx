// /pages/Contacts.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listContacts,
  addContact,
  deleteContact,
  type Contact,
} from "../web/lib/contactsApi"; // keep this path as in your repo

export default function ContactsPage() {
  const nav = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    notes: "",
  });

  useEffect(() => {
    (async () => setContacts(await listContacts()))();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const created = await addContact(form);
    setShowForm(false);
    setForm({ name: "", email: "", phone: "", company: "", role: "", notes: "" });
    // Refresh list then go to detail
    setContacts(await listContacts());
    nav(`/contacts/${created.id}`);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    setContacts(await listContacts());
  }

  return (
    <div className="page">
      <div className="header">
        <div className="row space-between">
          <h1 className="title">Contacts</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            + Add contact
          </button>
        </div>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>New contact</h3>
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
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
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
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.lastSeen ?? "—"}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn" onClick={() => nav(`/contacts/${c.id}`)}>Open</button>
                    <button className="btn btn-danger" onClick={() => onDelete(c.id)}>Delete</button>
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
      </div>
    </div>
  );
}
