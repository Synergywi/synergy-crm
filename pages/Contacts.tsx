import React, { useEffect, useMemo, useState } from "react";

/** ----- Types ----- */
type Contact = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  role?: string;
  lastSeenTs?: string; // ISO string
};

type FormState = {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  role?: string;
};

/** ----- Small helpers ----- */
const fmtAgo = (iso?: string) => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const d = Math.max(0, now - then);
  const mins = Math.round(d / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

/** GET all contacts */
async function fetchContacts(): Promise<Contact[]> {
  const list = await api<Contact[]>("/api/contacts");
  // normalize lastSeenTs (some seeds may have "lastSeen")
  return list.map((c) => ({
    ...c,
    lastSeenTs: (c as any).lastSeen ?? c.lastSeenTs,
  }));
}

/** Create, Update, Delete */
async function createContact(input: FormState): Promise<Contact> {
  return api<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function updateContact(id: string, input: FormState): Promise<Contact> {
  return api<Contact>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

async function deleteContact(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** ----- Reusable Modal (no external libs) ----- */
function Modal({
  title,
  open,
  onClose,
  children,
  footer,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/** ----- Form for Add/Edit ----- */
function ContactForm({
  initial,
  onChange,
}: {
  initial: FormState;
  onChange: (next: FormState) => void;
}) {
  return (
    <div className="form-grid">
      <label>
        <span>Name *</span>
        <input
          value={initial.name}
          onChange={(e) => onChange({ ...initial, name: e.target.value })}
          placeholder="Full name"
        />
      </label>
      <label>
        <span>Company</span>
        <input
          value={initial.company ?? ""}
          onChange={(e) => onChange({ ...initial, company: e.target.value })}
          placeholder="Company"
        />
      </label>
      <label>
        <span>Email</span>
        <input
          value={initial.email ?? ""}
          onChange={(e) => onChange({ ...initial, email: e.target.value })}
          placeholder="name@example.com"
          type="email"
        />
      </label>
      <label>
        <span>Phone</span>
        <input
          value={initial.phone ?? ""}
          onChange={(e) => onChange({ ...initial, phone: e.target.value })}
          placeholder="04 1234 5678"
        />
      </label>
      <label>
        <span>Role</span>
        <input
          value={initial.role ?? ""}
          onChange={(e) => onChange({ ...initial, role: e.target.value })}
          placeholder="Investigator / Reviewer / …"
        />
      </label>
    </div>
  );
}

/** ----- Page ----- */
export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Add / Edit modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState<FormState>({ name: "" });
  const [editForm, setEditForm] = useState<FormState>({ name: "" });

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId) || null,
    [contacts, selectedId]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContacts();
        if (alive) {
          setContacts(data);
          if (data.length && !selectedId) setSelectedId(data[0].id);
        }
      } catch (e: any) {
        if (alive) setError(e.message || "Failed to load contacts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // initial load

  /** ----- Handlers ----- */
  async function handleAdd() {
    setSaving(true);
    try {
      const created = await createContact(addForm);
      setContacts((prev) => [created, ...prev]);
      setAddOpen(false);
      setAddForm({ name: "" });
      setSelectedId(created.id);
    } catch (e: any) {
      alert(e.message || "Failed to add contact");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(c: Contact) {
    setEditForm({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      role: c.role,
    });
    setSelectedId(c.id);
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const updated = await updateContact(selectedId, editForm);
      setContacts((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, ...updated } : c))
      );
      setEditOpen(false);
    } catch (e: any) {
      alert(e.message || "Failed to update contact");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const victim = contacts.find((c) => c.id === id);
    if (!victim) return;
    const ok = confirm(`Delete contact “${victim.name}”? This cannot be undone.`);
    if (!ok) return;

    // optimistic
    const prev = contacts;
    setContacts((cur) => cur.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);

    try {
      await deleteContact(id);
    } catch (e: any) {
      alert(e.message || "Failed to delete contact");
      setContacts(prev); // rollback
    }
  }

  /** ----- UI ----- */
  return (
    <>
      <div className="card">
        <div className="card-head">
          <div className="card-title">Contacts</div>
          <div className="card-actions">
            <button
              className="btn primary"
              onClick={() => {
                setAddForm({ name: "" });
                setAddOpen(true);
              }}
            >
              + Add contact
            </button>
          </div>
        </div>

        <div className="table">
          <div className="thead">
            <div>Name</div>
            <div>Company</div>
            <div>Last seen</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {loading ? (
            <div className="tbody empty">Loading…</div>
          ) : error ? (
            <div className="tbody empty">Error: {error}</div>
          ) : contacts.length === 0 ? (
            <div className="tbody empty">No contacts yet.</div>
          ) : (
            <div className="tbody">
              {contacts.map((c) => (
                <div
                  className={`tr ${selectedId === c.id ? "selected" : ""}`}
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  role="button"
                >
                  <div className="cell">
                    <div className="name">{c.name}</div>
                  </div>
                  <div className="cell">{c.company || "—"}</div>
                  <div className="cell">
                    <span className="dot live" /> {fmtAgo(c.lastSeenTs)}
                  </div>
                  <div className="cell actions">
                    <button
                      className="btn ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(c);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel mirrors your current layout */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">
            {selected ? selected.name : "Contact"}
          </div>
          {selected ? (
            <div className="card-actions">
              <button className="btn ghost">Simulate login</button>
              <button className="btn ghost">Clear log</button>
            </div>
          ) : null}
        </div>

        {!selected ? (
          <div className="pad muted">Select a contact to view details.</div>
        ) : (
          <div className="pad">
            <div className="kv">
              <div>Company</div>
              <div>{selected.company || "—"}</div>
            </div>
            <div className="kv">
              <div>Email</div>
              <div>{selected.email || "—"}</div>
            </div>
            <div className="kv">
              <div>Phone</div>
              <div>{selected.phone || "—"}</div>
            </div>
            <div className="kv">
              <div>Role</div>
              <div>{selected.role || "—"}</div>
            </div>
            <div className="kv">
              <div>Last seen</div>
              <div>
                <span className="dot live" /> {fmtAgo(selected.lastSeenTs)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal
        title="Add contact"
        open={addOpen}
        onClose={() => (saving ? null : setAddOpen(false))}
        footer={
          <>
            <button className="btn ghost" disabled={saving} onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button
              className="btn primary"
              disabled={saving || !addForm.name.trim()}
              onClick={handleAdd}
            >
              {saving ? "Saving…" : "Create"}
            </button>
          </>
        }
      >
        <ContactForm initial={addForm} onChange={setAddForm} />
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Edit contact"
        open={editOpen}
        onClose={() => (saving ? null : setEditOpen(false))}
        footer={
          <>
            <button className="btn ghost" disabled={saving} onClick={() => setEditOpen(false)}>
              Close
            </button>
            <button
              className="btn primary"
              disabled={saving || !editForm.name.trim()}
              onClick={handleEdit}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        <ContactForm initial={editForm} onChange={setEditForm} />
      </Modal>

      {/* Local styles to match your current theme */}
      <style>{`
        .card { background:#0f172a; border-radius:12px; border:1px solid #1f2937; margin-bottom:16px; }
        .card-head { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #1f2937; }
        .card-title { font-weight:600; color:#e5e7eb; }
        .card-actions { display:flex; gap:8px; }
        .pad { padding:16px; }
        .pad.muted { color:#94a3b8; }
        .table { width:100%; }
        .thead, .tr { display:grid; grid-template-columns: 2fr 2fr 1.2fr 1fr; gap:12px; align-items:center; }
        .thead { padding:10px 16px; color:#9ca3af; border-bottom:1px solid #1f2937; font-size:12.5px; text-transform:uppercase; letter-spacing:.02em; }
        .tbody .tr { padding:10px 16px; border-bottom:1px solid #1f2937; cursor:pointer; }
        .tbody .tr:hover { background:#0b1220; }
        .tbody .tr.selected { background:#0b1324; }
        .tbody.empty { padding:16px; color:#94a3b8; }
        .cell.actions { justify-self:end; display:flex; gap:8px; }
        .name { color:#e5e7eb; font-weight:500; }
        .dot { display:inline-block; width:8px; height:8px; border-radius:99px; margin-right:6px; background:#64748b; vertical-align:middle; }
        .dot.live { background:#34d399; }
        .btn { font:inherit; padding:6px 10px; border-radius:8px; border:1px solid #334155; background:#0b1220; color:#e5e7eb; cursor:pointer; }
        .btn:hover { background:#0e1627; }
        .btn.primary { background:#2563eb; border-color:#2563eb; }
        .btn.primary:hover { background:#1d4ed8; }
        .btn.ghost { background:transparent; }
        .btn.danger { border-color:#ef4444; color:#ef4444; }
        .kv { display:grid; grid-template-columns: 160px 1fr; gap:12px; padding:8px 0; border-bottom:1px dashed #1f2937; color:#cbd5e1; }
        .kv:last-child { border-bottom:none; }

        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:50; }
        .modal { width:min(720px, 92vw); background:#0b1220; border:1px solid #1f2937; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,.6); }
        .modal-head { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #1f2937; }
        .modal-title { font-weight:600; color:#e5e7eb; }
        .modal-body { padding:16px; }
        .modal-foot { padding:12px 14px; border-top:1px solid #1f2937; display:flex; justify-content:flex-end; gap:8px; }
        .form-grid { display:grid; gap:12px; }
        .form-grid label { display:grid; gap:6px; color:#cbd5e1; }
        .form-grid input { background:#0f172a; color:#e5e7eb; border:1px solid #334155; border-radius:8px; padding:8px 10px; }
        .form-grid input:focus { outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.25); }
      `}</style>
    </>
  );
}
