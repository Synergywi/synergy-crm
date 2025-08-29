import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as companies from '../lib/companiesApi'
import type { Company } from '../types'

export default function CompaniesPage() {
  const [rows, setRows] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    let live = true
    setLoading(true)
    companies.listCompanies()
      .then((data) => live && setRows(data))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [])

  async function remove(id: string) {
    if (!confirm('Delete this company?')) return
    await companies.deleteCompany(id)
    setRows((r) => r.filter((x) => x.id !== id))
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Companies</h2>
        <button onClick={() => nav('/companies/new')}>Create company</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rows.map((c) => (
            <li key={c.id} style={{ marginBottom: 6 }}>
              <Link to={`/companies/${c.id}`}>{c.name}</Link>
              {c.domain ? <span style={{ opacity: 0.7 }}> — {c.domain}</span> : null}
              {' · '}
              <button onClick={() => remove(c.id)} style={{ color: '#c00', background: 'none', border: 0, cursor: 'pointer' }}>
                Delete
              </button>
            </li>
          ))}
          {rows.length === 0 && <li>No companies yet.</li>}
        </ul>
      )}
    </div>
  )
}
