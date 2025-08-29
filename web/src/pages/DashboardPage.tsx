import { useEffect, useState } from 'react'
import * as contacts from '../lib/contactsApi'
import * as companies from '../lib/companiesApi'
import type { Contact, Company } from '../types'

export default function DashboardPage() {
  const [contactsCount, setContactsCount] = useState<number | null>(null)
  const [companiesCount, setCompaniesCount] = useState<number | null>(null)
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    Promise.all([contacts.listContacts(), companies.listCompanies()])
      .then(([cs, cos]) => {
        if (!live) return
        setContactsCount(cs.length)
        setCompaniesCount(cos.length)
        setRecentContacts([...cs].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5))
      })
      .catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [])

  const card: React.CSSProperties = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div style={card}><h3 style={{ marginTop: 0 }}>Contacts</h3><p>{contactsCount ?? '—'}</p></div>
        <div style={card}><h3 style={{ marginTop: 0 }}>Companies</h3><p>{companiesCount ?? '—'}</p></div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Recently Updated Contacts</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {recentContacts.map((c) => (
            <li key={c.id}>{c.givenNames} {c.surname} {c.updatedAt ? <span style={{ opacity: 0.7 }}>— {c.updatedAt}</span> : null}</li>
          ))}
          {recentContacts.length === 0 && <li>No recent activity.</li>}
        </ul>
      </div>
    </div>
  )
}
