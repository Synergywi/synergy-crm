import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

/* Use the pages you already have */
import ContactsList from "./pages/ContactsList";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";

const qc = new QueryClient();

function Layout() {
  return (
    <div className="app-shell">
      <aside>
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? "active" : "")}>Contacts</NavLink>
          <NavLink to="/companies" className={({ isActive }) => (isActive ? "active" : "")}>Companies</NavLink>
        </nav>
      </aside>
      <main>
        <Routes>
          <Route index element={<ContactsList />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/:id" element={<Contacts />} />
          <Route path="companies" element={<Companies />} />
        </Routes>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
