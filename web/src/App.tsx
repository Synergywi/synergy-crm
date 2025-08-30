import { NavLink, Route, Routes } from "react-router-dom";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import CompaniesPage from "./pages/CompaniesPage";
import DashboardPage from "./pages/DashboardPage";
import type { CSSProperties } from "react";

const navStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  display: "block",
  padding: "8px 10px",
  borderRadius: 8,
  color: isActive ? "#8a3b20" : "inherit",
  background: isActive ? "#fff5f2" : "transparent",
  fontWeight: isActive ? 600 : undefined,
  textDecoration: "none",
});

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100%" }}>
      <aside
        style={{
          background: "#fff",
          borderRight: "1px solid var(--border)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 12px" }}>Synergy CRM</h1>
        <NavLink to="/" end style={navStyle}>
          Contacts
        </NavLink>
        <NavLink to="/companies" style={navStyle}>
          Companies
        </NavLink>
        <NavLink to="/dashboard" style={navStyle}>
          Dashboard
        </NavLink>
      </aside>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ padding: "24px 24px 0" }}>
          <h1 style={{ margin: 0 }}>Synergy CRM — LIVE</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Vite · React · Router · HubSpot theme
          </p>
        </header>
        <main style={{ padding: 24, flex: 1 }}>
          <Routes>
            <Route path="/" element={<ContactsList />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<ContactsList />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
