import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listContacts,
  addContact,
  deleteContact,
  type Contact,
} from "../web/lib/contactsApi";

export default function ContactsPage() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await listContacts();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  async function onAdd() {
    // create a new lightweight contact and jump to the detail card
    const created = await addContact({ name: "New contact" });
    const fresh = await listContacts();
    setRows(fresh);
    nav(`/contacts/${created.id}`);
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    const fresh = await listContacts();
    setRows(fresh);
  }

  return (
    <div className="hub-container page">
      <div className="toolbar">
        <div className="title">Synergy CRM 2</div>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={onAdd}>
          + Add contact
        </button>
      </div>

      <div className="card narrow">
        <div className="card-header" style={{justifyContent:"space-between", width:"100%"}}>
          <h2 style={{margin:0}}>Contacts</h2>
          <button className="btn btn-primary" onClick={onAdd}>
            + Add contact
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{width:"32%"}}>Name</th>
                <th style={{width:"28%"}}>Company</th>
                <th style={{width:"28%"}}>Last seen</th>
                <th style={{width:"12%"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{color:"var(--text-muted)"}}>Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} style={{color:"var(--text-muted)"}}>No contacts yet.</td>
                </tr>
              )}
              {rows.map(c => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/contacts/${c.id}`}>{c.name}</Link>
                  </td>
                  <td>{c.company || "—"}</td>
                  <td>{c.lastSeen || "—"}</td>
                  <td>
                    <div style={{display:"flex", gap:8}}>
                      <button className="btn" onClick={() => nav(`/contacts/${c.id}`)}>Open</button>
                      <button className="btn btn-danger" onClick={() => onDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
