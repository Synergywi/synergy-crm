
import React, { useEffect, useState } from "react";
import ContactsTable, { Contact as ContactRow } from "../components/ContactsTable";
import AddEditContactModal from "../components/AddEditContactModal";
import { listContacts, createContact, updateContact, deleteContact } from "../lib/contactsApi";

export default function ContactsPage() {
  const [items, setItems] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      setLoading(true);
      const data = await listContacts();
      // Ensure id is string
      setItems(data.map((d:any) => ({ ...d, id: String(d.id) })));
    } catch (e:any) {
      setError(e?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const onSave = async (c: any) => {
    if (editing) {
      await updateContact(editing.id!, c);
    } else {
      await createContact(c);
    }
    setEditing(null);
    await refresh();
  };

  const onEdit = (c: ContactRow) => {
    setEditing(c);
    setModalOpen(true);
  };

  const onDelete = async (c: ContactRow) => {
    if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    await deleteContact(c.id);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Contacts</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium"
        >
          Add Contact
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-700 bg-rose-900/40 text-rose-200 px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <ContactsTable items={items} onEdit={onEdit} onDelete={onDelete} />
      )}

      <AddEditContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        initial={editing}
      />
    </div>
  );
}
