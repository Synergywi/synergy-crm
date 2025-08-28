// /pages/ContactDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getContact,
  updateContact,
  deleteContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState<Contact | null>(null);
  const [tab, setTab] = useState<TabKey>("profile");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      const c = await getContact(id);
      if (alive) setModel(c);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const canSave = useMemo(() => !!model?.name?.trim(), [model]);

  async function onSave() {
    if (!model) return;
    await updateContact(model.id, {
      name: model.name,
      email: model.email,
      phone: model.phone,
      company: model.company,
      role: model.role,
      notes: model.notes,
    });
    navigate("/contacts");
  }

  async function onDelete() {
    if (!model) return;
    if (!confirm(`Delete ${model.name}?`)) return;
    await deleteContact(model.id);
    navigate("/contacts");
  }

  if (!id) {
    return <div className="panel">Invalid contact id.</div>;
  }
  if (!model) {
    return <div className="panel">Loading…</div>;
  }

  return (
    <div className="page">
      <div className="header">
        <div className="row space-between">
          <div className="title">Contact</div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => navigate(-1)}>Back</button>
            <button className="btn btn-primary" disabled={!canSave} onClick={onSave}>
              Save Contact
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{model.name}</h3>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
          <button className={`tab ${tab === "portal" ? "active" : ""}`} onClick={() => setTab("portal")}>Portal</button>
          <button className={`tab ${tab === "cases" ? "active" : ""}`} onClick={() => setTab("cases")}>Cases</button>
        </div>

        {tab === "profile" && (
          <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
            <Field label="Name" value={model.name} onChange={v => setModel({ ...model, name: v })} />
            <Field label="Email" value={model.email ?? ""} onChange={v => setModel({ ...model, email: v })} />
            <Field label="Phone" value={model.phone ?? ""} onChange={v => setModel({ ...model, phone: v })} />
            <Field label="Company" value={model.company ?? ""} onChange={v => setModel({ ...model, company: v })} />
            <Field label="Role" value={model.role ?? ""} onChange={v => setModel({ ...model, role: v })} />
            <Area label="Notes" value={model.notes ?? ""} onChange={v => setModel({ ...model, notes: v })} />
            <ReadOnly label="Last seen" value={model.lastSeen ?? "—"} />

            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => simulateLogin(model.id)}>Simulate login</button>
              <button className="btn" onClick={() => clearLog(model.id)}>Clear log</button>
              <button className="btn btn-danger" onClick={onDelete}>Delete</button>
            </div>
          </div>
        )}

        {tab === "portal" && (
          <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
        )}

        {tab === "cases" && (
          <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
        )}
      </div>
    </div>
  );
}

/* --- Small field helpers (styled by the theme) --- */
function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ flex: "1 1 260px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <input value={props.value} onChange={e => props.onChange(e.target.value)} />
    </label>
  );
}
function Area(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ flex: "1 1 540px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <textarea style={{ minHeight: 96 }} value={props.value} onChange={e => props.onChange(e.target.value)} />
    </label>
  );
}
function ReadOnly(props: { label: string; value: string }) {
  return (
    <div style={{ flex: "1 1 260px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", minHeight: 38 }}>
        {props.value}
      </div>
    </div>
  );
}
