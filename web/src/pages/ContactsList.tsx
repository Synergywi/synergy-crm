import { Link } from 'react-router-dom'

type Row = { id: string; name: string; company?: string; email?: string }

const demo: Row[] = [
  { id: '1756338018580', name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'bruce@wayne.com' },
  { id: '1756338018581', name: 'Diana Prince', company: 'Themyscira Embassy', email: 'diana@embassy.org' },
]

export default function ContactsList() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Contacts</h2>
        <button>Create contact</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Company</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demo.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: 8 }}>{row.name}</td>
                <td style={{ padding: 8 }}>{row.company ?? '—'}</td>
                <td style={{ padding: 8 }}>{row.email ?? '—'}</td>
                <td style={{ padding: 8 }}>
                  <Link to={`/contacts/${row.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
