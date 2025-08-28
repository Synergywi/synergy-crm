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

/** naive splitter: last word -> surname; the rest -> given names */
function splitName(full: string | undefined) {
  const s = (full || "").trim().replace(/\s+/g, " ");
  if (!s) return { given: "", surname: "" };
  const parts = s.split(" ");
  if (parts.length === 1) return { given: parts[0], surname: "" };
  const surname = parts.pop() as string;
  return { given: parts.join(" "), surname };
}

/** joiner that avoids extra spaces */
function joinName(given: string, surname: string) {
  return [given?.trim(), surname?.trim()].filter(Boolean).join(" ");
}

type TabKey = "profile" | "portal" | "cases";

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  // Form fields (split name)
  const [given, setGiven] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const c = await getContact(id);
      setModel(c);
      const { given, surname } = splitName(c?.name);
      setGiven(given);
      setSurname(surname);
      setEmail(c?.email || "");
      setPhone(c?.phone || "");
      setCompany(c?.company || "");
      setRole(c?.role || "");
      setNotes(c?.notes || "");
      setLoading(false);
    })();
  }, [id]);

  const lastSeen = useMemo(() => model?.lastSeen ?? "—", [model]);

  async function onSave() {
    if (!id) return;
    const payload: Partial<Contact> = {
      name: joinName(given, surname),
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      role: role || undefined,
      notes: notes || undefined,
    };
    const updated = await updateContact(id, payload);
    setModel(updated);
    alert("Contact saved");
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    navigate("/contacts");
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Contact</div>
          </div>
          <div className="card-body">Loading…</div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Contact</div>
          </div>
          <div className="card-body">Not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Top bar: Back + page title lives in content area to keep alignment */}
      <div className="container" style={{ marginBottom: 12 }}>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
        <div style={{ height: 8 }} />
        <div className="title">Contact</div>
      </div>

      <div className="container">
        <div className="card">
          {/* Card header with Save on right */}
          <div className="card-header">
            <div className="card-title">{joinName(given, surname) || "(new contact)"}</div>
            <button className="btn btn-primary" onClick={onSave}>Save Contact</button>
          </div>

          {/* Tabs */}
          <div className="card-tabs">
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

          {/* Card body */}
          <div className="card-body">
            {activeTab === "profile" && (
              <form className="crm-grid" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                {/* Given + Surname */}
                <FormGroup label="Given names">
                  <input
                    placeholder="Given names"
                    value={given}
                    onChange={(e) => setGiven(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Surname">
                  <input
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </FormGroup>

                {/* Phone + Email */}
                <FormGroup label="Phone">
                  <input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Email">
                  <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormGroup>

                {/* Company + Last seen (readonly) */}
                <FormGroup label="Company">
                  <input
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Last seen">
                  <input value={lastSeen} readOnly />
                </FormGroup>

                {/* Role spans full width (or put it left and notes right if you prefer) */}
                <FormGroup label="Role" span={2}>
                  <input
                    placeholder="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Notes" span={2}>
                  <textarea
                    placeholder="Notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                  />
                </FormGroup>

                {/* Footer actions (inside the card, right aligned) */}
                <div className="crm-span-2" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" className="btn" onClick={() => simulateLogin(model.id)}>Simulate login</button>
                  <button type="button" className="btn" onClick={() => clearLog(model.id)}>Clear log</button>
                  <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
                </div>
              </form>
            )}

            {activeTab === "portal" && (
              <div style={{ color: "var(--text-muted)" }}>Portal settings coming soon.</div>
            )}

            {activeTab === "cases" && (
              <div style={{ color: "var(--text-muted)" }}>Related cases will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared labeled input block – aligns with hubspot-theme.css spacing */
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
