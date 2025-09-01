import React from "react";
import { Link, useParams } from "react-router-dom";

type Contact = {
  id: string;
  name: string;
  email: string;
  company?: string;
};

const CONTACTS: Contact[] = [
  { id: "bruce", name: "Bruce Wayne", email: "bruce@wayne.com", company: "Wayne Enterprises" },
  { id: "diana", name: "Diana Prince", email: "diana@embassy.org", company: "Themyscira Embassy" }
];

const fieldRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 };

const Contacts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const record: Contact | undefined = CONTACTS.find((c: Contact) => c.id === id);

  if (!record) {
    return (
      <section>
        <p style={{ marginBottom: 16 }}>Contact not found.</p>
        <Link to="/contacts" style={{ padding: "8px 12px", background: "#334155", borderRadius: 8 }}>
          Back to Contacts
        </Link>
      </section>
    );
  }

  return (
    <section>
      <header style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/contacts" style={{ padding: "8px 12px", background: "#334155", borderRadius: 8 }}>
          Back
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{record.name}</h1>
      </header>

      <div
        style={{
          background: "#0e1626",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(148,163,184,0.08)"
        }}
      >
        <div style={fieldRow}>
          <div style={{ opacity: 0.7 }}>Email</div>
          <div>{record.email}</div>
        </div>
        <div style={{ ...fieldRow, marginTop: 10 }}>
          <div style={{ opacity: 0.7 }}>Company</div>
          <div>{record.company ?? "—"}</div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
