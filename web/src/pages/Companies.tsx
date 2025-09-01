import { useQuery } from "@tanstack/react-query";

type Company = { id:string; name:string; domain?:string; };

export default function CompaniesPage(){
  const { data, isLoading, error } = useQuery<Company[]>({
    queryKey:["companies"],
    queryFn: async ()=>{
      const res = await fetch("/api/companies");
      if(!res.ok) throw new Error("Failed to load companies");
      return res.json();
    }
  });

  return (
    <div className="panel">
      <div className="panel-header">Companies</div>
      <div className="toolbar">
        <button className="btn primary">New company</button>
      </div>
      <table className="table">
        <thead><tr><th>Name</th><th>Domain</th></tr></thead>
        <tbody>
          {isLoading && <tr><td colSpan={2}>Loading…</td></tr>}
          {error && <tr><td colSpan={2}>Error loading companies</td></tr>}
          {(data||[]).map(c=>(
            <tr key={c.id}><td>{c.name}</td><td>{c.domain || "—"}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
