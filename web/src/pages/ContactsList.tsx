import React from "react";

type Contact = { id: string; name: string; company: string; email: string };

const seed: Contact[] = [
  { id: "c1", name: "Bruce Wayne", company: "Wayne Enterprises", email: "bruce@wayne.com" },
  { id: "c2", name: "Diana Prince", company: "Themyscira Embassy", email: "diana@embassy.org" },
];

export default function ContactsListPage() {
  return (
    <>
      <h1 className="h1">Contacts</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            {seed.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company}</td>
                <td>{c.email}</td>
                <td><button className="btn">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
