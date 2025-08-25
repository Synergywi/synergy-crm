import React, { useEffect, useState } from "react";
import { getContacts, addContact, updateContact, deleteContact } from "../lib/contactsApi";
import ContactsTable from "../components/ContactsTable";
import AddEditContactModal from "../components/AddEditContactModal";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getContacts();
    setContacts(data);
  }

  async function handleSave(contact: any) {
    if (editing) {
      await updateContact(editing.id, contact);
    } else {
      await addContact(contact);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    await deleteContact(id);
    await load();
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Contacts</h1>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded">Add Contact</button>
      </div>
      <ContactsTable contacts={contacts} onEdit={(c) => { setEditing(c); setModalOpen(true); }} onDelete={handleDelete} />
      <AddEditContactModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} initialData={editing || undefined} />
    </div>
  );
}