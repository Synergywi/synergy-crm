
import React from "react";

export type Contact = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  lastSeen?: string; // ISO
};

type Props = {
  items: Contact[];
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
};

const timeAgo = (iso?: string) => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const dotClass = (iso?: string) => {
  if (!iso) return "bg-slate-500";
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  // green <= 10m, yellow <= 48h, orange older
  if (mins <= 10) return "bg-emerald-500";
  if (mins <= 60*48) return "bg-yellow-400";
  return "bg-orange-500";
};

export default function ContactsTable({ items, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            <th className="text-left px-5 py-3">Name</th>
            <th className="text-left px-5 py-3">Company</th>
            <th className="text-left px-5 py-3">Email</th>
            <th className="text-left px-5 py-3">Phone</th>
            <th className="text-left px-5 py-3">Last seen</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-900/40">
              <td className="px-5 py-3">{c.name}</td>
              <td className="px-5 py-3">{c.company || "—"}</td>
              <td className="px-5 py-3">{c.email || "—"}</td>
              <td className="px-5 py-3">{c.phone || "—"}</td>
              <td className="px-5 py-3">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 align-middle ${dotClass(c.lastSeen)}`} />
                <span className="align-middle">{timeAgo(c.lastSeen)}</span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="px-5 py-6 text-slate-400" colSpan={6}>No contacts yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
