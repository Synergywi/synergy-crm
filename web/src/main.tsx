import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  Outlet,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import ContactsPage from "./pages/Contacts";
import CompaniesPage from "./pages/Companies";
import "./index.css";

const qc = new QueryClient();
const nav = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

function Layout(): JSX.Element {
  return (
    <div className="app-shell">
      <aside className="side">
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink to="/contacts" className={nav}>Contacts</NavLink>
          <NavLink to="/companies" className={nav}>Companies</NavLink>
          <NavLink to="/documents" className={nav}>Documents</NavLink>
          <NavLink to="/resources" className={nav}>Resources</NavLink>
          <NavLink to="/admin" className={nav}>Admin</NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ContactsPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "companies", element: <CompaniesPage /> },
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
