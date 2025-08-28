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
  const { id = "" } = useParams();
  const nav = useNavigate();

  // Local model with split names
  const [model, setModel] = useState<Partial<Contact> & {
    givenNames?: string;
    surname?: string;
    notes?: string;
  }>({});

  const [active, setActive] = useState<TabKey>("profile");

  useEffect(() => {
    (async () => {
      const c = await getContact(id);
      // naive split for existing single-name records
      const [first = "", ...rest] = (c.name || "").trim().split(" ");
      const last = rest.join(" ");
      setModel({
        ...c,
        givenNames: c.givenNames ?? first,
        surname: c.surname ?? last,
      });
    })();
  }, [id]);

  const fullName = useMemo(() => {
    const fn = `${model.givenNames ?? ""} ${model.surname ?? ""}`.trim();
    return fn || model.name || "";
  }, [model]);

  async function onSave() {
    const payload: Partial<Contact> & {
      givenNames?: string;
      surname?: string;
    } = {
      id,
      name: fullName,
      givenNames: model.givenNames,
      surname: model.surname,
      email: model.email,
      phone: model.phone,
      company: model.company,
      role: model.role,
      lastSeen: model.lastSeen,
      notes: model.notes,
    };
    await updateContact(id, payload);
    alert("Saved.");
  }

  async function onDelete() {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    nav("/contacts");
  }

  return (
    <div className="hub-container page">
      <div className="toolbar">
        <button className="btn" onClick={() => nav(-1)}>Back</button>
        <h1 className="title">Contact</h1>
        <div className="spacer" />
        <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
      </div>

      <div className="card narrow">
        <div className="card-header" style={{justifyContent:"space-between", width:"100%"}}>
          <h2>{fullName || "New contact"}</h2>
          <div className="tabs">
            <button className={`tab ${active === "profile" ? "active" : ""}`} onClick={() => setActive("profile")}>Profile</button>
            <button className={`tab ${active === "portal" ? "active" : ""}`} onClick={() => setActive("portal")}>Portal</button>
            <button className={`tab ${active === "cases" ? "active" : ""}`} onClick={() => setActive("cases")}>Cases</button>
          </div>
        </div>

        {active === "profile" && (
          <div className="form-grid">
            <div>
              <label>Given names</label>
              <input
                value={model.givenNames ?? ""}
                onChange={e => setModel(m => ({...m, givenNames: e.target.value}))}
                placeholder="Given names"
              />
            </div>
            <div>
              <label>Surname</label>
              <input
                value={model.surname ?? ""}
                onChange={e => setModel(m => ({...m, surname: e.target.value}))}
                placeholder="Surname"
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                value={model.phone ?? ""}
                onChange={e => setModel(m => ({...m, phone: e.target.value}))}
                placeholder="Phone"
              />
            </div>
            <div>
              <label>Email</label>
              <input
                value={model.email ?? ""}
                onChange={e => setModel(m => ({...m, email: e.target.value}))}
                placeholder="Email"
              />
            </div>

            <div>
              <label>Company</label>
              <input
                value={model.company ?? ""}
                onChange={e => setModel(m => ({...m, company: e.target.value}))}
                placeholder="Company"
              />
            </div>
            <div>
              <label>Last seen</label>
              <input value={model.lastSeen ?? ""} readOnly />
            </div>

            <div className="form-row--full">
              <label>Notes</label>
              <textarea
                value={model.notes ?? ""}
                onChange={e => setModel(m => ({...m, notes: e.target.value}))}
                placeholder="Notes…"
              />
            </div>

            <div className="form-row--full" style={{display:"flex", justifyContent:"flex-end", gap:8}}>
              <button className="btn" onClick={() => simulateLogin(id)}>Simulate login</button>
              <button className="btn" onClick={() => clearLog(id)}>Clear log</button>
              <button className="btn btn-danger" onClick={onDelete}>Delete</button>
            </div>
          </div>
        )}

        {active === "portal" && (
          <div style={{color:"var(--text-muted)"}}>Portal settings coming soon.</div>
        )}
        {active === "cases" && (
          <div style={{color:"var(--text-muted)"}}>Related cases will appear here.</div>
        )}
      </div>
    </div>
  );
}
