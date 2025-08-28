import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  listContacts,
  updateContact,
  deleteContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [model, setModel] = useState<Partial<Contact>>({});

  useEffect(() => {
    (async () => {
      const data = await listContacts();
      setContacts(data);
      setLoading(false);
    })();
  }, []);

  const contact = useMemo(
    () => contacts.find((c) => c.id === id) || null,
    [contacts, id]
  );

  useEffect(() => {
    if (!contact) return;
    setModel({
      id: contact.id,
      name: contact.name ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      company: contact.company ?? "",
      role: contact.role ?? "",
      notes: contact.notes ?? "",
      lastSeen: contact.lastSeen ?? "",
    });
  }, [contact?.id]);

  async function onSave() {
    if (!model?.id) return;
    await updateContact(model.id, {
      name: model.name ?? "",
      email: model.email ?? "",
      phone: model.phone ?? "",
      company: model.company ?? "",
      role: model.role ?? "",
      notes: model.notes ?? "",
    });
    navigate("/contacts");
  }

  async function onDelete() {
    if (!model?.id) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(model.id);
    navigate("/contacts");
  }

  if (loading) return <div className="panel">Loading…</div>;
  if (!contact)
    return (
      <div className="panel">
        <div style={{ marginBottom: 12 }}>Contact not found.</div>
        <Link className="btn" to="/contacts">Back to contacts</Link>
      </div>
    );

  return (
    <div className="page">
      {/* Small page crumb row */}
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <Link to="/contacts" className="btn">Back</Link>
        <div className="title" style={{ marginLeft: 6 }}>Contact</div>
      </div>

      {/* Main card */}
      <div className="panel crm-form">
        {/* Card header with Save on the right */}
        <div className="row space-between" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>{contact.name || "Untitled"}</h2>
          <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
          <button className={`tab ${activeTab === "portal" ? "active" : ""}`} onClick={() => setActiveTab("portal")}>Portal</button>
          <button className={`tab ${activeTab === "cases" ? "active" : ""}`} onClick={() => setActiveTab("cases")}>Cases</button>
        </div>

        {activeTab === "profile" && (
          <div className="crm-grid">
            <Field label="Name"  value={model.name ?? ""}  onChange={(v) => setModel((m) => ({ ...m, name: v }))} />
            <Field label="Email" value={model.email ?? ""} onChange={(v) => setModel((m) => ({ ...m, email: v }))} type="email" />

            <Field label="Phone"   value={model.phone ?? ""}   onChange={(v) => setModel((m) => ({ ...m, phone: v }))} />
            <Field label="Company" value={model.company ?? ""} onChange={(v) => setModel((m) => ({ ...m, company: v }))} />

            <Field label="Role" value={model.role ?? ""} onChange={(v) => setModel((m) => ({ ...m, role: v }))} />
            <Field label="Last seen" value={model.lastSeen || "—"} onChange={() => {}} readOnly />

            {/* Notes full width */}
            <div className="crm-field crm-span-full">
              <div className="crm-label">Notes</div>
              <textarea
                className="crm-textarea"
                value={model.notes ?? ""}
                onChange={(e) => setModel((m) => ({ ...m, notes: e.target.value }))}
              />
            </div>

            {/* Actions right aligned */}
            <div className="crm-span-full" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => model.id && simulateLogin(model.id)}>Simulate login</button>
              <button className="btn" onClick={() => model.id && clearLog(model.id)}>Clear log</button>
              <button className="btn btn-danger" onClick={onDelete}>Delete</button>
            </div>
          </div>
        )}

        {activeTab === "portal" && <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>}
        {activeTab === "cases"  && <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "tel";
  readOnly?: boolean;
}) {
  return (
    <div className="crm-field">
      <div className="crm-label">{props.label}</div>
      <input
        className="crm-input"
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.readOnly}
        readOnly={props.readOnly}
        style={props.readOnly ? { background: "#f7f9fc", color: "var(--text-muted)" } : undefined}
      />
    </div>
  );
}
