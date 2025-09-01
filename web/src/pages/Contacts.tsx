import React from "react";

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
};

const rows: Contact[] = [
  { id: "1", name: "Bruce Wayne", company: "Wayne Enterprises", email: "bruce@wayne.com" },
  { id: "2", name: "Diana Prince", company: "Themyscira Embassy", email: "diana@embassy.org" },
];

const ContactsPage: React.FC = () => {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">Contacts <span className="badge">LIVE</span></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{width:280}}>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th style={{width:90}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.company}</td>
                <td>{r.email}</td>
                <td><button className="action-btn">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ContactsPage;
