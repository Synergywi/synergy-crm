import React, { useEffect, useMemo, useState } from "react";

type Contact = {
  id: string;
  name: string;
  email?: string | null;
  companyId?: string | null;
  lastSeen?: string | null;
  createdAt: string;
};

type LogRow = { when: string; duration: string; ip: string; agent: string };

const Card: React.FC<{ title?: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    {title || right ? (
      <div className="mb-3 flex items-center justify-between">
        {title ? <div className="text-sm font-medium text-white/90">{title}</div> : <div />}
        {right ? <div>{right}</div> : null}
      </div>
    ) : null}
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs text-white/60 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/20 ${props.className || ""}`}
  />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
  <button {...rest} className="rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-3 py-2 text-sm text-white">
    {children}
  </button>
);

const DangerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
  <button {...rest} className="rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-3 py-2 text-sm text-white">
    {children}
  </button>
);

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId) || contacts[0] || null,
    [contacts, selectedId]
  );

  const logRows: LogRow[] = useMemo(() => {
    if (!selected) return [];
    return [
      { when: new Date().toISOString().replace("T", " ").slice(0, 19), duration: "420s", ip: "203.0.113.10", agent: "Chrome 126 / macOS" },
      { when: new Date(Date.now() - 24 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19), duration: "300s", ip: "203.0.113.10", agent: "Chrome 126 / macOS" },
    ];
  }, [selected]);

  async function fetchContacts() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Contact[];
      const sorted = [...data].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setContacts(sorted);
      if (!selectedId && sorted.length) setSelectedId(sorted[0].id);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        email: email.trim() || null,
        companyId: companyId.trim() || null,
      };
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Create failed: ${res.status} ${t}`);
      }
      setName("");
      setEmail("");
      setCompanyId("");
      await fetchContacts();
    } catch (e: any) {
      setSubmitError(e?.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  // Edit form (bound to selected contact)
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCompanyId, setEditCompanyId] = useState("");
  const [editErr, setEditErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (selected) {
      setEditName(selected.name || "");
      setEditEmail(selected.email || "");
      setEditCompanyId(selected.companyId || "");
      setEditErr(null);
    }
  }, [selected?.id]);

  async function handleSaveEdit() {
    if (!selected) return;
    setEditErr(null);
    if (!editName.trim()) {
      setEditErr("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim() || null,
          companyId: editCompanyId.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`Save failed: HTTP ${res.status}`);
      await fetchContacts();
    } catch (e: any) {
      setEditErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Delete contact "${selected.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setEditErr(null);
    try {
      const res = await fetch(`/api/contacts/${encodeURIComponent(selected.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`);
      await fetchContacts();
      setSelectedId(null);
    } catch (e: any) {
      setEditErr(e?.message || String(e));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6">
      <div className="text-lg font-semibold text-white mb-4">Synergy CRM 2</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Contacts">
            {err ? (
              <div className="text-sm text-red-400">Error: {err}</div>
            ) : loading ? (
              <div className="text-sm text-white/70">Loading…</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/60">
                    <tr>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Company ID</th>
                      <th className="text-left px-3 py-2">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-white/60">No contacts yet.</td>
                      </tr>
                    ) : (
                      contacts.map((c) => (
                        <tr
                          key={c.id}
                          className={`cursor-pointer hover:bg-white/5 ${selected?.id === c.id ? "bg-white/5" : ""}`}
                          onClick={() => setSelectedId(c.id)}
                        >
                          <td className="px-3 py-2 text-white">{c.name}</td>
                          <td className="px-3 py-2 text-white/80">{c.companyId || "—"}</td>
                          <td className="px-3 py-2 text-white/60">{c.lastSeen ? new Date(c.lastSeen).toLocaleString() : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title={selected ? `Edit: ${selected.name}` : "Select a contact"}
            right={selected ? <div className="text-xs text-emerald-400">● Last seen: {selected.lastSeen ? new Date(selected.lastSeen).toLocaleString() : "—"}</div> : null}
          >
            {!selected ? (
              <div className="text-sm text-white/60">Choose a contact on the left.</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div>
                    <Label>Company ID</Label>
                    <Input value={editCompanyId} onChange={(e) => setEditCompanyId(e.target.value)} placeholder="e.g. 1756150207667" />
                  </div>
                </div>
                {editErr ? <div className="text-xs text-rose-400">{editErr}</div> : null}
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
                  <DangerButton onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</DangerButton>
                </div>
              </div>
            )}
          </Card>

          <Card title="Add Contact">
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Maxwell" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Email (optional)</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" type="email" />
                </div>
                <div>
                  <Label>Company ID (optional)</Label>
                  <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="e.g. 1756150207667" />
                </div>
              </div>
              {submitError ? <div className="text-xs text-red-400">{submitError}</div> : null}
              <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create"}</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
