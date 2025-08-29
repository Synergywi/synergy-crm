import { Routes, Route, Link } from 'react-router-dom'
import ContactsList from './pages/ContactsList'
import ContactDetail from './pages/ContactDetail'

export default function App() {
  return (
    <>
      <header style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
        <h1 style={{ margin: 0 }}>Synergy CRM</h1>
        <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>Vite • React • Router • HubSpot theme</p>
        <nav style={{ marginTop: 12 }}>
          <Link to="/">Contacts</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px 40px' }}>
        <Routes>
          <Route path="/" element={<ContactsList />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="*" element={<ContactsList />} />
        </Routes>
      </main>
    </>
  )
}
