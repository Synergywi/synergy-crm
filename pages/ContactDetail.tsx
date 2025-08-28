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
  const { id = "" } = useParams();
  const nav = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  useEffect(() => {
    (async () => setContacts(await listContacts()))();
  }, []);

  const contact = useMemo(() => contacts.find(c => c.id === id) || null, [contacts, id]);

  const [form, setForm] = useState<Partial<Contact>>({});
  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        role: contact.role || "",
        notes: contact.notes || "",
      });
    }
  }, [contact]);

  async function onSave() {
    if (!contact) return;
    await updateContact(contact.id, form);
    setContacts(await listContacts());
    alert("Saved");
  }

  if (!contact) {
    return (
      <div className="page">
        <div className="panel">
          <div style={{ marginBottom: 12 }}>Contact not found.</div>
          <button className="btn" onClick={() => nav("/contacts")}>Back to Contacts</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <div className="row space-between">
          <h1 className="title">Contact</h1>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => nav("/contacts")}>Back</button>
            <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{contact.name}</h3>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
            Profile
          </button>
          <button className={`tab ${activeTab === "portal" ? "active" : ""}`} onClick={() => setActiveTab("portal")}>
            Portal
          </button>
          <button className={`tab ${activeTab === "cases" ? "active" : ""}`} onClick={() => setActiveTab("cases")}>
            Cases
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
            <LabeledInput label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <LabeledInput label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
            <LabeledInput label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
            <LabeledInput label="Company" value={form.company} onChange={v => setForm({ ...form, company: v })} />
            <LabeledInput label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })} />
            <LabeledTextArea label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} />
            <ReadOnly label="Last seen" value={contact.lastSeen || "—"} />

            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => simulateLogin(contact.id)}>Simulate login</button>
              <button className="btn" onClick={() => clearLog(contact.id)}>Clear log</button>
            </div>
          </div>
        )}

        {activeTab === "portal" && (
          <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
        )}

        {activeTab === "cases" && (
          <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
        )}
      </div>
    </div>
  );
}

function LabeledInput(props: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: "1 1 320px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <input value={props.value || ""} onChange={e => props.onChange(e.target.value)} />
    </div>
  );
}

function LabeledTextArea(props: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: "1 1 100%" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <textarea style={{ minHeight: 90 }} value={props.value || ""} onChange={e => props.onChange(e.target.value)} />
    </div>
  );
}

function ReadOnly(props: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ flex: "1 1 320px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
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
