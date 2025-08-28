// /pages/ContactDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  listContacts,
  updateContact,
  deleteContact,
  simulateLogin,
  clearLog,
  type Contact,
} from "../web/lib/contactsApi";

/** Split full name into given + surname (best-effort). */
function splitName(full?: string) {
  const safe = (full || "").trim().replace(/\s+/g, " ");
  if (!safe) return { given: "", surname: "" };
  const parts = safe.split(" ");
  if (parts.length === 1) return { given: parts[0], surname: "" };
  const surname = parts.pop() as string;
  return { given: parts.join(" "), surname };
}

/** Join given + surname into a single display name. */
function joinName(given: string, surname: string) {
  const g = (given || "").trim();
  const s = (surname || "").trim();
  return [g, s].filter(Boolean).join(" ");
}

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Local form model (includes separate given/surname fields)
  const [{ given, surname, email, phone, company, role, notes, lastSeen }, setModel] = useState({
    given: "",
    surname: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    notes: "",
    lastSeen: "",
  });

  // Load the contact by ID (via listContacts to keep API compatibility).
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await listContacts();
      const found = all.find(c => String(c.id) === String(id)) || null;
      if (!isMounted) return;
      setContact(found);
      if (found) {
        const parts = splitName(found.name);
        setModel({
          given: parts.given,
          surname: parts.surname,
          email: found.email || "",
          phone: found.phone || "",
          company: found.company || "",
          role: found.role || "",
          notes: (found as any).notes || "",
          lastSeen: found.lastSeen || "",
        });
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  const title = useMemo(() => joinName(given, surname) || "Contact", [given, surname]);

  async function onSave() {
    if (!contact) return;
    const payload: Partial<Contact> = {
      name: joinName(given, surname),
      email,
      phone,
      company,
      role,
      // notes isn't always present on every back end; include if supported
      ...(notes !== undefined ? { notes } as any : {}),
    };
    // Most implementations use (id, changes). If your API expects a full object, it will still work
    await updateContact(contact.id as any, payload as any);
    navigate("/contacts");
  }

  async function onDelete() {
    if (!contact) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(contact.id as any);
    navigate("/contacts");
  }

  if (!contact) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <div className="panel" style={{ maxWidth: 980, margin: "12px auto" }}>
          <div>Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 24 }}>
      {/* Back + Page title row (outside the card) */}
      <div className="row" style={{ alignItems: "center", gap: 12, margin: "0 0 12px 0" }}>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
        <div className="title" style={{ fontSize: 18, fontWeight: 600 }}>Contact</div>
      </div>

      {/* Card */}
      <div
        className="panel"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: 16,
        }}
      >
        {/* Card header: title left, Save right */}
        <div
          className="row"
          style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}
        >
          <div
            className="panel-title"
            style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}
            title={title}
          >
            {title}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 12 }}>
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

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Given names"
              value={given}
              onChange={v => setModel(m => ({ ...m, given: v }))}
            />
            <Field
              label="Surname"
              value={surname}
              onChange={v => setModel(m => ({ ...m, surname: v }))}
            />
            <Field
              label="Phone"
              value={phone}
              onChange={v => setModel(m => ({ ...m, phone: v }))}
            />
            <Field
              label="Email"
              value={email}
              onChange={v => setModel(m => ({ ...m, email: v }))}
            />
            <Field
              label="Company"
              value={company}
              onChange={v => setModel(m => ({ ...m, company: v }))}
            />
            <Field
              label="Last seen"
              value={lastSeen}
              onChange={v => setModel(m => ({ ...m, lastSeen: v }))}
              readOnly
            />
            {/* Notes full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="Notes"
                multi
                value={notes}
                onChange={v => setModel(m => ({ ...m, notes: v }))}
              />
            </div>

            {/* Footer actions, right aligned, full width */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 4,
              }}
            >
              <button className="btn" onClick={() => simulateLogin(contact.id as any)}>
                Simulate login
              </button>
              <button className="btn" onClick={() => clearLog(contact.id as any)}>
                Clear log
              </button>
              <button className="btn btn-danger" onClick={onDelete}>
                Delete
              </button>
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

/** Reusable field with HubSpot-ish look */
function Field(props: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  multi?: boolean;
}) {
  const { label, value, onChange, multi, readOnly } = props;
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      {multi ? (
        <textarea
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          style={{
            width: "100%",
            minHeight: 100,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 12px",
            font: "inherit",
            outline: "none",
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          style={{
            width: "100%",
            height: 38,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "0 12px",
            font: "inherit",
            outline: "none",
          }}
        />
      )}
    </label>
  );
}
