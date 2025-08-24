
import { useMemo, useState } from "react";

type LogItem = { at: string; ip: string; ua: string; durationSec: number };
type Contact = {
  id: number; name: string; email: string; company?: string;
  userLog: LogItem[];
};

function humanAgo(iso?: string) {
  if (!iso) return "—";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime())/1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  const m = s/60; if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m/60; if (h < 24) return `${Math.floor(h)}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

const seed: Contact[] = [
  {
    id: 1, name: "Alex Maxwell", email: "alex@contoso.example", company: "Contoso Pty Ltd",
    userLog: [
      { at: new Date(Date.now()-1000*60*12).toISOString(), ip: "203.0.113.10", ua: "Chrome 126 / macOS", durationSec: 420 },
      { at: new Date(Date.now()-1000*60*60*13).toISOString(), ip: "203.0.113.10", ua: "Chrome 126 / macOS", durationSec: 300 },
    ],
  },
  {
    id: 2, name: "Jamie Wu", email: "jamie@northwind.example", company: "Northwind",
    userLog: [
      { at: new Date(Date.now()-1000*60*60*48).toISOString(), ip: "198.51.100.5", ua: "Edge 124 / Windows", durationSec: 180 },
    ],
  },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(seed);
  const [activeId, setActiveId] = useState<number>(1);

  const active = useMemo(
    () => contacts.find(c => c.id === activeId) ?? contacts[0],
    [contacts, activeId]
  );

  function simulateLogin() {
    const entry: LogItem = {
      at: new Date().toISOString(),
      ip: "198.51.100.7",
      ua: "Safari / iOS",
      durationSec: Math.floor(120 + Math.random()*600),
    };
    setContacts(cs => cs.map(c => c.id === active.id ? { ...c, userLog: [entry, ...c.userLog] } : c));
  }

  function clearLog() {
    setContacts(cs => cs.map(c => c.id === active.id ? { ...c, userLog: [] } : c));
  }

  const lastSeen = active.userLog[0]?.at;

  return (
    <div className="grid">
      <div className="card span-4">
        <h3>Contacts</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Company</th><th>Last seen</th></tr></thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} onClick={() => setActiveId(c.id)} style={{cursor:"pointer", background: c.id===activeId ? "#131a28" : "transparent"}}>
                <td>{c.name}</td>
                <td>{c.company ?? "—"}</td>
                <td>
                  <span className="badge">
                    <span style={{
                      width:8,height:8,borderRadius:99,
                      background: c.userLog.length && (Date.now()-new Date(c.userLog[0].at).getTime()) < 1000*60*30 ? "#34d399" : "#f59e0b"
                    }}/>
                    {humanAgo(c.userLog[0]?.at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card span-8">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3>{active.name}</h3>
          <div className="row" style={{gap:8}}>
            <button className="btn ghost" onClick={simulateLogin}>Simulate login</button>
            <button className="btn ghost" onClick={clearLog}>Clear log</button>
          </div>
        </div>

        <div className="space"></div>
        <div className="row" style={{gap:10}}>
          <div className="badge">
            <span style={{width:8,height:8,borderRadius:99, background:"#34d399"}}/>
            Last seen: {humanAgo(lastSeen)}
          </div>
        </div>

        <div className="space"></div>
        <h4 style={{margin:"8px 0 6px", color:"#7e8aa0"}}>User Log</h4>
        {active.userLog.length === 0 ? (
          <div style={{color:"#7e8aa0"}}>No sessions yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>When</th><th>Duration</th><th>IP</th><th>Agent</th></tr>
            </thead>
            <tbody>
              {active.userLog.map((l,i) => (
                <tr key={i}>
                  <td>{new Date(l.at).toLocaleString()}</td>
                  <td>{Math.round(l.durationSec)}s</td>
                  <td>{l.ip}</td>
                  <td>{l.ua}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
