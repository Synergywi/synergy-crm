import { useEffect, useState } from "react";

type Contact = {
  id: string;
  name: string;
  company: string;
  lastSeen?: string; // ISO or friendly
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/contacts");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Contact[] = await res.json();
        if (!ignore) {
          setContacts(data);
          setSelected(data[0] ?? null);
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message ?? "Failed to load contacts");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="grid-2">
      <section className="card">
        <div className="card-title">Contacts</div>
        {loading && <div style={{padding:12}}>Loading…</div>}
        {err && <div style={{color:"#ef4444", padding:12}}>Error: {err}</div>}
        {!loading && !err && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{ cursor: "pointer" }}
                  className={selected?.id === c.id ? "row-active" : ""}
                >
                  <td>{c.name}</td>
                  <td>{c.company}</td>
                  <td>
                    <span className="pill">
                      <span className="dot dot-green" />
                      {c.lastSeen ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={3} style={{padding:12, color:"#94a3b8"}}>No contacts yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <div className="card-title">{selected?.name ?? "Contact"}</div>
        {selected ? (
          <div className="log">
            <div style={{marginBottom:8}}>
              <span className="pill">
                <span className="dot dot-green" />
                Last seen: {selected.lastSeen ?? "—"}
              </span>
            </div>
            <div className="log-table">
              <div className="log-row header">
                <div>When</div><div>Duration</div><div>IP</div><div>Agent</div>
              </div>
              <div className="log-row">
                <div>—</div><div>—</div><div>—</div><div>—</div>
              </div>
            </div>
            <div style={{marginTop:12, display:"flex", gap:8}}>
              <button className="btn">Simulate login</button>
              <button className="btn btn-ghost">Clear log</button>
            </div>
          </div>
        ) : (
          <div style={{padding:12, color:"#94a3b8"}}>Select a contact to view details.</div>
        )}
      </section>
    </div>
  );
}
