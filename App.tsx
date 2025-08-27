import React from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

// Capitalized so JSX treats them as components
import CompaniesPage from "./pages/CompaniesPage";
import ContactsPage from "./pages/Contacts";
import DashboardPage from "./pages/DashboardPage";

// Load HubSpot theme LAST so it wins the cascade
function useHubSpotTheme() {
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    // force light mode
    document.documentElement.classList.remove("dark");

    // append the stylesheet to <head> (served from /public)
    const id = "hubspot-theme-css";
    const href = "/hubspot-theme.css";
    const existing = document.getElementById(id) as HTMLLinkElement | null;

    if (existing) {
      if (!existing.href.includes(href)) existing.href = href;
    } else {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);
}

export default function App() {
  const { pathname } = useLocation();
  useHubSpotTheme();

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
            <Route path="/contacts" element={<ContactsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
