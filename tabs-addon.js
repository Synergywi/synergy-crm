
/**
 * Robust tabbing add-on for Synergy CRM.
 * - Non-destructive: if headings not found, it does nothing.
 * - Never leaves a page empty: only hides sections when a tab bar is successfully created.
 * - Idempotent: won't re-tabify the same view.
 */
(function(){
  const H = (root, sel) => (root||document).querySelector(sel);
  const HA = (root, sel) => Array.from((root||document).querySelectorAll(sel));
  const TXT = n => (n && (n.textContent||'').trim()) || '';

  // Map page type -> section labels we want as tabs
  const MAP = {
    case:    ["Case Notes","Tasks","Case Documents"],
    company: ["Company Contacts","Related Cases","Company Documents"],
    contact: ["Portal Access"]
  };

  function whichPage(root){
    // Look for the big title card -> h2 text
    const h2s = HA(root, "main .card h2, main h2");
    const header = h2s.length ? TXT(h2s[0]) : "";
    if (/^Case\b/i.test(header)) return "case";
    if (/^Company\b/i.test(header)) return "company";
    if (/^Contact\b/i.test(header)) return "contact";
    // Fallback: use sidebar active item text
    const active = H(root, "aside .nav li.active");
    const t = active ? TXT(active) : "";
    if (/^Cases/i.test(t)) return "case";
    if (/^Companies/i.test(t)) return "company";
    if (/^Contacts/i.test(t)) return "contact";
    return null;
  }

  function closestSectionFromHeading(h){
    // We treat the parent .section or .card that contains this heading as the section root
    let n = h;
    while(n && n !== document){
      if(n.classList && (n.classList.contains("section") || n.classList.contains("card"))) return n;
      n = n.parentNode;
    }
    return h;
  }

  function buildTabs(root){
    const main = H(root, "main.main");
    if(!main || main.dataset.tabified === "1") return; // already done or no main

    const page = whichPage(root);
    if(!page) return;

    // Candidate headings for grouping
    const wanted = MAP[page] || [];
    if(!wanted.length) return;

    // Locate headings present on the page
    const foundHeadings = HA(main, ".section header h3, h3.section-title, h3, .section h3, .card h3");
    const byLabel = {};
    for(const h of foundHeadings){
      const t = TXT(h);
      if (wanted.includes(t)) {
        byLabel[t] = h;
      }
    }

    // If we can't find at least one target heading, don't tabify
    const present = wanted.filter(lbl => byLabel[lbl]);
    if(present.length === 0) return;

    // Find where to insert the tabs (after the header card)
    // We'll try to insert right before the first found heading.
    const firstHeading = byLabel[present[0]];
    const insertPoint = firstHeading.closest(".card") || firstHeading.closest(".section") || firstHeading;

    // Collect all nodes from after the main title card to end; we will group them.
    // Find the big header card (the one that holds the Save/Delete/Back buttons)
    const headerCard = H(main, ".card h2") ? H(main, ".card h2").closest(".card") : null;
    if(!headerCard) return; // nothing to do

    // Gather all siblings after the headerCard
    let acc = [];
    let n = headerCard.nextElementSibling;
    while(n){
      acc.push(n);
      n = n.nextElementSibling;
    }
    if(acc.length === 0) return; // nothing to tabify

    // Build panels map: default ('details' or 'summary') and each named section
    const container = document.createElement("div");
    container.className = "tabwrap card";
    // Tab bar
    const tabsbar = document.createElement("div");
    tabsbar.className = "tabsbar";
    container.appendChild(tabsbar);

    // Panels holder
    const panels = document.createElement("div");
    panels.className = "tabscontent";
    container.appendChild(panels);

    function addTab(key, label, nodes){
      const btn = document.createElement("button");
      btn.className = "tabbtn";
      btn.type = "button";
      btn.dataset.tab = key;
      btn.textContent = label;

      const panel = document.createElement("div");
      panel.className = "tabpanel";
      panel.dataset.tab = key;

      // Move nodes into the panel
      for(const x of nodes){
        panel.appendChild(x);
      }
      tabsbar.appendChild(btn);
      panels.appendChild(panel);
    }

    // Split nodes into groups: defaultGroup until we meet the first wanted heading; then each wanted heading's section becomes its own group
    const groups = {};
    groups.__default = []; // Details / Summary

    const labelToNodes = {};
    for(const lbl of present){
      const h = byLabel[lbl];
      const secRoot = closestSectionFromHeading(h);
      labelToNodes[lbl] = secRoot;
    }

    // Build a set of section roots that should form their own tabs
    const tabRoots = new Set(Object.values(labelToNodes));

    // Partition acc into default + tab sections (preserving order)
    for(const node of acc){
      if (tabRoots.has(node)){
        // handled later as its own tab — skip from default
      } else {
        groups.__default.push(node);
      }
    }

    // If __default is empty and we only have 1 present section, skip tabify (no real need)
    if(groups.__default.length === 0 && present.length < 2){
      return; // leave layout as-is, safer
    }

    // Build Default tab label per page
    const defaultLabel = (page === "company") ? "Summary" : "Details";
    addTab("__default", defaultLabel, groups.__default);

    // Add each found section as its own tab (move its section node)
    for(const lbl of present){
      const secRoot = labelToNodes[lbl];
      addTab(lbl, lbl, [secRoot]);
    }

    // Insert the container before the first tabbed section (or after header card)
    headerCard.after(container);

    // Activate first tab
    function activate(key){
      HA(container, ".tabbtn").forEach(b=>b.classList.toggle("active", b.dataset.tab===key));
      HA(container, ".tabpanel").forEach(p=>p.classList.toggle("active", p.dataset.tab===key));
    }
    const firstKey = "__default";
    activate(firstKey);

    tabsbar.addEventListener("click", (e)=>{
      const b = e.target.closest(".tabbtn");
      if(!b) return;
      activate(b.dataset.tab);
    });

    main.dataset.tabified = "1";
  }

  function tryTabify(){
    try { buildTabs(document); } catch(e){ console.warn("Tabify error:", e); }
  }

  // Run on DOM ready and whenever #app mutates (your app re-renders content there)
  document.addEventListener("DOMContentLoaded", tryTabify);
  const appRoot = document.getElementById("app");
  if(appRoot){
    const mo = new MutationObserver(()=>{
      // clear flag so we reprocess new pages
      const main = document.querySelector("main.main");
      if(main) delete main.dataset.tabified;
      tryTabify();
    });
    mo.observe(appRoot, {childList:true, subtree:true});
  }
})();
