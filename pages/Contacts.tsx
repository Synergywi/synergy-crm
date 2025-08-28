// /pages/Contacts.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listContacts,
  addContact,
  deleteContact,
  type Contact,
} from "../web/lib/contactsApi";

export default function ContactsPage() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setBusy(true);
    try {
      const data = await listContacts();
      setRows(data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd() {
    // quick add via prompts (replace later with a proper modal if you want)
    const name = window.prompt("Contact name?");
    if (!name) return;
    const email = window.prompt("Email (optional)?") ?? undefined;
    await addContact({ name, email });
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    refresh();
  }

  return (
    <div className="page">
      <div className="panel">
        <div className="row space-between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Contacts</h2>
          <button className="btn btn-primary" onClick={handleAdd} disabled={busy}>
            + Add contact
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Name</th>
              <th style={{ width: "28%" }}>Company</th>
              <th style={{ width: "28%" }}>Last seen</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                  {busy ? "Loading…" : "No contacts yet."}
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.lastSeen || "—"}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Link className="btn" to={`/contacts/${encodeURIComponent(c.id)}`}>
                      Open
                    </Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>
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
