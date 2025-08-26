import { useEffect, useState } from "react";
import { getContacts, addContact, updateContact, deleteContact } from "../web/lib/contactsApi";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  lastSeen?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAdd = async () => {
    const name = prompt("Enter name:");
    const email = prompt("Enter email:");
    if (!name) return;

    await addContact({ name, email });
    await loadContacts();
  };

  const handleEdit = async (c: Contact) => {
    const name = prompt("Edit name:", c.name) || c.name;
    const email = prompt("Edit email:", c.email) || c.email;
    await updateContact(c.id, { ...c, name, email });
    await loadContacts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this contact?")) return;
    await deleteContact(id);
    await loadContacts();
    setSelected(null);
  };

  return (
    <div className="hubspot-page">
      <div className="hubspot-card">
        <div className="hubspot-card-header">
          <h2>Contacts</h2>
          <button className="btn-primary" onClick={handleAdd}>+ Add contact</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="hubspot-empty">No contacts yet.</div>
        ) : (
          <table className="hubspot-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Last seen</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className={selected?.id === c.id ? "active" : ""}
                  onClick={() => setSelected(c)}
                >
                  <td>{c.name}</td>
                  <td>{c.company || "—"}</td>
                  <td>{c.lastSeen || "—"}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="hubspot-card">
        {selected ? (
          <div>
            <h2>{selected.name}</h2>
            <p><strong>Company:</strong> {selected.company || "—"}</p>
            <p><strong>Email:</strong> {selected.email || "—"}</p>
            <p><strong>Phone:</strong> {selected.phone || "—"}</p>
            <p><strong>Role:</strong> {selected.role || "—"}</p>
            <p><strong>Last seen:</strong> {selected.lastSeen || "—"}</p>
          </div>
        ) : (
          <div className="hubspot-empty">Select a contact to view details.</div>
        )}
      </div>
    </div>
  );
}
