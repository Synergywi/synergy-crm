// App.tsx (root of repo)

// 1) Load the HubSpot theme stylesheet (path is relative to the repo root)
import "./web/hubspot-theme.css";

import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage";
import ContactsPage from "./pages/ContactsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Synergy CRM</div>

        <nav className="nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/companies"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Companies
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Contacts
          </NavLink>
        </nav>

        <div style={{ marginTop: 16, fontSize: 12, color: "#7e8aa0" }}>
          Path: <span className="kbd">{pathname}</span>
        </div>
      </aside>

      {/* Main */}
      <main>
        <div className="header">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#34d399",
              }}
            />
            Live preview
          </div>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
