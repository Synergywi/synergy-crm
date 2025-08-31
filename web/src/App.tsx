import { NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="app-shell">{/* NOTE: no stray `grid` attribute here */}
      <aside className="aside">
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/contacts"  className={({ isActive }) => isActive ? "active" : ""}>Contacts</NavLink>
          <NavLink to="/companies" className={({ isActive }) => isActive ? "active" : ""}>Companies</NavLink>
          <NavLink to="/documents" className={({ isActive }) => isActive ? "active" : ""}>Documents</NavLink>
          <NavLink to="/resources" className={({ isActive }) => isActive ? "active" : ""}>Resources</NavLink>
          <NavLink to="/admin"     className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink>
        </nav>
      </aside>

      <main className="main">
        {/* Your pages (Contacts, Contact details, etc.) render here */}
        <Outlet />
      </main>
    </div>
  );
}
