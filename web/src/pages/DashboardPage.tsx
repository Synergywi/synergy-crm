export default function DashboardPage() {
  return (
    <section>
      <div className="panel">
        <div className="panel__header">
          <h3 style={{ margin: 0 }}>Dashboard</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div className="card"><strong>Open Cases</strong><div>0</div></div>
          <div className="card"><strong>Total Contacts</strong><div>2 (seed)</div></div>
          <div className="card"><strong>Companies</strong><div>2 (seed)</div></div>
        </div>
      </div>
    </section>
  );
}
