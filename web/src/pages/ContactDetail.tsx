import { Link, useParams } from "react-router-dom";

export default function ContactDetail() {
  const { id } = useParams();
  return (
    <section>
      <div className="panel">
        <div className="panel__header" style={{ gap: 12 }}>
          <Link to="/" className="button button--secondary">Back</Link>
          <h3 style={{ margin: 0 }}>Contact</h3>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="button">Save Contact</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label>Given names</label><input className="input" defaultValue={id} /></div>
          <div><label>Surname</label><input className="input" /></div>
          <div><label>Phone</label><input className="input" /></div>
          <div><label>Email</label><input className="input" /></div>
          <div><label>Company</label><input className="input" /></div>
          <div><label>Last seen</label><input className="input" value={new Date().toISOString()} readOnly /></div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Notes</label><textarea className="textarea" rows={6} />
          </div>
        </div>
      </div>
    </section>
  );
}
