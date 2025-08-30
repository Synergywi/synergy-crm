export default function DashboardPage() {
  return (
    <section>
      <div className="panel">
        <div className="panel-header">
          <h3 className="title">Dashboard</h3>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div className="panel">
            <strong>Open Cases</strong>
            <div>0</div>
          </div>
          <div className="panel">
            <strong>Total Contacts</strong>
            <div>2 (seed)</div>
          </div>
          <div className="panel">
            <strong>Companies</strong>
            <div>2 (seed)</div>
          </div>
        </div>
      </div>
    </section>
  );
}
