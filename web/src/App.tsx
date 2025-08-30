import { Link, Route, Routes } from "react-router-dom";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import CompaniesPage from "./pages/CompaniesPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div style={{ padding: "24px" }}>
      <header
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "12px 0 20px",
          display: "flex",
          alignItems: "baseline",
          gap: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Synergy CRM — LIVE</h1>
        <p style={{ margin: 0, opacity: 0.7 }}>Vite · React · Router · HubSpot theme</p>
      </header>

      <nav
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          gap: 16,
          paddingBottom: 12,
        }}
      >
        <Link to="/">Contacts</Link>
        <Link to="/companies">Companies</Link>
        <Link to="/dashboard">Dashboard</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <a href="#" onClick={(e) => e.preventDefault()}>+ New Contact</a>
          <a href="#" onClick={(e) => e.preventDefault()}>+ New Company</a>
        </div>
      </nav>

      <main style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<ContactsList />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<ContactsList />} />
        </Routes>
      </main>
    </div>
  );
}
