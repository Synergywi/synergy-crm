import React from "react";

type CaseStatus = "Closed" | "Investigation" | "Planning" | "Evidence Review";

type CaseRow = {
  caseId: string;
  company: string;
  investigator: string;
  status: CaseStatus;
};

const rows: CaseRow[] = [
  { caseId: "INV-2024-101", company: "Sunrise Mining Pty Ltd", investigator: "Alex Ng",   status: "Closed" },
  { caseId: "INV-2024-102", company: "City of Melbourne",       investigator: "Priya Menon", status: "Closed" },
  { caseId: "INV-2025-001", company: "Sunrise Mining Pty Ltd",  investigator: "Alex Ng",   status: "Investigation" },
  { caseId: "INV-2025-002", company: "Queensland Health (Metro North)", investigator: "Priya Menon", status: "Planning" },
  { caseId: "INV-2025-003", company: "City of Melbourne",       investigator: "Chris Rice", status: "Evidence Review" },
];

function statusClass(s: CaseStatus) {
  // These class names align with the simple “HubSpot-y” css we’ve been using.
  // If you don’t have these in hubspot.css yet, they’ll still render; with them, you get colored pills.
  switch (s) {
    case "Closed":
      return "badge badge--gray";
    case "Investigation":
      return "badge badge--orange";
    case "Planning":
      return "badge badge--blue";
    case "Evidence Review":
      return "badge badge--purple";
  }
}

export default function DashboardPage() {
  const now = new Date().toISOString();

  return (
    <div className="page">
      {/* Header / tabs */}
      <div className="page-head">
        <div className="tabs">
          <button className="tab tab--active">Overview</button>
          <button className="tab" disabled>This Week</button>
        </div>
      </div>

      {/* Welcome card */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Welcome</h2>
          <div className="muted text-sm">{now}</div>
        </div>
      </section>

      {/* Active cases */}
      <section className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Active Cases</h3>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{width: "160px"}}>Case ID</th>
                <th>Company</th>
                <th style={{width: "180px"}}>Investigator</th>
                <th style={{width: "180px"}}>Status</th>
                <th style={{width: "96px"}}/>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.caseId}>
                  <td>{r.caseId}</td>
                  <td>{r.company}</td>
                  <td>{r.investigator}</td>
                  <td>
                    <span className={statusClass(r.status)}>{r.status}</span>
                  </td>
                  <td className="text-right">
                    <a href="#" className="btn btn--ghost">Open</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
