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
  const [tab, setTab] = useState<TabKey>("profile");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<Partial<Contact> | null>(null);

  const selected = useMemo(
    () => contacts.find(c => c.id === id) || null,
    [contacts, id]
  );

  useEffect(() => {
    (async () => {
      setBusy(true);
      try {
        const data = await listContacts();
        setContacts(data);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setModel({
      id: selected.id,
      name: selected.name || "",
      email: selected.email || "",
      phone: selected.phone || "",
      company: selected.company || "",
      role: selected.role || "",
      notes: (selected as any).notes || "",
      lastSeen: selected.lastSeen || "",
    });
  }, [selected]);

  async function onSave() {
    if (!model?.id) return;
    setSaving(true);
    try {
      await updateContact(model.id, {
        name: model.name ?? "",
        email: model.email ?? "",
        phone: model.phone ?? "",
        company: model.company ?? "",
        role: model.role ?? "",
        notes: model.notes ?? "",
      });
      const fresh = await listContacts();
      setContacts(fresh);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!model?.id) return;
    if (!confirm("Delete this contact?")) return;
    setSaving(true);
    try {
      await deleteContact(model.id);
      navigate("/contacts");
    } finally {
      setSaving(false);
    }
  }

  if (busy || !selected || !model) {
    return (
      <div className="page">
        <div className="panel">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <div className="row space-between" style={{ alignItems: "center" }}>
          <div className="title">Contact</div>
          <div className="row" style={{ gap: 8 }}>
            <Link to="/contacts" className="btn">Back</Link>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save Contact"}
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ paddingTop: 16 }}>
        <div className="crm-form">
          <h3 style={{ margin: "0 0 12px" }}>{model.name || "New contact"}</h3>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
              Profile
            </button>
            <button className={`tab ${tab === "portal" ? "active" : ""}`} onClick={() => setTab("portal")}>
              Portal
            </button>
            <button className={`tab ${tab === "cases" ? "active" : ""}`} onClick={() => setTab("cases")}>
              Cases
            </button>
          </div>

          {tab === "profile" && (
            <>
              <div className="crm-grid">
                <Field
                  label="Name"
                  value={model.name ?? ""}
                  onChange={v => setModel({ ...model, name: v })}
                />
                <Field
                  label="Email"
                  value={model.email ?? ""}
                  onChange={v => setModel({ ...model, email: v })}
                  type="email"
                />

                <Field
                  label="Phone"
                  value={model.phone ?? ""}
                  onChange={v => setModel({ ...model, phone: v })}
                />
                <Field
                  label="Company"
                  value={model.company ?? ""}
                  onChange={v => setModel({ ...model, company: v })}
                />

                <Field
                  label="Role"
                  value={model.role ?? ""}
                  onChange={v => setModel({ ...model, role: v })}
                />
                <ReadOnlyField label="Last seen" value={model.lastSeen || "—"} />

                <div className="crm-field" style={{ gridColumn: "1 / -1" }}>
                  <Label>Notes</Label>
                  <textarea
                    className="crm-textarea"
                    value={(model.notes as string) ?? ""}
                    onChange={e => setModel({ ...model, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="row" style={{ gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => simulateLogin(selected.id)}>Simulate login</button>
                <button className="btn" onClick={() => clearLog(selected.id)}>Clear log</button>
                <button className="btn btn-danger" onClick={onDelete} disabled={saving}>Delete</button>
              </div>
            </>
          )}

          {tab === "portal" && (
            <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
          )}

          {tab === "cases" && (
            <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
      {children}
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div className="crm-field">
      <Label>{props.label}</Label>
      <input
        className="crm-input"
        type={props.type ?? "text"}
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="crm-field">
      <Label>{label}</Label>
      <input className="crm-input" value={String(value)} readOnly />
    </div>
  );
}
