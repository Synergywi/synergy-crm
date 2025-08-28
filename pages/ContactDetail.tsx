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
  const navigate = useNavigate();

  const [all, setAll] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const contact = useMemo(
    () => all.find((c) => c.id === id),
    [all, id]
  );

  const [form, setForm] = useState<Partial<Contact>>({});

  async function refresh() {
    const data = await listContacts();
    setAll(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (contact) {
      setForm({
        id: contact.id,
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        role: contact.role || "",
        notes: (contact as any).notes || "",
        lastSeen: contact.lastSeen || "",
      });
    }
  }, [contact?.id]); // reset on id change

  async function onSave() {
    if (!contact?.id) return;
    setSaving(true);
    try {
      // Try both common signatures for maximum compatibility
      const patch = {
        name: form.name || "",
        email: form.email || "",
        phone: form.phone || "",
        company: form.company || "",
        role: form.role || "",
        notes: form.notes || "",
      };

      try {
        // updateContact(id, patch)
        await (updateContact as unknown as (a: any, b?: any) => Promise<any>)(contact.id, patch);
      } catch {
        // updateContact({ id, ...patch })
        await (updateContact as unknown as (a: any) => Promise<any>)({ id: contact.id, ...patch });
      }

      await refresh();
      alert("Saved");
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!contact) {
    return (
      <div className="panel">
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-muted" onClick={() => navigate("/contacts")}>Back</button>
          <div style={{ color: "var(--text-muted)" }}>Contact not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <div className="title">Synergy CRM 2</div>
        <div className="badge">Live preview</div>
      </div>

      <div className="panel">
        <div className="row space-between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Contact</h2>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-muted" onClick={() => navigate("/contacts")}>
              Back
            </button>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save Contact"}
            </button>
          </div>
        </div>

        <h3 style={{ margin: "0 0 8px" }}>{contact.name}</h3>

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
          <>
            <FormRow label="Name">
              <input
                value={form.name || ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </FormRow>

            <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
              <Labeled style={{ flex: "1 1 280px" }} label="Email">
                <input
                  value={form.email || ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Labeled>

              <Labeled style={{ flex: "1 1 220px" }} label="Phone">
                <input
                  value={form.phone || ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Labeled>

              <Labeled style={{ flex: "1 1 220px" }} label="Company">
                <input
                  value={form.company || ""}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                />
              </Labeled>

              <Labeled style={{ flex: "1 1 220px" }} label="Role">
                <input
                  value={form.role || ""}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </Labeled>
            </div>
