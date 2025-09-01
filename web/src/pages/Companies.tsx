import React from "react";

type Company = { id: string; name: string; domain?: string; size?: string };

const seed: Company[] = [
  { id: "co1", name: "Wayne Enterprises", domain: "wayne.com", size: "10k+" },
  { id: "co2", name: "Themyscira Embassy", domain: "embassy.org", size: "500+" },
];

export default function CompaniesPage() {
  return (
    <>
      <h1 className="h1">Companies</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Domain</th><th>Size</th><th></th></tr>
          </thead>
          <tbody>
            {seed.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.domain}</td>
                <td><span className="badge">{c.size ?? "—"}</span></td>
                <td><button className="btn">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
