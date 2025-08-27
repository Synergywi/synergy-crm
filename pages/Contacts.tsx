import { useEffect, useMemo, useState } from "react";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  seedOnce,
} from "../web/lib/contactsApi"; // adjust relative path if needed

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { seedOnce(); refresh(); }, []);
  async function refresh() { setItems(await listContacts()); }

  const active = useMemo(() => items.find(c => c.id === activeId) || items[0], [items, activeId]);

  async function onAdd() {
    const name = prompt("Contact name?")?.trim();
    if (!name) return;
    const email = prompt("Email (optional)?")?.trim() || "";
    await createContact({ name, email });
    await refresh();
  }

  async function onEdit(c: Contact) {
    const name = prompt("New name:", c.name)?.trim();
    if (!name) return;
    await updateContact(c.id, { name });
    await refresh();
  }

  async function onDelete(c: Contact) {
    if (!confirm(`Delete ${c.name}?`)) return;
    await deleteContact(c.id);
    setActiveId(null);
    await refresh();
  }

  async function simulateLogin(c: Contact) {
    await updateContact(c.id, { lastSeen: new Date().toISOString() });
    await refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="row">
          <h1 className="page-title">Contacts</h1>
          <span className="badge">Live preview</span>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>+ Add contact</button>
      </div>

      <div className="card">
        <table className="table table--compact">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Last seen</th>
              <th style={{width:140}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} onClick={() => setActiveId(c.id)} style={{cursor:"pointer"}}>
                <td>{c.name}</td>
                <td>{c.company || "—"}</td>
                <td>{c.lastSeen || "—"}</td>
                <td className="row">
                  <button className="btn btn-muted" onClick={(e)=>{e.stopPropagation(); onEdit(c);}}>Edit</button>
                  <button className="btn btn-danger" onClick={(e)=>{e.stopPropagation(); onDelete(c);}}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} style={{textAlign:"center", color:"var(--ink-muted)"}}>No contacts yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="panel mt-24">
          <div className="row space-between">
            <strong style={{fontSize:16}}>{active.name}</strong>
            <div className="row">
              <button className="btn" onClick={()=>simulateLogin(active)}>Simulate login</button>
              <button className="btn btn-muted" onClick={()=>setActiveId(null)}>Clear log</button>
            </div>
          </div>

          <div className="mt-16" style={{display:"grid", gridTemplateColumns:"160px 1fr", rowGap:8}}>
            <span style={{color:"var(--ink-muted)"}}>Company</span><span>{active.company || "—"}</span>
            <span style={{color:"var(--ink-muted)"}}>Email</span><span>{active.email || "—"}</span>
            <span style={{color:"var(--ink-muted)"}}>Phone</span><span>{active.phone || "—"}</span>
            <span style={{color:"var(--ink-muted)"}}>Role</span><span>{active.role || "—"}</span>
            <span style={{color:"var(--ink-muted)"}}>Last seen</span><span>{active.lastSeen || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
