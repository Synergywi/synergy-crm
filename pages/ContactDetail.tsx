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

type Tab = "profile" | "portal" | "cases";

function splitName(full?: string): { givenNames: string; surname: string } {
  const s = (full || "").trim();
  if (!s) return { givenNames: "", surname: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { givenNames: parts[0], surname: "" };
  const surname = parts.pop() || "";
  return { givenNames: parts.join(" "), surname };
}

function joinName(givenNames?: string, surname?: string) {
  return [givenNames?.trim(), surname?.trim()].filter(Boolean).join(" ");
}

export default function ContactDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [active, setActive] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [model, setModel] = useState<Partial<Contact>>({
    givenNames: "",
    surname: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    lastSeen: "",
  });

  // Load contact
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await getContact(id);
        const names =
          (c.givenNames || c.surname)
            ? { givenNames: c.givenNames || "", surname: c.surname || "" }
            : splitName(c.name);

        if (!cancelled) {
          setModel({
            id: c.id,
            givenNames: names.givenNames,
            surname: names.surname,
            email: c.email || "",
            phone: c.phone || "",
            company: c.company || "",
            role: c.role || "",
            notes: c.notes || "",
            lastSeen: c.lastSeen || "",
            // keep legacy field so list/table stays happy
            name: c.name,
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load contact.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fullName = useMemo(
    () => joinName(model.givenNames, model.surname),
    [model.givenNames, model.surname]
  );

  async function onSave() {
    setSaving(true);
    setOk(null);
    setError(null);

    // Build a payload that works for both new & legacy backends
    const payload: Partial<Contact> = {
      givenNames: model.givenNames?.trim() || "",
      surname: model.surname?.trim() || "",
      name: fullName, // legacy servers expect "name"
      email: model.email?.trim() || "",
      phone: model.phone?.trim() || "",
      company: model.company?.trim() || "",
      role: model.role?.trim() || "",
      notes: model.notes || "",
      // do NOT send lastSeen unless you truly need to update it
    };

    try {
      // Try PATCH first via our API helper
      const updated = await updateContact(id, payload);
      setModel(prev => ({ ...prev, ...updated }));
      setOk("Saved.");
    } catch (e: any) {
      const msg = String(e?.message || "");
      const looksLikeMethodIssue =
        /HTTP\s*405/i.test(msg) ||
        /Method Not Allowed/i.test(msg) ||
        /HTTP\s*404/i.test(msg) ||
        /route/i.test(msg) ||
        /validation/i.test(msg) ||
        /bad request/i.test(msg);

      if (!looksLikeMethodIssue) {
        setError(msg || "Failed to save. Please try again.");
        setSaving(false);
        return;
      }

      // Fallback: PUT to the same endpoint for legacy servers
      try {
        const res = await fetch(`/api/contacts/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${text ? ` – ${text}` : ""}`);
        }
        const updated = (await res.json()) as Contact;
        setModel(prev => ({ ...prev, ...updated }));
        setOk("Saved.");
      } catch (e2: any) {
        setError(e2?.message || "Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
      navigate("/contacts");
    } catch (e: any) {
      setError(e?.message || "Failed to delete contact.");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="header">
          <div className="title">Contact</div>
        </div>
        <div className="container">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <div className="title">Synergy CRM 2</div>
      </div>
      <div className="container">
        <div className="row" style={{ alignItems: "center", marginBottom: 8 }}>
          <Link to="/contacts" className="btn" style={{ marginRight: 8 }}>
            Back
          </Link>
          <div className="title" style={{ marginRight: "auto" }}>
            Contact
          </div>
          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? "Saving…" : "Save Contact"}
          </button>
        </div>

        <div className="panel">
          <div className="panel-header" style={{ display: "flex", gap: 8 }}>
            <div className="title">{fullName || "New contact"}</div>
            <div className="spacer" />
            <div className="tabs">
              <button
                className={`tab ${active === "profile" ? "active" : ""}`}
                onClick={() => setActive("profile")}
              >
                Profile
              </button>
              <button
                className={`tab ${active === "portal" ? "active" : ""}`}
                onClick={() => setActive("portal")}
              >
                Portal
              </button>
              <button
                className={`tab ${active === "cases" ? "active" : ""}`}
                onClick={() => setActive("cases")}
              >
                Cases
              </button>
            </div>
          </div>

          {error && (
            <div
              className="alert"
              style={{
                background: "#ffecef",
                border: "1px solid #ffd6dc",
                color: "#b21e3a",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}
          {ok && (
            <div
              className="alert"
              style={{
                background: "#eef9f0",
                border: "1px solid #d6f5dc",
                color: "#0c7a2b",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              {ok}
            </div>
          )}

          {active === "profile" && (
            <div className="grid-2" style={{ gap: 12 }}>
              <Field
                label="Given names"
                value={model.givenNames || ""}
                onChange={v => setModel(m => ({ ...m, givenNames: v }))}
              />
              <Field
                label="Surname"
                value={model.surname || ""}
                onChange={v => setModel(m => ({ ...m, surname: v }))}
              />
              <Field
                label="Phone"
                value={model.phone || ""}
                onChange={v => setModel(m => ({ ...m, phone: v }))}
              />
              <Field
                label="Email"
                value={model.email || ""}
                onChange={v => setModel(m => ({ ...m, email: v }))}
              />
              <Field
                label="Company"
                value={model.company || ""}
                onChange={v => setModel(m => ({ ...m, company: v }))}
              />
              <Field label="Last seen" value={model.lastSeen || "—"} readOnly />
              <TextArea
                label="Notes"
                value={model.notes || ""}
                onChange={v => setModel(m => ({ ...m, notes: v }))}
                rows={6}
              />
            </div>
          )}

          {active === "portal" && (
            <div style={{ color: "var(--text-muted)" }}>
              Portal settings coming soon.
            </div>
          )}

          {active === "cases" && (
            <div style={{ color: "var(--text-muted)" }}>
              Related cases will appear here.
            </div>
          )}

          <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn" onClick={() => simulateLogin(id)}>
              Simulate login
            </button>
            <button className="btn" onClick={() => clearLog(id)}>
              Clear log
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small input component that follows the theme */
function Field(props: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="field">
      <div className="label">{props.label}</div>
      <input
        className="input"
        value={props.value}
        readOnly={props.readOnly}
        onChange={e => props.onChange?.(e.target.value)}
        placeholder={props.label}
      />
    </label>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="field" style={{ gridColumn: "1 / -1" }}>
      <div className="label">{props.label}</div>
      <textarea
        className="input"
        rows={props.rows || 5}
        value={props.value}
        onChange={e => props.onChange?.(e.target.value)}
        placeholder={props.label}
      />
    </label>
  );
}
