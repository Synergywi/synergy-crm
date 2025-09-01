import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ContactsList from "./pages/ContactsList";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";

// Tiny helper so NavLink never trips "implicit any"
const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `nav-link${isActive ? " nav-link--active" : ""}`;

// You can keep a single client for the whole app.
// (Even if the pages below don't use React Query yet, this is ready for API wiring.)
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-shell grid" style={{ minHeight: "100vh", gridTemplateColumns: "220px 1fr" }}>
          {/* Sidebar */}
          <aside className="aside" style={{ background: "#0f172a", color: "#cbd5e1" }}>
            <div style={{ padding: "16px 20px", fontWeight: 700 }}>Synergy CRM</div>
            <nav style={{ display: "flex", flexDirection: "column", padding: "0 8px 16px" }}>
              <NavLink to="/contacts" className={linkClass} style={{ padding: "10px 12px", borderRadius: 8 }}>
                Contacts
              </NavLink>
              <NavLink to="/companies" className={linkClass} style={{ padding: "10px 12px", borderRadius: 8 }}>
                Companies
              </NavLink>
            </nav>
          </aside>

          {/* Main */}
          <main className="main" style={{ background: "#0b1220", color: "#e2e8f0" }}>
            <div style={{ padding: 24 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/contacts" replace />} />
                <Route path="/contacts" element={<ContactsList />} />
                <Route path="/contacts/:id" element={<Contacts />} />
                <Route path="/companies" element={<Companies />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/contacts" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
