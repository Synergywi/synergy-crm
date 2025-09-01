import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ContactsPage from "./pages/Contacts";         // list
import ContactsListPage from "./pages/ContactsList"; // alt list (kept, route below)
import ContactDetailPage from "./pages/ContactDetail";

import CompaniesPage from "./pages/Companies";       // list
import CompanyDetailPage from "./pages/CompanyDetail";

import DashboardPage from "./pages/DashboardPage";

import "./index.css";

/** React Query client */
const qc = new QueryClient();

/** App layout (shell + nav + outlet) */
function Layout() {
  return (
    <div className="app-shell">
      <aside className="aside">
        <div className="brand">Synergy CRM</div>
        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Contacts
          </NavLink>
          <NavLink
            to="/contacts-list"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Contacts (Alt)
          </NavLink>
          <NavLink
            to="/companies"
            className={({ isActive }: { isActive: boolean }) => (isActive ? "active" : "")}
          >
            Companies
          </NavLink>
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

/** Router with all the pages you have in /pages */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },                 // /
      { path: "dashboard", element: <DashboardPage /> },           // /dashboard
      { path: "contacts", element: <ContactsPage /> },             // /contacts
      { path: "contacts-list", element: <ContactsListPage /> },    // /contacts-list
      { path: "contacts/:id", element: <ContactDetailPage /> },    // /contacts/123
      { path: "companies", element: <CompaniesPage /> },           // /companies
      { path: "companies/:id", element: <CompanyDetailPage /> },   // /companies/abc
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
