// App.tsx
import React from "react";
import { NavLink, Route, Routes, useLocation, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CompaniesPage from "./pages/CompaniesPage";
import ContactsPage from "./pages/Contacts";
import ContactDetailPage from "./pages/ContactDetail";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app hub-app">
      {/* Sidebar */}
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

      {/* Main */}
      <main>
        <div className="header">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">Live preview</div>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/companies" element={<CompaniesPage />} />

            {/* Contacts list + detail */}
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
