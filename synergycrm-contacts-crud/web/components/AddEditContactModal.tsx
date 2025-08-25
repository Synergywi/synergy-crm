import React, { useState, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (contact: { id?: string; name: string; email: string; company?: string }) => void;
  initialData?: { id?: string; name: string; email: string; company?: string };
};

export default function AddEditContactModal({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-lg font-bold mb-4">{initialData ? "Edit Contact" : "Add Contact"}</h2>
        <input className="border p-2 w-full mb-2" placeholder="Name"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 w-full mb-2" placeholder="Email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 w-full mb-2" placeholder="Company"
          value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 bg-blue-500 text-white rounded">{initialData ? "Update" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}