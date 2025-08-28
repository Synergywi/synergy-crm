// /pages/ContactDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  listContacts,
  updateContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const contact = useMemo(
    () => contacts.find(c => c.id === id) || null,
    [contacts, id]
  );

  const [activeTab, setActiveTab] = useState<TabKey>("profile");

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
      const data = await listContacts();
      setContacts(data);
    })();
  }, []);

  // Sync the edit form when the contact loads/changes
  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        company: contact.company ?? "",
        role: contact.role ?? "",
        notes: contact.notes ?? "",
      });
    }
  }, [contact?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSave() {
    if (!id) return;
    await updateContact(id, {
      name: (form.name ?? "").trim(),
      email: form.email ?? "",
      phone: form.phone ?? "",
      company: form.company ?? "",
      role: form.role ?? "",
      notes: form.notes ?? "",
    });
    // Stay on page, but refresh local list so values reflect server
    const data = await listContacts();
    setContacts(data);
  }

  if (!id) {
    return (
      <div className="page">
        <div className="panel">Missing contact id.</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="page">
        <div className="panel">Loading contact…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <div className="title">Contact</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => navigate("/contacts")}>Back</button>
          <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ margin: "0 0 8px" }}>{contact.name}</h3>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === "portal" ? "active" : ""}`}
            onClick={() => setActiveTab("portal")}
          >
            Portal
          </button>
          <button
            className={`tab ${activeTab === "cases" ? "active" : ""}`}
            onClick={() => setActiveTab("cases")}
          >
            Cases
          </button>
        </div>

        {activeTab === "profile" && (
          <div>
            <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
              <Field
                label="Name"
                value={form.name ?? ""}
                onChange={v => setForm(f => ({ ...f, name: v }))}
              />
              <Field
                label="Email"
                value={form.email ?? ""}
                onChange={v => setForm(f => ({ ...f, email: v }))}
              />
              <Field
                label="Phone"
                value={form.phone ?? ""}
                onChange={v => setForm(f => ({ ...f, phone: v }))}
              />
              <Field
                label="Company"
                value={form.company ?? ""}
                onChange={v => setForm(f => ({ ...f, company: v }))}
              />
              <Field
                label="Role"
                value={form.role ?? ""}
                onChange={v => setForm(f => ({ ...f, role: v }))}
              />
              <TextArea
                label="Notes"
                value={form.notes ?? ""}
                onChange={v => setForm(f => ({ ...f, notes: v }))}
              />
              <ReadOnlyField label="Last seen" value={contact.lastSeen ?? "—"} />
            </div>

            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={() => simulateLogin(contact.id)}>Simulate login</button>
              <button className="btn" onClick={() => clearLog(contact.id)}>Clear log</button>
            </div>
          </div>
        )}

        {activeTab === "portal" && (
          <div style={{ color: "var(--text-muted)" }}>
            Portal settings coming soon.
          </div>
        )}

        {activeTab === "cases" && (
          <div style={{ color: "var(--text-muted)" }}>
            Related cases will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small form helpers ---------- */

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ flex: "1 1 260px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
        {props.label}
      </div>
      <input
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        placeholder={props.label}
      />
    </div>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ flex: "1 1 520px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
        {props.label}
      </div>
      <textarea
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        placeholder={props.label}
        style={{ minHeight: 90 }}
      />
    </div>
  );
}

function ReadOnlyField(props: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ flex: "1 1 520px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
        {props.label}
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          minHeight: 38,
        }}
      >
        {props.value}
      </div>
    </div>
  );
}
