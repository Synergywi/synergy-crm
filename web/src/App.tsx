import { NavLink, Route, Routes } from "react-router-dom";
import ContactsList from "./pages/ContactsList";
import ContactDetail from "./pages/ContactDetail";
import CompaniesPage from "./pages/CompaniesPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="app-shell">
      <aside className="aside">
        <div className="brand">
          <span className="dot" />
          Synergy CRM
        </div>
        <nav className="nav">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/contacts" className={({isActive}) => isActive ? "active" : ""}>Contacts</NavLink>
          <NavLink to="/companies" className={({isActive}) => isActive ? "active" : ""}>Companies</NavLink>
          <NavLink to="/documents" className={({isActive}) => isActive ? "active" : ""}>Documents</NavLink>
          <NavLink to="/resources" className={({isActive}) => isActive ? "active" : ""}>Resources</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>Admin</NavLink>
        </nav>
      </aside>

      <div>
        <header className="header">
          <div className="header-inner">
            <div className="stack">
              <span className="badge">LIVE</span>
            </div>
            <div className="actions">
              <a href="/contacts/new" className="button secondary">+ New Contact</a>
              <a href="/companies/new" className="button primary">+ New Company</a>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="panel">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/contacts" element={<ContactsList />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/companies" element={<CompaniesPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
