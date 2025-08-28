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
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<Contact | null>(null);
  const [tab, setTab] = useState<TabKey>("profile");
  const [busy, setBusy] = useState(false);

  // local form
  const [form, setForm] = useState<Partial<Contact>>({});

  useEffect(() => {
    (async () => {
      if (!id) return;
      const c = await getContact(id);
      setData(c);
      setForm({
        name: c?.name ?? "",
        email: c?.email ?? "",
        phone: c?.phone ?? "",
        company: c?.company ?? "",
        role: c?.role ?? "",
        notes: c?.notes ?? "",
      });
    })();
  }, [id]);

  const title = useMemo(() => data?.name ?? "Contact", [data]);

  async function handleSave() {
    if (!id) return;
    setBusy(true);
    try {
      await updateContact(id, form);
      const fresh = await getContact(id);
      setData(fresh);
      // keep form in sync in case the API normalized anything
      setForm({
        name: fresh?.name ?? "",
        email: fresh?.email ?? "",
        phone: fresh?.phone ?? "",
        company: fresh?.company ?? "",
        role: fresh?.role ?? "",
        notes: fresh?.notes ?? "",
      });
      alert("Saved");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    navigate("/contacts");
  }

  if (!id) {
    return (
      <div className="page">
        <div className="panel">Invalid contact id.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="row space-between" style={{ alignItems: "center" }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Contact</h2>
            <span className="pill">{title}</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Link className="btn" to="/contacts">Back</Link>
            <button className="btn btn-primary" onClick={handleSave} disabled={busy}>
              Save Contact
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ margin: "0 0 12px" }}>{title}</h3>

        {/* tabs */}
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
            <FieldRow>
              <LabeledInput
                label="Name"
                value={form.name ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <LabeledInput
                label="Email"
                value={form.email ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <LabeledInput
                label="Phone"
                value={form.phone ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
              <LabeledInput
                label="Company"
                value={form.company ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
              />
              <LabeledInput
                label="Role"
                value={form.role ?? ""}
                onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              />
            </FieldRow>

            <LabeledTextarea
              label="Notes"
              value={form.notes ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            />

            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => simulateLogin(id)}>Simulate login</button>
              <button className="btn" onClick={() => clearLog(id)}>Clear log</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <LabeledRO label="Last seen" value={data?.lastSeen || "—"} />
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
  );
}

/* ---------- small presentational helpers ---------- */

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function LabeledInput(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ flex: "1 1 260px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </label>
  );
}

function LabeledTextarea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "block", width: "100%", marginTop: 4 }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{ minHeight: 100 }}
      />
    </label>
  );
}

function LabeledRO(props: { label: string; value: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{props.label}</div>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          minHeight: 38,
        }}
      >
        {props.value}
      </div>
    </label>
  );
}
