import React from "react";
import { Link } from "react-router-dom";

type Company = {
  id: string;
  name: string;
  domain?: string;
  primaryContact?: string;
};

const COMPANIES: Company[] = [
  { id: "c-001", name: "Wayne Enterprises", domain: "wayne.com", primaryContact: "Bruce Wayne" },
  { id: "c-002", name: "Themyscira Embassy", domain: "embassy.org", primaryContact: "Diana Prince" }
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

const Companies: React.FC = () => {
  return (
    <section>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Companies</h1>
      </header>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead style={{ background: "rgba(148,163,184,0.05)" }}>
            <tr>
              <th style={{ ...thTd, textAlign: "left" }}>Name</th>
              <th style={{ ...thTd, textAlign: "left" }}>Domain</th>
              <th style={{ ...thTd, textAlign: "left" }}>Primary contact</th>
              <th style={{ ...thTd, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map((co: Company) => (
              <tr key={co.id}>
                <td style={thTd}>{co.name}</td>
                <td style={thTd}>{co.domain ?? "—"}</td>
                <td style={thTd}>{co.primaryContact ?? "—"}</td>
                <td style={{ ...thTd, textAlign: "right" }}>
                  <Link to={`/contacts`} style={{ padding: "6px 10px", background: "#4f46e5", borderRadius: 8 }}>
                    View contacts
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

export default Companies;
