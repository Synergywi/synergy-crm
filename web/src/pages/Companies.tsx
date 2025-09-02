import React from "react";
import { companies } from "../lib/companiesStore";

export default function CompaniesPage() {
  return (
    <div className="card">
      <div className="card-header"><h2>Companies</h2></div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th style={{width: "34%"}}>Name</th>
              <th style={{width: "33%"}}>Domain</th>
              <th style={{width: "19%"}}>City</th>
              <th style={{width: "14%"}} aria-label="actions"></th>
            </tr>
          </thead>
          <tbody>
            {companies.map(co => (
              <tr key={co.id}>
                <td>{co.name}</td>
                <td>{co.domain}</td>
                <td>{co.city}</td>
                <td className="text-right">
                  <button className="btn">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
