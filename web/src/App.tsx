import { Link, Routes, Route, useParams } from 'react-router-dom'

function ContactsList() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1>Synergy CRM</h1>
      <p>Vite • React • Router • HubSpot theme</p>

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
        <p>If you can see this, the app is running with the HubSpot theme only.</p>
        <ul style={{ marginTop: 8 }}>
          <li><Link to="/contacts/1756338018580">Go to a sample contact</Link></li>
        </ul>
      </div>
    </div>
  )
}

function ContactDetail() {
  const { id } = useParams()
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Contact #{id}</h1>
        <Link to="/">← Back</Link>
      </div>

      <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
        <p>Placeholder contact detail page.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactsList />} />
      <Route path="/contacts/:id" element={<ContactDetail />} />
      <Route path="*" element={<ContactsList />} />
    </Routes>
  )
}
