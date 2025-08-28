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

function splitName(full?: string): { givenNames: string; surname: string } {
  const n = (full || "").trim().replace(/\s+/g, " ");
  if (!n) return { givenNames: "", surname: "" };
  const parts = n.split(" ");
  if (parts.length === 1) return { givenNames: parts[0], surname: "" };
  const surname = parts.pop() as string;
  const givenNames = parts.join(" ");
  return { givenNames, surname };
}

function joinName(givenNames: string, surname: string): string {
  return [givenNames?.trim(), surname?.trim()].filter(Boolean).join(" ");
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [error, setError] = useState<string | null>(null);

  // Form model
  const [givenNames, setGivenNames] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  const fullName = useMemo(() => joinName(givenNames, surname), [givenNames, surname]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setError(null);
      setLoading(true);
      try {
        const c = await getContact(id);
        if (!alive) return;
        const parts = splitName(c.name);
        setGivenNames(parts.givenNames);
        setSurname(parts.surname);
        setEmail(c.email || "");
        setPhone(c.phone || "");
        setCompany(c.company || "");
        setNotes(c.notes || "");
        setLastSeen(c.lastSeen ?? null);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load contact.");
      } finally {
        alive = false;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const patch: Partial<Contact> = {
        name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        notes: notes || undefined,
      };
      await updateContact(id, patch);
      // Optionally show a tiny UX confirmation:
      // You can wire a toast here if you want.
    } catch (e: any) {
      console.error(e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    try {
      await deleteContact(id);
      navigate("/contacts");
    } catch (e: any) {
      console.error(e);
      alert("Failed to delete.");
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="panel">Loading…</div>
      </div>
    );
  }

  return (
    <div className="container contact-page">
      {/* Page header */}
      <div className="row" style={{ marginBottom: 16, justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 8 }}>
          <Link to="/contacts" className="btn">Back</Link>
          <h1 style={{ margin: 0, fontSize: 18 }}>Contact</h1>
        </div>

        <button
          className="btn btn-primary"
          form="contact-form"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Contact"}
        </button>
      </div>

      {/* Card */}
      <div className="card contact-card">
        <div className="card-header">
          <div className="card-title" style={{ fontSize: 16 }}>
            {fullName || "New contact"}
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ borderBottom: "none", margin: 0 }}>
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
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ffd8d6",
              background: "#fff5f5",
              color: "#7f1d1d",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {activeTab === "profile" && (
          <form id="contact-form" onSubmit={onSave}>
            <div className="grid" style={{ marginTop: 4 }}>
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
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div>
                <label>Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company"
                />
              </div>

              <div>
                <label>Last seen</label>
                <input type="text" value={lastSeen || "—"} disabled />
              </div>

              <div className="full">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes…"
                />
              </div>
            </div>
          </form>
        )}

        {activeTab === "portal" && (
          <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
        )}

        {activeTab === "cases" && (
          <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
        )}

        {/* Footer actions */}
        <div className="row" style={{ marginTop: 16, justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => id && simulateLogin(id)}>
            Simulate login
          </button>
          <button className="btn" onClick={() => id && clearLog(id)}>
            Clear log
          </button>
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
