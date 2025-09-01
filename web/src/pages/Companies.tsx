import React from "react";

type Company = {
  id: string;
  name: string;
  domain: string;
  city?: string;
};

const rows: Company[] = [
  { id: "c1", name: "Wayne Enterprises", domain: "wayne.com", city: "Gotham" },
  { id: "c2", name: "Themyscira Embassy", domain: "embassy.org", city: "Washington DC" },
  { id: "c3", name: "Stark Industries", domain: "stark.com", city: "Malibu" },
];

export default function CompaniesPage() {
  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Companies</div>
        <div className="table">
          <div className="thead">
            <div>NAME</div>
            <div>DOMAIN</div>
            <div>CITY</div>
            <div></div>
          </div>
          {rows.map((r) => (
            <div className="trow" key={r.id}>
              <div>{r.name}</div>
              <div>{r.domain}</div>
              <div>{r.city ?? "—"}</div>
              <div><button className="btn">Open</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
