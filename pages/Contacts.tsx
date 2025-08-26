// pages/Contacts.tsx
import { useEffect, useMemo, useState } from "react";

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  lastSeen?: string; // ISO
};

export default function Contacts() {
  const [list, setList] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Contact[];
      setList(data);
      if (data.length && !selected) setSelected(data[0]);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function fmtAgo(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString(); // simple for now; theme shows it cleanly
  }

  async function onAdd() {
    const name = prompt("Contact name?");
    if (!name) return;
    const email = prompt("Email (optional)?") || undefined;

    const body: Partial<Contact> = {
      name: name.trim(),
      email: email?.trim(),
      lastSeen: new Date().toISOString(),
    };

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return alert(`Create failed: ${res.status}`);
    await load();
  }

  async function onEdit(c: Contact) {
    const name = prompt("Name", c.name) ?? c.name;
    const email = prompt("Email", c.email || "") || undefined;
    const phone = prompt("Phone", c.phone || "") || undefined;
    const company = prompt("Company", c.company || "") || undefined;
    const role = prompt("Role", c.role || "") || undefined;

    const res = await fetch(`/api/contacts/${encodeURIComponent(c.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, role }),
    });
    if (!res.ok) return alert(`Update failed: ${res.status}`);
    await load();
  }

  async function onDelete(c: Contact) {
    if (!confirm(`Delete ${c.name}?`)) return;
    const res = await fetch(`/api/contacts/${encodeURIComponent(c.id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return alert(`Delete failed: ${res.status}`);
    await load();
  }

  const rows = useMemo(
    () =>
      list.map((c) => (
        <tr
          key={c.id}
          className={selected?.id === c.id ? "selected" : ""}
          onClick={() => setSelected(c)}
        >
          <td className="cell-strong">{c.name}</td>
          <td>{c.company || "—"}</td>
          <td>
            <span className="pill">
              <span className="dot dot-green" />
              {fmtAgo(c.lastSeen)}
            </span>
          </td>
          <td className="actions">
            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); onEdit(c); }}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(c); }}>
              Delete
            </button>
          </td>
        </tr>
      )),
    [list, selected]
  );

  return (
    <>
      <div className="page-title">Contacts</div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Contacts</div>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={onAdd}>
              + Add contact
            </button>
          </div>
        </div>

        <div className="card-body">
          {loading && <div className="muted">Loading…</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "28%" }}>Name</th>
                  <th style={{ width: "28%" }}>Company</th>
                  <th style={{ width: "28%" }}>Last seen</th>
                  <th style={{ width: "16%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows : (
                  <tr>
                    <td colSpan={4} className="muted">
                      No contacts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">{selected ? selected.name : "Contact"}</div>
          <div className="card-actions">
            <button className="btn btn-secondary" disabled={!selected}>
              Simulate login
            </button>
            <button className="btn" disabled={!selected}>
              Clear log
            </button>
          </div>
        </div>

        <div className="card-body">
          {selected ? (
            <div className="details-grid">
              <div><div className="label">Company</div><div className="value">{selected.company || "—"}</div></div>
              <div><div className="label">Email</div><div className="value">{selected.email || "—"}</div></div>
              <div><div className="label">Phone</div><div className="value">{selected.phone || "—"}</div></div>
              <div><div className="label">Role</div><div className="value">{selected.role || "—"}</div></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="label">Last seen</div>
                <div className="value">
                  <span className="pill">
                    <span className="dot dot-green" />
                    {fmtAgo(selected.lastSeen)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="muted">Select a contact to view details.</div>
          )}
        </div>
      </div>
    </>
  );
}
