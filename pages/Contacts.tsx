import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listContacts,
  addContact,
  deleteContact,
  type Contact,
} from "../web/lib/contactsApi";

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listContacts();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onAdd() {
    const name = prompt("Contact name?");
    if (!name) return;
    const email = prompt("Email (optional)?") || undefined;

    try {
      const created = await addContact({ name, email } as Partial<Contact>);
      await refresh();
      if (created?.id) navigate(`/contacts/${encodeURIComponent(created.id)}`);
    } catch (e) {
      alert("Create failed");
      console.error(e);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
      await refresh();
    } catch (e) {
      alert("Delete failed");
      console.error(e);
    }
  }

  return (
    <div className="page">
      <div className="header">
        <div className="title">Synergy CRM 2</div>
        <div className="badge">Live preview</div>
      </div>

      <div className="panel">
        <div className="row space-between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Contacts</h2>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary" onClick={onAdd}>+ Add contact</button>
          </div>
        </div>

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
            {loading && (
              <tr><td colSpan={4}>Loading…</td></tr>
            )}

            {!loading && contacts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                  No contacts yet.
                </td>
              </tr>
            )}

            {!loading &&
              contacts.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.company || "—"}</td>
                  <td>{c.lastSeen || "—"}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <button
                        className="btn btn-muted"
                        onClick={() => navigate(`/contacts/${encodeURIComponent(c.id)}`)}
                      >
                        Open
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
