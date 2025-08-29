import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

type Contact = {
  id: string
  givenNames: string
  surname: string
  phone?: string
  email?: string
  company?: string
  lastSeen?: string
  notes?: string
}

export default function ContactDetail() {
  const { id = '' } = useParams()
  const [model, setModel] = useState<Contact>({
    id,
    givenNames: 'Bruce',
    surname: 'Wayne',
    phone: '',
    email: '',
    company: '',
    lastSeen: new Date().toISOString(),
    notes: '',
  })

  // TODO: fetch from API: /api/contacts/:id
  useEffect(() => {
    // fetch(`/api/contacts/${id}`).then(r => r.json()).then(setModel)
  }, [id])

  function save() {
    // TODO: PUT to API
    alert('Saved (stub). Wire this to your API next.')
  }
  function simulateLogin() {
    setModel((m) => ({ ...m, lastSeen: new Date().toISOString() }))
  }
  function clearLog() {
    setModel((m) => ({ ...m, lastSeen: '' }))
  }
  function onDelete() {
    // TODO: DELETE to API
    alert('Deleted (stub).')
  }

  const field = { display: 'flex', flexDirection: 'column' as const, gap: 6 }

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <Link to="/">← Back</Link>
          <h2 style={{ margin: '8px 0 0 0' }}>Contact</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={simulateLogin}>Simulate login</button>
          <button onClick={clearLog}>Clear log</button>
          <button onClick={onDelete} style={{ color: '#c00' }}>Delete</button>
          <button onClick={save}>Save Contact</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label>Given names</label>
          <input value={model.givenNames} onChange={(e) => setModel({ ...model, givenNames: e.target.value })} />
        </div>
        <div style={field}>
          <label>Surname</label>
          <input value={model.surname} onChange={(e) => setModel({ ...model, surname: e.target.value })} />
        </div>
        <div style={field}>
          <label>Phone</label>
          <input value={model.phone ?? ''} onChange={(e) => setModel({ ...model, phone: e.target.value })} />
        </div>
        <div style={field}>
          <label>Email</label>
          <input type="email" value={model.email ?? ''} onChange={(e) => setModel({ ...model, email: e.target.value })} />
        </div>
        <div style={field}>
          <label>Company</label>
          <input value={model.company ?? ''} onChange={(e) => setModel({ ...model, company: e.target.value })} />
        </div>
        <div style={field}>
          <label>Last seen</label>
          <input readOnly value={model.lastSeen ?? ''} />
        </div>
        <div style={{ gridColumn: '1 / span 2', ...field }}>
          <label>Notes</label>
          <textarea rows={5} value={model.notes ?? ''} onChange={(e) => setModel({ ...model, notes: e.target.value })} />
        </div>
      </div>
    </div>
  )
}
