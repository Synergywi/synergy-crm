import React from "react";

type Company = {
  id: string;
  name: string;
  domain: string;
};

const rows: Company[] = [
  { id: "c1", name: "Wayne Enterprises", domain: "wayne.com" },
  { id: "c2", name: "Themyscira Embassy", domain: "embassy.org" },
];

const CompaniesPage: React.FC = () => {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">Companies <span className="badge">LIVE</span></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{width:340}}>Company</th>
              <th>Domain</th>
              <th style={{width:90}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.domain}</td>
                <td><button className="action-btn">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CompaniesPage;
