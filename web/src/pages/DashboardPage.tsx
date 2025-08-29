export default function DashboardPage() {
  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 16 }
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Active Contacts</h3>
        <p>123</p>
      </div>
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>New This Week</h3>
        <p>7</p>
      </div>
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Last Login</h3>
        <p>—</p>
      </div>
    </div>
  )
}
