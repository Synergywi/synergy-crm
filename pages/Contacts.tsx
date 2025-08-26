import React, { useEffect, useMemo, useState } from "react";

/** ------------ Types ------------ */
type Contact = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  role?: string;
  lastSeen?: string | number; // ISO string or epoch ms
  createdAt?: string;
};

/** ------------ Utilities ------------ */
function fmtRelative(ts?: string | number) {
  if (!ts) return "—";
  const t = typeof ts === "string" ? Date.parse(ts) : ts;
  if (isNaN(t)) return "—";
  const delta = Date.now() - t;
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function liveDotColor(ts?: string | number) {
  if (!ts) return "#97A3B6"; // grey
  const t = typeof ts === "string" ? Date.parse(ts) : ts;
  if (isNaN(t)) return "#97A3B6";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins <= 10) return "#14b8a6"; // teal = recently active
  if (mins <= 120) return "#f59e0b"; // amber = recently
  return "#97A3B6"; // grey = stale
}

/** ------------ API helpers ------------ */
async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

async function listContacts() {
  return api<Contact[]>("/api/contacts");
}
async function createContact(payload: Partial<Contact>) {
  return api<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(payload) });
}
async function updateContact(id: string, payload: Partial<Contact>) {
  return api<Contact>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
async function deleteContact(id: string) {
  await api<void>(`/api/contacts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** ------------ Form Modal (inline, no portal) ------------ */
type FormState = {
  id?: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  role?: string;
};

function emptyForm(): FormState {
  return { name: "" };
}

function ContactFormModal({
  open,
  initial,
  onCancel,
  onSubmit,
  busy,
  title,
}: {
  open: boolean;
  initial: FormState;
  onCancel: () => void;
  onSubmit: (values: FormState) => void;
  busy?: boolean;
  title: string;
}) {
  const [v, setV] = useState<FormState>(initial);
  useEffect(() => setV(initial), [initial, open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16, 24, 40, 0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      aria-modal
      role="dialog"
    >
      <div className="card" style={{ width: 520, maxWidth: "90vw" }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>{title}</div>

        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, color: "#51607A", marginBottom: 4 }}>Name *</div>
            <input
              value={v.name}
              onChange={(e) => setV((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Alex Maxwell"
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, color: "#51607A", marginBottom: 4 }}>Company</div>
            <input
              value={v.company || ""}
              onChange={(e) => setV((s) => ({ ...s, company: e.target.value }))}
              placeholder="e.g. Contoso Pty Ltd"
              style={inputStyle}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, color: "#51607A", marginBottom: 4 }}>Email</div>
            <input
              type="email"
              value={v.email || ""}
              onChange={(e) => setV((s) => ({ ...s, email: e.target.value }))}
              placeholder="name@company.com"
              style={inputStyle}
            />
          </label>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label>
              <div style={{ fontSize: 12, color: "#51607A", marginBottom: 4 }}>Phone</div>
              <input
                value={v.phone || ""}
                onChange={(e) => setV((s) => ({ ...s, phone: e.target.value }))}
                placeholder="(xxx) xxx-xxxx"
                style={inputStyle}
              />
            </label>

            <label>
              <div style={{ fontSize: 12, color: "#51607A", marginBottom: 4 }}>Role</div>
              <input
                value={v.role || ""}
                onChange={(e) => setV((s) => ({ ...s, role: e.target.value }))}
                placeholder="e.g. Investigator"
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(v)}
            disabled={busy || !v.name.trim()}
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #e6e9f0",
  outline: "none",
};

/** ------------ Page ------------ */
export default function ContactsPage() {
  const [items, setItems] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());
  const [formTitle, setFormTitle] = useState("Add contact");

  const selected = useMemo(
    () => items?.find((c) => c.id === selectedId) || null,
    [items, selectedId]
  );

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await listContacts();
        setItems(data);
        if (data.length && !selectedId) setSelectedId(data[0].id);
      } catch (e: any) {
        setError(e.message || "Failed to load contacts");
        setItems([]);
      }
    })();
  }, []); // load once

  function openCreate() {
    setFormTitle("Add contact");
    setFormInitial(emptyForm());
    setModalOpen(true);
  }
  function openEdit(c: Contact) {
    setFormTitle("Edit contact");
    setFormInitial({
      id: c.id,
      name: c.name ?? "",
      company: c.company,
      email: c.email,
      phone: c.phone,
      role: c.role,
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: FormState) {
    try {
      setFormBusy(true);
      if (values.id) {
        // update
        const updated = await updateContact(values.id, {
          name: values.name.trim(),
          company: values.company?.trim() || undefined,
          email: values.email?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          role: values.role?.trim() || undefined,
        });
        setItems((prev) =>
          (prev || []).map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        // create
        const created = await createContact({
          name: values.name.trim(),
          company: values.company?.trim() || undefined,
          email: values.email?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          role: values.role?.trim() || undefined,
        });
        setItems((prev) => [created, ...(prev || [])]);
        setSelectedId(created.id);
      }
      setModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    try {
      const prev = items || [];
      setItems(prev.filter((c) => c.id !== id));
      if (selectedId === id) setSelectedId(null);
      await deleteContact(id);
    } catch (e: any) {
      alert(e.message || "Delete failed");
      // (Optional) reload from server to recover exact state
      try {
        const data = await listContacts();
        setItems(data);
      } catch {}
    }
  }

  return (
    <>
      {/* Top card: list */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>Contacts</div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add contact
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px,1.4fr) minmax(160px,1fr) 140px 160px",
            gap: 8,
            fontSize: 12,
            color: "#51607A",
            marginTop: 12,
            padding: "0 8px",
          }}
        >
          <div>NAME</div>
          <div>COMPANY</div>
          <div>LAST SEEN</div>
          <div style={{ textAlign: "right" }}>ACTIONS</div>
        </div>

        <div style={{ marginTop: 6 }}>
          {error ? (
            <div style={{ padding: 12, color: "#E03137" }}>Error: {error}</div>
          ) : items === null ? (
            <div style={{ padding: 12, color: "#51607A" }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 12, color: "#51607A" }}>No contacts yet.</div>
          ) : (
            items.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px,1.4fr) minmax(160px,1fr) 140px 160px",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 8px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selectedId === c.id ? "#eff5ff" : "transparent",
                }}
              >
                <div style={{ fontWeight: 600, color: "#2e3a59" }}>{c.name || "—"}</div>
                <div>{c.company || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      background: liveDotColor(c.lastSeen),
                      display: "inline-block",
                    }}
                  />
                  <span>{fmtRelative(c.lastSeen)}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button className="btn btn-secondary" onClick={(e) => (e.stopPropagation(), openEdit(c))}>
                    Edit
                  </button>{" "}
                  <button className="btn btn-danger" onClick={(e) => (e.stopPropagation(), handleDelete(c.id))}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail card */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          {selected?.name ?? "Contact"}
        </div>
        {selected ? (
          <div style={{ display: "grid", gap: 12 }}>
            <DetailRow label="Company" value={selected.company} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={selected.phone} />
            <DetailRow label="Role" value={selected.role} />
            <DetailRow
              label="Last seen"
              value={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      background: liveDotColor(selected.lastSeen),
                      display: "inline-block",
                    }}
                  />
                  {fmtRelative(selected.lastSeen)}
                </span>
              }
            />
          </div>
        ) : (
          <div style={{ color: "#51607A" }}>Select a contact to view details.</div>
        )}
      </div>

      {/* Modal */}
      <ContactFormModal
        open={modalOpen}
        initial={formInitial}
        title={formTitle}
        busy={formBusy}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

/** ------------ Small detail row component ------------ */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode | string | null;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center" }}>
      <div style={{ color: "#51607A", fontSize: 12 }}>{label}</div>
      <div>{value ? value : "—"}</div>
    </div>
  );
}
