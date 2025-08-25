import React, { useEffect, useState } from "react";
import type { Contact } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Contact>) => Promise<void> | void;
  initial?: Partial<Contact> | null;
};

export default function AddEditContactModal({ open, onClose, onSubmit, initial }: Props) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [companyId, setCompanyId] = useState(initial?.companyId ?? "");

  useEffect(() => {
    if (open) {
      setFirstName(initial?.firstName ?? "");
      setLastName(initial?.lastName ?? "");
      setEmail(initial?.email ?? "");
      setPhone(initial?.phone ?? "");
      setCompanyId(initial?.companyId ?? "");
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[520px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{initial?.id ? "Edit contact" : "Add contact"}</h2>
          <p className="text-sm text-gray-500">Fill in the details below.</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit({ firstName, lastName, email, phone, companyId });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-sm">
              <span className="mb-1">First name</span>
              <input className="rounded-xl border p-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1">Last name</span>
              <input className="rounded-xl border p-2" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-sm">
              <span className="mb-1">Email</span>
              <input className="rounded-xl border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1">Phone</span>
              <input className="rounded-xl border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          <label className="flex flex-col text-sm">
            <span className="mb-1">Company ID</span>
            <input className="rounded-xl border p-2" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
          </label>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button type="button" className="rounded-xl border px-4 py-2" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-black px-4 py-2 font-medium text-white">
              {initial?.id ? "Save changes" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
