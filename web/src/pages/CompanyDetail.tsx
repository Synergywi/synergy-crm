import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as companies from '../lib/companiesApi'
import type { Company } from '../types'

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }

export default function CompanyDetail() {
  const { id = '' } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()

  const [model, setModel] = useState<Company>({ id: '', name: '', domain: '' })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    let live = true
    setLoading(true)
    companies.getCompany(id)
      .then((c) => live && setModel(c))
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [id, isNew])

  async function save() {
    try {
      setSaving(true); setError(null)
      if (isNew) {
        const created = await companies.createCompany(model)
        alert('Created')
        nav(`/companies/${created.id}`)
      } else {
        await companies.updateCompany(id, model)
        alert('Saved')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (isNew) { nav('/companies'); return }
    if (!confirm('Delete this company?')) return
    await companies.deleteCompany(id)
    nav('/companies')
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <Link to="/companies">← Back</Link>
          <h2 style={{ margin: '8px 0 0 0' }}>{isNew ? 'New Company' : 'Company'}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={remove} style={{ color: '#c00' }} disabled={saving}>Delete</button>
          <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Company'}</button>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={field}>
            <label>Name</label>
            <input value={model.name} onChange={(e) => setModel({ ...model, name: e.target.value })} />
          </div>
          <div style={field}>
            <label>Domain</label>
            <input value={model.domain ?? ''} onChange={(e) => setModel({ ...model, domain: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  )
}
