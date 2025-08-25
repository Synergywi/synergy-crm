import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import CompaniesPage from "./pages/CompaniesPage";
import DashboardPage from "./pages/DashboardPage";

// 👇 change this line
import Contacts from "./web/pages/contacts";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink>
          <NavLink to="/companies" className={({isActive}) => isActive ? "active" : ""}>Companies</NavLink>
          <NavLink to="/contacts" className={({isActive}) => isActive ? "active" : ""}>Contacts</NavLink>
        </nav>
        <div style={{marginTop: 16, fontSize: 12, color: "#7e8aa0"}}>
          Path: <span className="kbd">{pathname}</span>
        </div>
      </aside>

      <main>
        <div className="header">
          <div className="title">Synergy CRM 2</div>
          <div className="badge">
            <span style={{width:8,height:8,borderRadius:99,background:"#34d399"}} />
            Live preview
          </div>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={<DashboardPage/>} />
            <Route path="/companies" element={<CompaniesPage/>} />
            {/* 👇 now using new CRUD contacts page */}
            <Route path="/contacts" element={<Contacts/>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
