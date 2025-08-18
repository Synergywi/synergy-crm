
// Minimal, robust add-on: Case Calendar (lite) + link-to-case from Calendar form.
// No modals, no tab dependency, no theme changes. Uses prompts for editing.
(function(){
  function byId(id){ return document.getElementById(id); }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
  function hhmm(iso){ const d=new Date(iso); return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
  function ymd(iso){ const d=new Date(iso); return d.toISOString().slice(0,10); }
  function ensureStores(){
    window.DATA = window.DATA || {};
    DATA.calendar = DATA.calendar || []; // events store
  }
  function canSeeCase(cs){
    const me = DATA.me||{}; const role = me.role||'';
    if(role==='Admin') return true;
    const inv=(cs.investigatorEmail||cs.investigator||'')+'';
    return inv===me.email || inv===me.name;
  }
  function myCases(){ return (DATA.cases||[]).filter(canSeeCase); }
  function ownerName(email){ const u=(DATA.users||[]).find(u=>u.email===email); return (u&&u.name)||email||''; }

  function renderCaseCalendarLite(){
    if(!window.App) return;
    if(App.state.route!=='case' || !App.state.currentCaseId) return;
    ensureStores();
    const csId = App.state.currentCaseId;
    const list = (DATA.calendar||[]).filter(e=>e.caseId===csId).sort((a,b)=>String(a.startISO).localeCompare(String(b.startISO)));
    const rows = list.map(e=>`
      <tr>
        <td>${new Date(e.startISO).toLocaleDateString()}</td>
        <td>${hhmm(e.startISO)}–${hhmm(e.endISO)}</td>
        <td>${esc(e.title||'')}</td>
        <td>${esc(e.location||'')}</td>
        <td>${esc(ownerName(e.ownerEmail))}</td>
        <td class="right">
          <button class="btn light" data-act="liteEditEvent" data-arg="${e.id}">Edit</button>
          <button class="btn danger" data-act="liteDeleteEvent" data-arg="${e.id}">Delete</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;
    const isAdmin = ((DATA.me||{}).role||'')==='Admin';
    const ownerCtl = isAdmin
      ? `<div><label>Owner</label><select class="input" id="lite-owner">${
          (DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===(DATA.me||{}).email?'selected':'')}>${u.name}</option>`).join("")
        }</select></div>`
      : "";
    const html = `
      <div class="card" id="case-cal-lite">
        <h3 class="section-title">Case Calendar (lite)</h3>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="card">
        <h3 class="section-title">Add case event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="lite-title"></div>
          <div><label>Date</label><input class="input" id="lite-date" type="date" value="${ymd(new Date())}"></div>
          <div><label>Type</label><select class="input" id="lite-type"><option>Appointment</option><option>Note</option></select></div>
          <div><label>Start</label><input class="input" id="lite-start" type="time" value="10:00"></div>
          <div><label>End</label><input class="input" id="lite-end" type="time" value="11:00"></div>
          <div><label>Location</label><input class="input" id="lite-loc"></div>
          ${ownerCtl}
        </div>
        <div class="right" style="margin-top:8px">
          <button class="btn" data-act="liteCreateCaseEvent" data-arg="${csId}">Add</button>
        </div>
      </div>`;
    const main = document.querySelector('main.main') || document.querySelector('main');
    if(!main) return;
    const existing = document.getElementById('case-cal-lite');
    if(existing){
      const sib = existing.nextElementSibling;
      if(sib && sib.querySelector && sib.querySelector('#lite-title')) sib.remove();
      existing.insertAdjacentHTML('beforebegin', html);
      existing.remove();
    }else{
      main.insertAdjacentHTML('beforeend', html);
    }
  }

  function injectCalendarFormCaseField(){
    if(!window.App || App.state.route!=='calendar') return;
    ensureStores();
    const loc = document.getElementById('ev-loc');
    if(!loc) return;
    if(document.getElementById('lite-ev-case')) return;
    const cases = myCases();
    const opts = cases.map(cs=>`<option value="${cs.id}">${esc(cs.fileNumber||cs.id)} — ${esc(cs.title||'')}</option>`).join('');
    const wrap = document.createElement('div');
    wrap.innerHTML = `<label>Case (optional)</label><select class="input" id="lite-ev-case"><option value="">—</option>${opts}</select>`;
    loc.parentElement.insertAdjacentElement('afterend', wrap);
  }

  document.addEventListener('click', function(e){
    let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode;
    if(!t||t===document) return;
    const act=t.getAttribute('data-act'); const arg=t.getAttribute('data-arg');

    if(act==='liteCreateCaseEvent'){
      ensureStores();
      const csId=arg; const me=DATA.me||{email:'', name:'', role:''};
      const isAdmin = (me.role||'')==='Admin';
      const title=(byId('lite-title')||{}).value||'Untitled';
      const date=(byId('lite-date')||{}).value||new Date().toISOString().slice(0,10);
      const type=(byId('lite-type')||{}).value||'Appointment';
      const start=(byId('lite-start')||{}).value||'10:00';
      const end=(byId('lite-end')||{}).value||'11:00';
      const loc=(byId('lite-loc')||{}).value||'';
      const owner = isAdmin ? ((byId('lite-owner')||{}).value||me.email) : me.email;
      const sISO = `${date}T${start}:00`, eISO = `${date}T${end}:00`;
      const ev = { id: uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName: ownerName(owner), location:loc, type, caseId:csId };
      DATA.calendar.push(ev);
      try{ if(typeof persistAll==='function') persistAll(); }catch(_){}
      if(typeof render==='function') render();
      e.stopPropagation(); return;
    }

    if(act==='liteEditEvent'){
      ensureStores();
      const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
      const tNew=prompt('Title', ev.title||''); if(tNew===null) return;
      const dNew=prompt('Date (YYYY-MM-DD)', (ev.startISO||'').slice(0,10)); if(dNew===null) return;
      const sNew=prompt('Start (HH:MM)', (ev.startISO||'').slice(11,16)); if(sNew===null) return;
      const eNew=prompt('End (HH:MM)', (ev.endISO||'').slice(11,16)); if(eNew===null) return;
      const lNew=prompt('Location', ev.location||''); if(lNew===null) return;
      ev.title=tNew; ev.startISO=`${dNew}T${sNew}:00`; ev.endISO=`${dNew}T${eNew}:00`; ev.location=lNew;
      try{ if(typeof persistAll==='function') persistAll(); }catch(_){}
      if(typeof render==='function') render();
      e.stopPropagation(); return;
    }

    if(act==='liteDeleteEvent'){
      ensureStores();
      DATA.calendar = (DATA.calendar||[]).filter(x=>x.id!==arg);
      try{ if(typeof persistAll==='function') persistAll(); }catch(_){}
      if(typeof render==='function') render();
      e.stopPropagation(); return;
    }
  }, true);

  function wrapSet(){
    if(!window.App || typeof App.set!=='function' || App.__liteCalWrapped) return;
    const _set = App.set.bind(App);
    App.set = function(p){ const r=_set(p); try{ renderCaseCalendarLite(); injectCalendarFormCaseField(); }catch(_){ } return r; };
    App.__liteCalWrapped = true;
  }

  document.addEventListener('DOMContentLoaded', function(){
    ensureStores(); wrapSet();
    try{ renderCaseCalendarLite(); injectCalendarFormCaseField(); }catch(_){}
  });
})();
