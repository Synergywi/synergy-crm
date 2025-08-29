import { Routes, Route, Link } from 'react-router-dom'
import ContactsList from './pages/ContactsList'
import ContactDetail from './pages/ContactDetail'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetail from './pages/CompanyDetail'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <>
      <header style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ margin: 0 }}>Synergy CRM — LIVE</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>Vite • React • Router • HubSpot theme</p>
        <nav style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <Link to="/">Contacts</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/contacts/new" style={{ marginLeft: 'auto' }}>+ New Contact</Link>
          <Link to="/companies/new">+ New Company</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px 40px' }}>
        <Routes>
          <Route path="/" element={<ContactsList />} />
          <Route path="/contacts/new" element={<ContactDetail />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/new" element={<CompanyDetail />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<ContactsList />} />
        </Routes>
      </main>
    </>
  )
}
