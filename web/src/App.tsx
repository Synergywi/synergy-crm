import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="aside">
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/contacts" className={({isActive}) => isActive ? "active" : ""}>Contacts</NavLink>
          <NavLink to="/companies" className={({isActive}) => isActive ? "active" : ""}>Companies</NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
