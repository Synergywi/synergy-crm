
import { useEffect, useState } from "react";
import { api, Company } from "../api/client";

export default function CompaniesPage() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const list = await api.listCompanies();
        if (!cancel) setData(list);
      } catch (e: any) {
        if (!cancel) setErr(e.message ?? "Failed to load");
      } finally { if (!cancel) setLoading(false); }
    })();
    return () => { cancel = true; };
  }, []);

  return (
    <div className="grid">
      <div className="card span-8">
        <h3>Companies</h3>
        {loading ? <div>Loading…</div> : err ? <div style={{color:"#ef4444"}}>Error: {err}</div> : (
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Website</th><th>Created</th></tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.website ? <a href={c.website} target="_blank">{c.website}</a> : <span style={{color:"#7e8aa0"}}>—</span>}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card span-4">
        <h3>Add Company</h3>
        <Create onCreated={c => setData([c, ...data])}/>
      </div>
    </div>
  );
}

function Create({ onCreated }: { onCreated: (c: Company) => void }) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true); setErr(null);
      const created = await api.createCompany({ name: name.trim(), website: website.trim() || undefined });
      onCreated(created);
      setName(""); setWebsite("");
    } catch (e: any) {
      setErr(e.message ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="col">
      <div className="row"><input className="input" placeholder="Company name" value={name} onChange={e=>setName(e.target.value)} required /></div>
      <div className="space"></div>
      <div className="row"><input className="input" placeholder="Website (optional)" value={website} onChange={e=>setWebsite(e.target.value)} /></div>
      <div className="space"></div>
      <div className="row" style={{gap:10}}>
        <button className="btn primary" disabled={busy}>Create</button>
        {busy && <span className="kbd">Working…</span>}
      </div>
      {err && <div style={{color:"#ef4444",marginTop:8}}>Error: {err}</div>}
    </form>
  );
}
