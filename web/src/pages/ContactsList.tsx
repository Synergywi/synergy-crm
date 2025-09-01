import React from "react";
import { Link } from "react-router-dom";

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

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  background: "#0e1626",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(148,163,184,0.08)"
};

const thTd: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid rgba(148,163,184,0.08)" };

const ContactsList: React.FC = () => {
  return (
    <section>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Contacts</h1>
        <button
          type="button"
          style={{ padding: "8px 12px", background: "#4f46e5", color: "white", borderRadius: 8, border: 0 }}
          onClick={() => window.alert("Hook this up to your create-contact form")}
        >
          Create contact
        </button>
      </header>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead style={{ background: "rgba(148,163,184,0.05)" }}>
            <tr>
              <th style={{ ...thTd, textAlign: "left" }}>Name</th>
              <th style={{ ...thTd, textAlign: "left" }}>Company</th>
              <th style={{ ...thTd, textAlign: "left" }}>Email</th>
              <th style={{ ...thTd, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {CONTACTS.map((c: Contact) => (
              <tr key={c.id}>
                <td style={thTd}>{c.name}</td>
                <td style={thTd}>{c.company ?? "—"}</td>
                <td style={thTd}>{c.email}</td>
                <td style={{ ...thTd, textAlign: "right" }}>
                  <Link to={`/contacts/${c.id}`} style={{ padding: "6px 10px", background: "#4f46e5", borderRadius: 8 }}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ContactsList;
