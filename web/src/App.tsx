import { NavLink, Routes, Route } from 'react-router-dom'
import ContactsList from './pages/ContactsList'
import ContactDetail from './pages/ContactDetail'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetail from './pages/CompanyDetail'
import DashboardPage from './pages/DashboardPage'

function SideItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Synergy CRM</h1>
        <div className="side-section">Navigation</div>
        <SideItem to="/dashboard" label="Dashboard" />
        <SideItem to="/" label="Contacts" />
        <SideItem to="/companies" label="Companies" />
        <SideItem to="/documents" label="Documents" />
        <SideItem to="/resources" label="Resources" />
        <SideItem to="/admin" label="Admin" />
      </aside>

      <main className="main">
        <div className="toprow">
          <h2>Synergy CRM — LIVE</h2>
          <div style={{ display:'flex', gap:8 }}>
            <NavLink to="/contacts/new" className="btn btn--primary">+ New Contact</NavLink>
            <NavLink to="/companies/new" className="btn">+ New Company</NavLink>
          </div>
        </div>

        <Routes>
          {/* Contacts */}
          <Route path="/" element={<ContactsList />} />
          <Route path="/contacts/new" element={<ContactDetail />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />

          {/* Companies */}
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/new" element={<CompanyDetail />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Fallback */}
          <Route path="*" element={<ContactsList />} />
        </Routes>
      </main>
    </div>
  )
}
