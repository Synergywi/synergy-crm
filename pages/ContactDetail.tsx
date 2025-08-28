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

  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Contact | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      const data = await getContact(id);
      if (mounted) {
        setModel(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const name = useMemo(() => model?.name || "Contact", [model]);

  function patch<K extends keyof Contact>(key: K, val: Contact[K]) {
    if (!model) return;
    setModel({ ...model, [key]: val });
  }

  async function onSave() {
    if (!model) return;
    await updateContact(model.id, {
      name: model.name,
      email: model.email,
      phone: model.phone,
      company: model.company,
      role: model.role,
      notes: (model as any).notes,     // notes is optional on some seeds
    });
  }

  async function onDelete() {
    if (!model) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(model.id);
    navigate("/contacts");
  }

  if (loading || !model) {
    return (
      <div className="page">
        <div className="header container">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">Live preview</div>
        </div>
        <div className="container">
          <div className="card"><div className="card-body">Loading…</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="header container">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/contacts" className="btn">Back</Link>
          <h1 className="title">Contact</h1>
        </div>
        {/* keep empty slot here so header spacing remains consistent */}
      </div>

      <div className="container">
        <div className="card">
          {/* Card header with CTA aligned to card padding */}
          <div className="card-header">
            <div className="card-title">{name}</div>
            <button onClick={onSave} className="btn btn-primary">Save Contact</button>
          </div>

          {/* Tabs (aligned to card edges) */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >Profile</button>
            <button
              className={`tab ${activeTab === "portal" ? "active" : ""}`}
              onClick={() => setActiveTab("portal")}
            >Portal</button>
            <button
              className={`tab ${activeTab === "cases" ? "active" : ""}`}
              onClick={() => setActiveTab("cases")}
            >Cases</button>
          </div>

          {/* Body */}
          <div className="card-body">
            {activeTab === "profile" && (
              <div className="crm-grid">
                <FormGroup label="Name">
                  <input
                    value={model.name ?? ""}
                    onChange={(e) => patch("name", e.target.value)}
                    placeholder="Full name"
                  />
                </FormGroup>

                <FormGroup label="Email">
                  <input
                    value={model.email ?? ""}
                    onChange={(e) => patch("email", e.target.value)}
                    placeholder="Email address"
                  />
                </FormGroup>

                <FormGroup label="Phone">
                  <input
                    value={model.phone ?? ""}
                    onChange={(e) => patch("phone", e.target.value)}
                    placeholder="Phone"
                  />
                </FormGroup>

                <FormGroup label="Company">
                  <input
                    value={model.company ?? ""}
                    onChange={(e) => patch("company", e.target.value)}
                    placeholder="Company"
                  />
                </FormGroup>

                <FormGroup label="Role">
                  <input
                    value={model.role ?? ""}
                    onChange={(e) => patch("role", e.target.value)}
                    placeholder="Role"
                  />
                </FormGroup>

                <FormGroup label="Last seen">
                  <input className="input-ghost" readOnly value={model.lastSeen ?? "—"} />
                </FormGroup>

                <FormGroup label="Notes" span={2}>
                  <textarea
                    value={(model as any).notes ?? ""}
                    onChange={(e) => patch("notes" as keyof Contact, e.target.value as any)}
                    placeholder="Notes…"
                  />
                </FormGroup>
              </div>
            )}

            {activeTab === "portal" && (
              <div style={{ color: "var(--text-muted)" }}>
                Portal preferences coming soon.
              </div>
            )}

            {activeTab === "cases" && (
              <div style={{ color: "var(--text-muted)" }}>
                Related cases will appear here.
              </div>
            )}
          </div>

          {/* Footer actions aligned with card edges */}
          <div className="card-footer">
            <button className="btn" onClick={() => simulateLogin(model.id)}>Simulate login</button>
            <button className="btn" onClick={() => clearLog(model.id)}>Clear log</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small helper ---------- */
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
