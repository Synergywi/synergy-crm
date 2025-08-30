import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
}

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
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="panel">
        <div className="panel-header">
          <h3 className="title">Contacts</h3>
          <div className="spacer" />
          <button className="btn btn-primary">Create contact</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company ?? "-"}</td>
                <td>{c.email}</td>
                <td>
                  <Link to={`/contacts/${encodeURIComponent(c.id)}`}>Open</Link>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={4}>Loading…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
