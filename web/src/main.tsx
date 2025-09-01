import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./App";
import "./index.css";

import DashboardPage from "./pages/DashboardPage";
import ContactsListPage from "./pages/ContactsList";
import CompaniesPage from "./pages/Companies";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "contacts", element: <ContactsListPage /> },
      { path: "companies", element: <CompaniesPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
