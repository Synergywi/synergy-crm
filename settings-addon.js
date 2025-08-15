// Synergy CRM settings add-on
(function(){
  // Feature flags or overrides can live here; kept minimal and safe.
  window.SynergySettings = Object.assign({
    companyPage: { enableDocuments: true, enableContacts: true, enableProfile: true }
  }, window.SynergySettings || {});

  // Provide a simple hook to persist Industry/Type server-side if host app listens.
  window.addEventListener("company:profile:save", (e)=>{
    // If the host app defines a persistence API, call it safely.
    try {
      if (window.API && typeof window.API.saveCompanyField === "function"){
        const { industry, type } = e.detail || {};
        if (industry !== undefined) window.API.saveCompanyField("industry", industry);
        if (type !== undefined) window.API.saveCompanyField("type", type);
      }
    } catch (err){ console.warn("Optional persistence hook failed:", err); }
  });
})();