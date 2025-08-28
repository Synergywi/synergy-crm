// /pages/ContactDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const [model, setModel] = useState<Partial<Contact>>({});
  const [givenNames, setGivenNames] = useState("");
  const [surname, setSurname] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const contactName = useMemo(
    () => `${givenNames} ${surname}`.trim() || "Contact",
    [givenNames, surname]
  );

  useEffect(() => {
    (async () => {
      if (!id) return;
      const c = await getContact(id);
      setModel(c);
      // Split name for UI (API stores name as single string)
      const parts = (c.name || "").split(" ");
      setGivenNames(parts.slice(0, -1).join(" ") || parts[0] || "");
      setSurname(parts.length > 1 ? parts[parts.length - 1] : "");
    })();
  }, [id]);

  async function onSave() {
    if (!id) return;
    const payload: Partial<Contact> = {
      ...model,
      name: `${givenNames} ${surname}`.trim(),
    };
    await updateContact(id, payload);
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    navigate("/contacts");
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
        <div style={{ fontWeight: 700, marginLeft: 12 }}>Contact</div>
      </div>

      <div className="contact-page">
        <div className="card contact-card lg">
          <div className="card-header">
            <div className="card-title">{contactName}</div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
            </div>
          </div>

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
            <div className="grid">
              <div>
                <label>Given names</label>
                <input
                  type="text"
                  value={givenNames}
                  onChange={(e) => setGivenNames(e.target.value)}
                  placeholder="Given names"
                />
              </div>
              <div>
                <label>Surname</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                />
              </div>

              <div>
                <label>Phone</label>
                <input
                  type="text"
                  value={model.phone ?? ""}
                  onChange={(e) => setModel({ ...model, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={model.email ?? ""}
                  onChange={(e) => setModel({ ...model, email: e.target.value })}
                  placeholder="Email"
                />
              </div>

              <div>
                <label>Company</label>
                <input
                  type="text"
                  value={model.company ?? ""}
                  onChange={(e) => setModel({ ...model, company: e.target.value })}
                  placeholder="Company"
                />
              </div>
              <div>
                <label>Last seen</label>
                <input type="text" value={model.lastSeen ?? "—"} readOnly />
              </div>

              <div className="full">
                <label>Notes</label>
                <textarea
                  value={(model as any).notes ?? ""}
                  onChange={(e) => setModel({ ...model, notes: e.target.value as any })}
                  placeholder="Notes…"
                />
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

          <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn" onClick={() => id && simulateLogin(id)}>Simulate login</button>
            <button className="btn" onClick={() => id && clearLog(id)}>Clear log</button>
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
