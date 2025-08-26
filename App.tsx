// App.tsx
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

// ✅ Load the HubSpot-like theme (file lives at /web/hubspot-theme.css)
import "./web/hubspot-theme.css";

import CompaniesPage from "./pages/CompaniesPage";
import ContactsPage from "./pages/Contacts";

// Layout shell styled by the theme classes
export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">Synergy CRM</div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
          <NavLink to="/companies" className={({ isActive }) => (isActive ? "active" : "")}>
            Companies
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? "active" : "")}>
            Contacts
          </NavLink>
        </nav>

        <div className="path">
          Path: <span className="kbd">{pathname}</span>
        </div>
      </aside>

      <main>
        <div className="header">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">
            <span className="dot" />
            Live preview
          </div>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<div className="card"><div className="card-body">Welcome</div></div>} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
