import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import "./index.css";

/** -------------------------
 * Temporary pages so content renders now.
 * Replace these with your real components later, e.g.:
 *   import ContactsPage from "./pages/contacts";
 *   import CompaniesPage from "./pages/companies";
 * ...and then use them in the <Route> elements.
 * ------------------------ */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h2 style={{ margin: "4px 0 12px 4px", fontSize: 18 }}>{title}</h2>
      {children}
    </div>
  );
}

function ContactsPage() {
  return (
    <Card title="Contacts">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 240 }}>Name</th>
            <th>Company</th>
            <th style={{ width: 260 }}>Email</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bruce Wayne</td>
            <td>Wayne Enterprises</td>
            <td>bruce@wayne.com</td>
            <td><button className="btn">Open</button></td>
          </tr>
          <tr>
            <td>Diana Prince</td>
            <td>Themyscira Embassy</td>
            <td>diana@embassy.org</td>
            <td><button className="btn">Open</button></td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
function CompaniesPage() { return <Card title="Companies">Coming soon…</Card>; }
function DocumentsPage() { return <Card title="Documents">Coming soon…</Card>; }
function ResourcesPage() { return <Card title="Resources">Coming soon…</Card>; }
function AdminPage()     { return <Card title="Admin">Coming soon…</Card>; }
function DashboardPage() { return <Card title="Dashboard">Coming soon…</Card>; }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* App is the shell (sidebar + main). Children render inside it. */}
        <Route element={<App />}>
          <Route index element={<Navigate to="/contacts" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="contacts"  element={<ContactsPage  />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="admin"     element={<AdminPage     />} />
          <Route path="*"         element={<Navigate to="/contacts" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
