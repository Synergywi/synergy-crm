import { useEffect, useMemo, useState } from "react";

/** Types */
type Contact = {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  phone?: string | null;
  role?: string | null;
  lastSeenAt?: string | null; // ISO string
};

type UpsertPayload = {
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  role?: string;
};

/** Small helpers */
const fmtAgo = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const dot = (ok = true) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: 999,
      marginRight: 6,
      background: ok ? "#34d399" : "#f59e0b",
      verticalAlign: "-1px",
    }}
  />
);

/** API layer (talks to api/contacts) */
async function listContacts(): Promise<Contact[]> {
  const res = await fetch("/api/contacts");
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

async function createContact(data: UpsertPayload): Promise<Contact> {
  const res = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return res.json();
}

async function updateContact(id: string, data: UpsertPayload): Promise<Contact> {
  const res = await fetch(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`/api/contacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

/** Modal component for Add / Edit */
function ContactModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  initial?: Partial<UpsertPayload>;
  onClose: () => void;
  onSubmit: (data: UpsertPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<UpsertPayload>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    company: initial?.company ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSave = form.name.trim().length > 0 && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    setErr(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email?.trim() || undefined,
        company: form.company?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        role: form.role?.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            {mode === "add" ? "Add contact" : "Edit contact"}
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <label className="field">
              <div className="label">Name *</div>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ada Lovelace"
              />
            </label>
            <label className="field">
              <div className="label">Email</div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ada@lovelace.io"
              />
            </label>
            <label className="field">
              <div className="label">Company</div>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Analytical Engines Ltd"
              />
            </label>
            <label className="field">
              <div className="label">Phone</div>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+61 400 000 000"
              />
            </label>
            <label className="field">
              <div className="label">Role</div>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Investigator"
              />
            </label>
          </div>

          {err && <div className="alert error">{err}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!canSave}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Main page */
export default function ContactsPage() {
  const [rows, setRows] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editRow, setEditRow] = useState<Contact | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        const data = await listContacts();
        if (!alive) return;
        setRows(data);
        if (data.length && !selectedId) setSelectedId(data[0].id);
      } catch (e: any) {
        if (!alive) return;
        setRows([]);
        setError(e?.message ?? "Failed to load");
      }
    })();
    return () => {
      alive = false;
    };
  }, []); // initial load

  const selected = useMemo(
    () => rows?.find((r) => r.id === selectedId) || null,
    [rows, selectedId]
  );

  const doAdd = async (payload: UpsertPayload) => {
    const created = await createContact(payload);
    setRows((r) => (r ? [created, ...r] : [created]));
    setSelectedId(created.id);
  };

  const doEdit = async (payload: UpsertPayload) => {
    if (!editRow) return;
    const updated = await updateContact(editRow.id, payload);
    setRows((r) =>
      (r ?? []).map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
    );
    setSelectedId(updated.id);
  };

  const doDelete = async (row: Contact) => {
    if (!confirm(`Delete ${row.name}?`)) return;
    await deleteContact(row.id);
    setRows((r) => (r ?? []).filter((x) => x.id !== row.id));
    setSelectedId((id) => (id === row.id ? null : id));
  };

  return (
    <div className="hub-page">
      {/* List card */}
      <section className="card">
        <div className="card-head">
          <h2>Contacts</h2>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Add contact
          </button>
        </div>

        <div className="table">
          <div className="thead">
            <div>Name</div>
            <div>Company</div>
            <div>Last seen</div>
            <div className="right">Actions</div>
          </div>

          <div className="tbody">
            {error && (
              <div className="row error-row">
                <div style={{ gridColumn: "1 / -1" }}>Error: {error}</div>
              </div>
            )}

            {rows?.length === 0 && !error && (
              <div className="row empty">
                <div style={{ gridColumn: "1 / -1" }}>No contacts yet.</div>
              </div>
            )}

            {(rows ?? []).map((r) => (
              <button
                key={r.id}
                className={
                  "row row-button" + (selectedId === r.id ? " selected" : "")
                }
                onClick={() => setSelectedId(r.id)}
              >
                <div className="cell name">{r.name}</div>
                <div className="cell">{r.company || "—"}</div>
                <div className="cell">
                  {dot(Boolean(r.lastSeenAt))} {fmtAgo(r.lastSeenAt)}
                </div>
                <div className="cell right">
                  <button
                    className="btn btn-ghost sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditRow(r);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void doDelete(r);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Details card */}
      <section className="card">
        <div className="card-head">
          <h2>{selected ? selected.name : "Contact"}</h2>
        </div>

        {!selected ? (
          <div className="empty-state">Select a contact to view details.</div>
        ) : (
          <div className="details-grid">
            <div className="kv">
              <div className="k">Company</div>
              <div className="v">{selected.company || "—"}</div>
            </div>
            <div className="kv">
              <div className="k">Email</div>
              <div className="v">{selected.email || "—"}</div>
            </div>
            <div className="kv">
              <div className="k">Phone</div>
              <div className="v">{selected.phone || "—"}</div>
            </div>
            <div className="kv">
              <div className="k">Role</div>
              <div className="v">{selected.role || "—"}</div>
            </div>
            <div className="kv">
              <div className="k">Last seen</div>
              <div className="v">
                {dot(Boolean(selected.lastSeenAt))} {fmtAgo(selected.lastSeenAt)}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      {showAdd && (
        <ContactModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSubmit={doAdd}
        />
      )}

      {editRow && (
        <ContactModal
          mode="edit"
          initial={{
            name: editRow.name,
            email: editRow.email ?? "",
            company: editRow.company ?? "",
            phone: editRow.phone ?? "",
            role: editRow.role ?? "",
          }}
          onClose={() => setEditRow(null)}
          onSubmit={doEdit}
        />
      )}

      {/* Inline styles for HubSpot-like theme (scoped to this page) */}
      <style>{`
        .hub-page {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 1100px) {
          .hub-page {
            grid-template-columns: 1fr 1fr;
          }
        }
        .card {
          background: #0f172a;
          border: 1px solid #1f2a44;
          border-radius: 12px;
          padding: 16px;
        }
        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .card-head h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #e5e7eb;
        }
        .table {
          width: 100%;
        }
        .thead, .row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr 150px;
          gap: 12px;
          align-items: center;
        }
        .thead {
          color: #9aa4b2;
          font-size: 12px;
          border-bottom: 1px solid #1f2a44;
          padding: 8px 0;
        }
        .tbody .row {
          color: #dbe2ea;
          padding: 10px 0;
          border-bottom: 1px solid #111827;
        }
        .row-button {
          background: transparent;
          border: 0;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }
        .row-button:hover {
          background: rgba(255,255,255,0.02);
        }
        .row-button.selected {
          background: rgba(99,102,241,0.08);
          outline: 1px solid rgba(99,102,241,0.4);
          border-radius: 8px;
        }
        .right { text-align: right; }
        .name { font-weight: 600; }
        .empty, .error-row {
          color: #9aa4b2;
          padding: 14px 0;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 24px;
        }
        .kv .k { color: #9aa4b2; font-size: 12px; margin-bottom: 2px; }
        .kv .v { color: #e5e7eb; }
        .empty-state {
          color: #9aa4b2;
          padding: 8px 0;
        }

        .btn {
          border: 1px solid #29324b;
          background: #0b1220;
          color: #e5e7eb;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          line-height: 1;
          transition: background .15s, border-color .15s;
        }
        .btn:hover { background: #0e1629; border-color: #334166; }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .btn-primary:hover { background: #2563eb; border-color: #2563eb; }
        .btn-danger { background: #ef4444; border-color: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; border-color: #dc2626; }
        .btn-ghost { background: transparent; border-color: transparent; color: #9aa4b2; }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: #29324b; }
        .sm { padding: 6px 10px; font-size: 12px; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: grid; place-items: center; z-index: 50;
        }
        .modal {
          width: 560px; max-width: calc(100vw - 24px);
          background: #0f172a; border: 1px solid #1f2a44;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .modal-header, .modal-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid #1f2a44;
        }
        .modal-footer { border-top: 1px solid #1f2a44; border-bottom: 0; }
        .modal-title { color: #e5e7eb; font-weight: 600; }
        .modal-body { padding: 14px; }
        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .field .label { font-size: 12px; color: #9aa4b2; margin-bottom: 4px; }
        input {
          width: 100%; background: #0b1220; color: #e5e7eb; border: 1px solid #29324b;
          border-radius: 10px; padding: 8px 10px; outline: none;
        }
        input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .alert.error {
          margin-top: 10px; font-size: 13px; color: #fecaca; background: #7f1d1d;
          border: 1px solid #991b1b; padding: 8px 10px; border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
