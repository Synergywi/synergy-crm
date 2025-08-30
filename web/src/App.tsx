import { NavLink, Routes, Route } from "react-router-dom";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import CompaniesPage from "./pages/CompaniesPage";
import DashboardPage from "./pages/DashboardPage";

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">Synergy CRM — LIVE</div>
        <div className="app-actions row">
          <NavLink to="/contacts/new" className="btn btn-primary">+ New Contact</NavLink>
          <NavLink to="/companies/new" className="btn">+ New Company</NavLink>
        </div>
      </header>

      <aside className="app-sidebar">
        <nav className="nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/contacts"  className={({isActive}) => isActive ? "active" : ""}>Contacts</NavLink>
          <NavLink to="/companies" className={({isActive}) => isActive ? "active" : ""}>Companies</NavLink>
          <NavLink to="/documents" className={({isActive}) => isActive ? "active" : ""}>Documents</NavLink>
          <NavLink to="/resources" className={({isActive}) => isActive ? "active" : ""}>Resources</NavLink>
          <NavLink to="/admin"     className={({isActive}) => isActive ? "active" : ""}>Admin</NavLink>
        </nav>
      </aside>

      <main className="app-main">
        <div className="page">
          <Routes>
            <Route path="/" element={<ContactsList />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsList />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/companies" element={<CompaniesPage />} />
            {/* keep your other routes as-is */}
            <Route path="*" element={<ContactsList />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <Layout />;
}
