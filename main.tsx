// /main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// --- Theme hardeners -------------------------------------------------
(function enforceHubspotLightTheme() {
  const html = document.documentElement;

  // Nuke common dark toggles that libraries set
  html.classList.remove("dark");
  html.removeAttribute("data-theme");
  html.removeAttribute("data-color-mode");
  html.setAttribute("data-theme", "hubspot");

  // Ensure the hubspot theme stylesheet exists; inject if missing
  const hasTheme = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  ).some((l) => (l.getAttribute("href") || "").includes("hubspot-theme.css"));

  if (!hasTheme) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    // cache-bust so Azure/CDN can't serve a stale one
    link.href = `/hubspot-theme.css?v=${Date.now().toString().slice(-6)}`;
    document.head.appendChild(link);
  }
})();
// ---------------------------------------------------------------------

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
