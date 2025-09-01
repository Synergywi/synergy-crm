import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, NavLink, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ContactsListPage from "./pages/ContactsList";
import ContactsPage from "./pages/Contacts";
import CompaniesPage from "./pages/Companies";
import CompaniesListPage from "./pages/CompaniesPage"; // if you use a separate list page
import CompanyDetailPage from "./pages/CompanyDetail";
import DashboardPage from "./pages/DashboardPage";
// import DocumentsPage from "./pages/DocumentsPage";
// import ResourcesPage from "./pages/ResourcesPage";
// import AdminPage from "./pages/AdminPage";

import "./index.css";

const qc = new QueryClient();

function Layout() {
  return (
    <div className="app-shell">
      <aside className="aside">
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? "active" : "")}>Contacts</NavLink>
          <NavLink to="/companies" className={({ isActive }) => (isActive ? "active" : "")}>Companies</NavLink>
          {/* <NavLink to="/documents" className={({ isActive }) => (isActive ? "active" : "")}>Documents</NavLink>
          <NavLink to="/resources" className={({ isActive }) => (isActive ? "active" : "")}>Resources</NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>Admin</NavLink> */}
        </nav>
      </aside>

      <main className="main">
        <div className="content card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "contacts/list", element: <ContactsListPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "companies/list", element: <CompaniesListPage /> },
      { path: "companies/:id", element: <CompanyDetailPage /> },
      // { path: "documents", element: <DocumentsPage /> },
      // { path: "resources", element: <ResourcesPage /> },
      // { path: "admin", element: <AdminPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
