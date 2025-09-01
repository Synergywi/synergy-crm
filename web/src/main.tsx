import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, NavLink, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContactsPage from "./pages/Contacts";
import CompaniesPage from "./pages/Companies";
import "./index.css";

const qc = new QueryClient();

function Layout(){
  return (
    <div className="app-shell">
      <aside>
        <div className="brand">Synergy CRM</div>
        <div className="nav">
          <NavLink to="/contacts" className={({isActive})=> isActive ? "active" : ""}>Contacts</NavLink>
          <NavLink to="/companies" className={({isActive})=> isActive ? "active" : ""}>Companies</NavLink>
          <NavLink to="/documents" className={({isActive})=> isActive ? "active" : ""}>Documents</NavLink>
          <NavLink to="/resources" className={({isActive})=> isActive ? "active" : ""}>Resources</NavLink>
          <NavLink to="/admin" className={({isActive})=> isActive ? "active" : ""}>Admin</NavLink>
        </div>
      </aside>
      <main>
        <Outlet/>
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  { path:"/", element:<Layout/>, children:[
    { index:true, element:<ContactsPage/> },
    { path:"/contacts", element:<ContactsPage/> },
    { path:"/companies", element:<CompaniesPage/> },
  ]},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </React.StrictMode>
);
