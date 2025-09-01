import React from "react";

export default function DashboardPage() {
  const now = new Date().toISOString();
  const cases = [
    { id: "INV-2024-101", company: "Sunrise Mining Pty Ltd", owner: "Alex Ng", status: "Closed" },
    { id: "INV-2024-102", company: "City of Melbourne", owner: "Priya Menon", status: "Closed" },
    { id: "INV-2025-001", company: "Sunrise Mining Pty Ltd", owner: "Alex Ng", status: "Investigation" },
    { id: "INV-2025-002", company: "Queensland Health (Metro North)", owner: "Priya Menon", status: "Planning" },
    { id: "INV-2025-003", company: "City of Melbourne", owner: "Chris Rice", status: "Evidence Review" },
  ];

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Welcome</div>
        <div className="text-muted">{now}</div>
      </div>

      <div className="card mt">
        <div className="card-title">Active Cases</div>
        <div className="table">
          <div className="thead">
            <div>CASE ID</div>
            <div>COMPANY</div>
            <div>INVESTIGATOR</div>
            <div>STATUS</div>
            <div></div>
          </div>
          {cases.map((c) => (
            <div className="trow" key={c.id}>
              <div>{c.id}</div>
              <div>{c.company}</div>
              <div>{c.owner}</div>
              <div><span className="pill">{c.status}</span></div>
              <div><button className="btn">Open</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
