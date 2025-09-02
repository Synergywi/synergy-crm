import React from "react";
import { Link } from "react-router-dom";

// Try both shapes so it works with your current stores.
type Contact = {
  id: string;
  name: string;
  email?: string;
  company?: string;
  companyId?: string;
};

type Company = {
  id: string;
  name: string;
};

// These imports match the stores you already committed.
// If your export is default, this still works via ES module interop.
import { contacts as contactsData } from "../lib/contactsStore";
import { companies as companiesData } from "../lib/companiesStore";

function getCompanyName(c: Contact, companies: Company[]): string {
  if (c.company) return c.company;
  if (c.companyId) {
    const match = companies.find(x => x.id === c.companyId);
    if (match) return match.name;
  }
  return "";
}

export default function ContactsPage() {
  const contacts: Contact[] = Array.isArray(contactsData) ? contactsData as Contact[] : [];
  const companies: Company[] = Array.isArray(companiesData) ? companiesData as Company[] : [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h1 className="panel-title">Contacts</h1>
      </div>

      <div className="panel-body">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{width: "32%"}}>Name</th>
                <th style={{width: "32%"}}>Company</th>
                <th style={{width: "28%"}}>Email</th>
                <th style={{width: "8%"}} aria-label="actions"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const companyName = getCompanyName(c, companies);
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{companyName}</td>
                    <td>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="text-muted">
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      {/* Detail routes can be wired later; keep UX consistent now */}
                      <Link to="#" className="btn btn-small">Open</Link>
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">No contacts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
