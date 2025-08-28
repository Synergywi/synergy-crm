import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listContacts,
  addContact,
  deleteContact,
  type Contact,
} from "../web/lib/contactsApi";

export default function ContactsPage() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await listContacts();
      setContacts(data);
      setLoading(false);
    })();
  }, []);

  function resetForm() {
    setForm({ name: "", email: "", phone: "", company: "", role: "", notes: "" });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.name.trim()) return;

    const created = await addContact({
      name: form.name!.trim(),
      email: form.email?.trim(),
      phone: form.phone?.trim(),
      company: form.company?.trim(),
      role: form.role?.trim(),
      notes: form.notes,
    });

    // refresh list (keeps table correct if you navigate back)
    const data = await listContacts();
    setContacts(data);

    // jump straight into the detail card for richer editing
    resetForm();
    setShowForm(false);
    navigate(`/contacts/${created.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    const data = await listContacts();
    setContacts(data);
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="header container">
        <div className="title">Synergy CRM 2</div>
        <div className="badge">Live preview</div>
      </div>

      <div className="container">
        <div className="card">
          {/* Card header with CTA on the right */}
          <div className="card-header">
            <div className="card-title">Contacts</div>
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? "Close" : "+ Add contact"}
            </button>
          </div>

          {/* Optional add form (inside the card, above the table) */}
          {showForm && (
            <div className="card-body">
              <form onSubmit={handleCreate} className="crm-grid">
                <FormGroup label="Name">
                  <input
                    required
                    placeholder="Full name"
                    value={form.name ?? ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup label="Email">
                  <input
                    placeholder="Email address"
                    value={form.email ?? ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </FormGroup>

                <FormGroup label="Phone">
                  <input
                    placeholder="Phone"
                    value={form.phone ?? ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </FormGroup>

                <FormGroup label="Company">
                  <input
                    placeholder="Company"
                    value={form.company ?? ""}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </FormGroup>

                <FormGroup label="Role">
                  <input
                    placeholder="Role"
                    value={form.role ?? ""}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </FormGroup>

                <FormGroup label="Notes" span={2}>
                  <textarea
                    placeholder="Notes…"
                    value={form.notes ?? ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </FormGroup>

                <div className="crm-span-2" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="btn" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Create contact
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Name</th>
                  <th style={{ width: "28%" }}>Company</th>
                  <th style={{ width: "26%" }}>Last seen</th>
                  <th style={{ width: "12%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} style={{ color: "var(--text-muted)" }}>Loading…</td>
                  </tr>
                )}

                {!loading && contacts.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: "var(--text-muted)" }}>No contacts yet.</td>
                  </tr>
                )}

                {!loading && contacts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/contacts/${c.id}`} style={{ textDecoration: "none" }}>
                        {c.name}
                      </Link>
                    </td>
                    <td>{c.company || "—"}</td>
                    <td>{c.lastSeen ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn" onClick={() => navigate(`/contacts/${c.id}`)}>Open</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* (No footer needed on the list card) */}
        </div>
      </div>
    </div>
  );
}

/* Small helper so labels/inputs match the detail page */
function FormGroup(props: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <div className={`form-group ${props.span === 2 ? "crm-span-2" : ""}`}>
      <label>{props.label}</label>
      {props.children}
    </div>
  );
}
