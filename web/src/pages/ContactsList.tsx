import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Contact = { id: string; name: string; email: string; company?: string };

const SEED: Contact[] = [
  { id: "bruce", name: "Bruce Wayne", email: "bruce@wayne.com", company: "Wayne Enterprises" },
  { id: "diana", name: "Diana Prince", email: "diana@embassy.org", company: "Themyscira Embassy" },
];

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>(SEED);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/contacts");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) setContacts(data);
        }
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <div className="panel">
        <div className="panel__header">
          <h3 style={{ margin: 0 }}>Contacts</h3>
          <button className="button">Create contact</button>
        </div>
        <div className="table">
          <div className="table__row table__row--head">
            <div className="table__cell">Name</div>
            <div className="table__cell">Company</div>
            <div className="table__cell">Email</div>
            <div className="table__cell">Actions</div>
          </div>
          {contacts.map((c) => (
            <div className="table__row" key={c.id}>
              <div className="table__cell">{c.name}</div>
              <div className="table__cell">{c.company ?? "-"}</div>
              <div className="table__cell">{c.email}</div>
              <div className="table__cell">
                <Link to={`/contacts/${encodeURIComponent(c.id)}`}>Open</Link>
              </div>
            </div>
          ))}
          {loading && (
            <div className="table__row">
              <div className="table__cell">Loading…</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
