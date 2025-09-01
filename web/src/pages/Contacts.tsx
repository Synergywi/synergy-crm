import { useQuery } from "@tanstack/react-query";

type Contact = {
  id: string;
  givenName: string;
  surname: string;
  email?: string;
  companyName?: string;
};

export default function ContactsPage(){
  const { data, isLoading, error } = useQuery<Contact[]>({
    queryKey:["contacts"],
    queryFn: async ()=>{
      const res = await fetch("/api/contacts");
      if(!res.ok) throw new Error("Failed to load contacts");
      return res.json();
    }
  });

  return (
    <div className="panel">
      <div className="panel-header">Contacts</div>
      <div className="toolbar">
        <button className="btn primary">Create contact</button>
      </div>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Company</th><th>Email</th><th></th></tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={4}>Loading…</td></tr>}
          {error && <tr><td colSpan={4}>Error loading contacts</td></tr>}
          {(data||[]).map(c=>(
            <tr key={c.id}>
              <td>{c.givenName} {c.surname}</td>
              <td>{c.companyName || "—"}</td>
              <td>{c.email || "—"}</td>
              <td><span className="badge">Open</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
