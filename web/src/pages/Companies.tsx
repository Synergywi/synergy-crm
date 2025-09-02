import React from "react";
import { Link } from "react-router-dom";

type Company = {
  id: string;
  name: string;
  domain?: string;
  city?: string;
};

// Import your existing in-memory store.
import { companies as companiesData } from "../lib/companiesStore";

export default function CompaniesPage() {
  const companies: Company[] = Array.isArray(companiesData) ? companiesData as Company[] : [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h1 className="panel-title">Companies</h1>
      </div>

      <div className="panel-body">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{width: "34%"}}>Name</th>
                <th style={{width: "34%"}}>Domain</th>
                <th style={{width: "24%"}}>City</th>
                <th style={{width: "8%"}} aria-label="actions"></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((co) => (
                <tr key={co.id}>
                  <td>{co.name}</td>
                  <td className="text-muted">{co.domain ?? "—"}</td>
                  <td className="text-muted">{co.city ?? "—"}</td>
                  <td className="text-right">
                    <Link to="#" className="btn btn-small">Open</Link>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">No companies yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
