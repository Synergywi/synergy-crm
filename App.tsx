// Ensure HubSpot theme loads LAST so it wins the cascade
function injectHubSpotTheme() {
  if (typeof document === "undefined") return;

  // force light mode
  document.documentElement.classList.remove("dark");

  // append a <link> so this CSS is the final stylesheet in <head>
  const id = "hubspot-theme-css";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/web/hubspot-theme.css";
    document.head.appendChild(link);
  }
}
injectHubSpotTheme();

import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage";
import contactsPage from "./pages/Contacts";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app hub-app">
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

        <div style={{ marginTop: 16, fontSize: 12, color: "#7e8aae" }}>
          Path: <span className="kbd">{pathname}</span>
        </div>
      </aside>

      <main>
        <div className="header">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
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
            <Route path="/contacts" element={<contactsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
