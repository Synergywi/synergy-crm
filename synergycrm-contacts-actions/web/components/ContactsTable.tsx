import React, { useEffect, useMemo, useState } from "react";
import type { Contact } from "../types";
import { listContacts, createContact, updateContact, deleteContact } from "../lib/contactsApi";
import AddEditContactModal from "./AddEditContactModal";

export default function ContactsTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const items = await listContacts();
      setContacts(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const rows = useMemo(() => contacts, [contacts]);

  async function handleAdd(values: Partial<Contact>) {
    await createContact(values);
    setModalOpen(false);
    await refresh();
  }

  async function handleEdit(values: Partial<Contact>) {
    if (!editing) return;
    await updateContact(editing.id, values);
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    await refresh();
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contacts</h3>
          <p className="text-sm text-gray-500">Add, edit, or delete contacts. Data persists in Cosmos DB.</p>
        </div>
        <button className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white" onClick={() => setModalOpen(true)}>
          + Add contact
        </button>
      </div>

      {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Last updated</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/60">
                  <td className="px-3 py-2">{c.firstName} {c.lastName}</td>
                  <td className="px-3 py-2">{c.email || "—"}</td>
                  <td className="px-3 py-2">{c.phone || "—"}</td>
                  <td className="px-3 py-2">{c.companyId || "—"}</td>
                  <td className="px-3 py-2">{new Date(c.updatedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="rounded-lg border px-3 py-1" onClick={() => setEditing(c)}>Edit</button>
                      <button className="rounded-lg border px-3 py-1" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">
                    No contacts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddEditContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        initial={null}
      />
      <AddEditContactModal
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEdit}
        initial={editing || undefined}
      />
    </div>
  );
}
