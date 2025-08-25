import React from "react";

type Props = {
  contacts: any[];
  onEdit: (c: any) => void;
  onDelete: (id: string) => void;
};

export default function ContactsTable({ contacts, onEdit, onDelete }: Props) {
  return (
    <table className="w-full border-collapse border border-gray-600">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border px-4 py-2">Name</th>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Company</th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map(c => (
          <tr key={c.id} className="border">
            <td className="border px-4 py-2">{c.name}</td>
            <td className="border px-4 py-2">{c.email}</td>
            <td className="border px-4 py-2">{c.company}</td>
            <td className="border px-4 py-2 space-x-2">
              <button className="px-2 py-1 bg-yellow-400 rounded" onClick={() => onEdit(c)}>Edit</button>
              <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => onDelete(c.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}