import { Link, useParams } from "react-router-dom";

export default function ContactDetail() {
  const { id } = useParams();
  return (
    <section>
      <div className="panel">
        <div className="panel-header">
          <Link to="/" className="btn">
            Back
          </Link>
          <h3 className="title">Contact</h3>
          <div className="spacer" />
          <button className="btn btn-primary">Save Contact</button>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="label">Given names</label>
            <input className="input" defaultValue={id} />
          </div>
          <div className="field">
            <label className="label">Surname</label>
            <input className="input" />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" />
          </div>
          <div className="field">
            <label className="label">Company</label>
            <input className="input" />
          </div>
          <div className="field">
            <label className="label">Last seen</label>
            <input className="input" value={new Date().toISOString()} readOnly />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="label">Notes</label>
            <textarea className="input" rows={6} />
          </div>
        </div>
      </div>
    </section>
  );
}
