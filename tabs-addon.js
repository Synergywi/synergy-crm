
/*! Tabs Addon v1: non-destructive tab UI for existing Synergy CRM pages */
(function(){
  const LABELS = {
    cases: { // headingText => tab key
      "Case Notes": "notes",
      "Tasks": "tasks",
      "Case Documents": "documents"
    },
    companies: {
      "About this company":"summary",
      "Related Contacts":"contacts",
      "Related Cases":"cases",
      "Company Documents":"documents"
    },
    contacts: {
      "Portal Access":"portal"
    }
  };

  const DEFAULTS = {cases:"details", companies:"summary", contacts:"details"};

  function text(el){ return (el && (el.textContent||"")).trim(); }

  function findMain(){ return document.querySelector('main.main') || document.querySelector('main'); }

  function casePageTabify(root){
    // Find the big header card then next siblings for sections
    // Map sections by heading text
    const h3s = Array.from(root.querySelectorAll('h3, .section-title, .card header h3'));
    const sectionByLabel = {};
    h3s.forEach(h => {
      const lbl = text(h);
      if (LABELS.cases[lbl]) {
        // the section container is the closest card/section parent
        const card = h.closest('.section, .card') || h.parentElement;
        if(card) sectionByLabel[lbl] = card;
      }
    });
    if(!Object.keys(sectionByLabel).length) return false;

    // Details block = everything before first known section
    const firstSection = sectionByLabel[Object.keys(sectionByLabel)[0]];
    const all = Array.from(root.querySelectorAll('.section, .card'));
    let details = [];
    for(const el of all){
      if(el === firstSection) break;
      // exclude empty header-only top wrapper
      if(el.querySelector('label') || el.querySelector('input') || el.querySelector('select')) details.push(el);
    }
    if(details.length===0) return false;

    // Build wrapper
    const wrap = document.createElement('div');
    wrap.className = '_tabwrap';
    const bar = document.createElement('div');
    bar.className = 'tabsbar';
    const panels = document.createElement('div');

    const order = [["details","Details"],["notes","Notes"],["tasks","Tasks"],["documents","Documents"]];
    const tabs = {};
    const pmap = {};

    order.forEach(([key,label])=>{
      const b=document.createElement('button');
      b.type='button'; b.className='tabbtn'; b.textContent=label; b.dataset.tab=key;
      bar.appendChild(b); tabs[key]=b;

      const p=document.createElement('div'); p.className='tabpanel'; p.dataset.tabpanel=key;
      panels.appendChild(p); pmap[key]=p;
    });

    // Move existing DOM into panels
    details.forEach(el=>pmap.details.appendChild(el));
    Object.entries(LABELS.cases).forEach(([lbl,key])=>{
      const sec = sectionByLabel[lbl];
      if(sec) pmap[key].appendChild(sec);
    });

    wrap.appendChild(bar);
    wrap.appendChild(panels);

    // Insert wrap before first details element
    details[0].parentNode.insertBefore(wrap, details[0]);
    // Activate default
    activateTab(wrap, DEFAULTS.cases);

    // Click handling
    bar.addEventListener('click', (e)=>{
      const btn = e.target.closest('.tabbtn'); if(!btn) return;
      activateTab(wrap, btn.dataset.tab);
    });
    return true;
  }

  function companyPageTabify(root){
    // Find labels
    const h3s = Array.from(root.querySelectorAll('h3, .section-title, .card header h3'));
    const sectionByLabel = {};
    h3s.forEach(h => {
      const lbl = text(h);
      if (LABELS.companies[lbl]) {
        const card = h.closest('.section, .card') || h.parentElement;
        if(card) sectionByLabel[lbl] = card;
      }
    });
    if(!Object.keys(sectionByLabel).length) return false;

    // Build wrapper
    const wrap = document.createElement('div'); wrap.className='_tabwrap';
    const bar = document.createElement('div'); bar.className='tabsbar';
    const panels = document.createElement('div');
    const order = [["summary","Summary"],["contacts","Company Contacts"],["cases","Related Cases"],["documents","Company Documents"]];
    const tabs={}, pmap={};
    order.forEach(([key,label])=>{
      const b=document.createElement('button'); b.type='button'; b.className='tabbtn'; b.textContent=label; b.dataset.tab=key;
      bar.appendChild(b); tabs[key]=b;
      const p=document.createElement('div'); p.className='tabpanel'; p.dataset.tabpanel=key;
      panels.appendChild(p); pmap[key]=p;
    });
    // Move
    Object.entries(LABELS.companies).forEach(([lbl,key])=>{
      const sec = sectionByLabel[lbl];
      if(sec) pmap[key].appendChild(sec);
    });
    wrap.appendChild(bar); wrap.appendChild(panels);
    // Insert before first matched section
    const first = sectionByLabel[Object.keys(sectionByLabel)[0]];
    first.parentNode.insertBefore(wrap, first);
    activateTab(wrap, DEFAULTS.companies);
    bar.addEventListener('click',(e)=>{
      const btn=e.target.closest('.tabbtn'); if(!btn) return; activateTab(wrap, btn.dataset.tab);
    });
    return true;
  }

  function contactPageTabify(root){
    const h3s = Array.from(root.querySelectorAll('h3, .section-title, .card header h3'));
    const portalH = h3s.find(h=>LABELS.contacts[text(h)]==='portal');
    if(!portalH) return false;
    const portalSec = portalH.closest('.section, .card') || portalH.parentElement;

    // details = everything before portal section
    const all = Array.from(root.querySelectorAll('.section, .card'));
    let details = [];
    for(const el of all){
      if(el === portalSec) break;
      if(el.querySelector('label') || el.querySelector('input') || el.querySelector('select')) details.push(el);
    }
    if(details.length===0) return false;

    const wrap = document.createElement('div'); wrap.className='_tabwrap';
    const bar = document.createElement('div'); bar.className='tabsbar';
    const p1=document.createElement('div'); p1.className='tabpanel'; p1.dataset.tabpanel='details';
    const p2=document.createElement('div'); p2.className='tabpanel'; p2.dataset.tabpanel='portal';
    const b1=document.createElement('button'); b1.type='button'; b1.className='tabbtn'; b1.dataset.tab='details'; b1.textContent='Details';
    const b2=document.createElement('button'); b2.type='button'; b2.className='tabbtn'; b2.dataset.tab='portal'; b2.textContent='Portal';
    bar.appendChild(b1); bar.appendChild(b2);
    details.forEach(el=>p1.appendChild(el)); p2.appendChild(portalSec);
    wrap.appendChild(bar); wrap.appendChild(p1); wrap.appendChild(p2);
    details[0].parentNode.insertBefore(wrap, details[0]);
    activateTab(wrap, DEFAULTS.contacts);
    bar.addEventListener('click',(e)=>{const btn=e.target.closest('.tabbtn'); if(!btn) return; activateTab(wrap, btn.dataset.tab);});
    return true;
  }

  function activateTab(wrap, key){
    wrap.querySelectorAll('.tabbtn').forEach(b=>b.classList.toggle('active', b.dataset.tab===key));
    wrap.querySelectorAll('.tabpanel').forEach(p=>p.classList.toggle('active', p.dataset.tabpanel===key));
  }

  function detectRoute(root){
    const h2 = text(root.querySelector('h2, h1'));
    if(h2.startsWith('Case ') || h2.startsWith('Case ')) return 'cases';
    if(h2==='Company' || /Company\b/i.test(h2)) return 'companies';
    if(h2==='Contact' || /Contact\b/i.test(h2)) return 'contacts';
    return '';
  }

  function tabify(){
    const main = findMain(); if(!main) return;
    // Avoid double-tabify
    if(main.querySelector('._tabwrap')) return;
    const route = detectRoute(main);
    if(route==='cases'){ casePageTabify(main); }
    else if(route==='companies'){ companyPageTabify(main); }
    else if(route==='contacts'){ contactPageTabify(main); }
  }

  // Run once on load
  document.addEventListener('DOMContentLoaded', tabify);
  // Re-run whenever app re-renders: observe #app mutations
  const appEl = document.getElementById('app') || document.body;
  const mo = new MutationObserver((m)=>{ tabify(); });
  mo.observe(appEl, {childList:true, subtree:true});
})();
