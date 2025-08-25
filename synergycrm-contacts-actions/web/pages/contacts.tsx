import React from "react";
import ContactsTable from "../components/ContactsTable";

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Contacts</h1>
      <ContactsTable />
    </div>
  );
}
