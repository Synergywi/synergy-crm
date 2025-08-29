import { Link } from 'react-router-dom'

export default function CompaniesPage() {
  const demo = [
    { id: 'co_001', name: 'Wayne Enterprises' },
    { id: 'co_002', name: 'Themyscira Embassy' },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Companies</h2>
        <button>Create company</button>
      </div>

      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {demo.map((c) => (
          <li key={c.id}>
            <Link to={`/companies/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
