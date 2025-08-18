
// Case Calendar + Modal + Notifications Addon (non-invasive)
(function(){
  function byId(id){ return document.getElementById(id); }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
  function hhmm(d){ const dt=new Date(d); return dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
  function ymd(d){ const dt=new Date(d); return dt.toISOString().slice(0,10); }
  function ensureStores(){ window.DATA=window.DATA||{}; DATA.calendar=DATA.calendar||[]; DATA.notifications=DATA.notifications||[]; }
  function persist(){ try{ if(typeof persistAll==='function') persistAll(); }catch(e){} try{ localStorage.setItem('DATA.calendar', JSON.stringify(DATA.calendar)); }catch(e){} try{ localStorage.setItem('DATA.notifications', JSON.stringify(DATA.notifications)); }catch(e){} }
  function isAdmin(){ return ((DATA.me||{}).role||'')==='Admin'; }
  function myCases(){ const me=DATA.me||{}; return (DATA.cases||[]).filter(cs=>{ const inv=(cs.investigatorEmail||cs.investigator||'')+''; return isAdmin() || inv===me.email || inv===me.name; }); }
  function notify(action, ev){ ensureStores(); DATA.notifications.unshift({id:uid(), action, evId:ev.id, title:ev.title, when:(new Date()).toISOString(), read:false}); persist(); }

  if(typeof window.renderEventModal!=='function'){ window.renderEventModal=function(ev){
    if(!ev){ document.getElementById('modal-root')?.remove(); e.stopPropagation(); __handled=true; return; }
    const ownerSelect = isAdmin()? `<div><label>Owner</label><select class="input" id="em-owner">${(DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
    const caseOpts = myCases().map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||"")?'selected':'')}>${cs.fileNumber} — ${esc(cs.title||'')}</option>`).join("");
    const caseSelect = `<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${caseOpts}</select></div>`;
    const node=document.createElement('div'); node.id='modal-root'; node.innerHTML=`
      <div class="modal-backdrop" data-act="closeModal"></div>
      <div class="modal">
        <h3 class="section-title">Edit Event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
          <div><label>Date</label><input class="input" id="em-date" type="date" value="${(ev.startISO||'').slice(0,10)}"></div>
          <div><label>Type</label><select class="input" id="em-type"><option${ev.type==='Appointment'?' selected':''}>Appointment</option><option${ev.type==='Note'?' selected':''}>Note</option></select></div>
          <div><label>Start</label><input class="input" id="em-start" type="time" value="${new Date(ev.startISO).toISOString().slice(11,16)}"></div>
          <div><label>End</label><input class="input" id="em-end" type="time" value="${new Date(ev.endISO).toISOString().slice(11,16)}"></div>
          <div><label>Location</label><input class="input" id="em-loc" value="${esc(ev.location||'')}"></div>
          ${caseSelect}
          ${ownerSelect}
        </div>
        <div class="right" style="margin-top:8px">
          <button class="btn" data-act="saveEvent" data-arg="${ev.id}">Save</button>
          <button class="btn danger" data-act="deleteEvent" data-arg="${ev.id}">Delete</button>
          <button class="btn light" data-act="closeModal">Cancel</button>
        </div>
      </div>`; document.body.appendChild(node);
  };}

  document.addEventListener('click', function(e){ /*__handled_flag__*/ let __handled=false;
    let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode;
    if(!t||t===document) e.stopPropagation(); __handled=true; return; const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'); ensureStores();

    
    if(act==='createEvent'){
      ensureStores();
      const me=DATA.me||{email:'',name:'',role:''};
      const title=(document.getElementById('ev-title')||{}).value||'Untitled';
      const date=(document.getElementById('ev-date')||{}).value||new Date().toISOString().slice(0,10);
      const type=(document.getElementById('ev-type')||{}).value||'Appointment';
      const start=(document.getElementById('ev-start')||{}).value||'09:00';
      const end=(document.getElementById('ev-end')||{}).value||'10:00';
      const loc=(document.getElementById('ev-loc')||{}).value||'';
      const owner = (((DATA.me||{}).role||'')==='Admin') ? ((document.getElementById('ev-owner')||{}).value||me.email) : me.email;
      const ownerName = ((DATA.users||[]).find(u=>u.email===owner)||{}).name || owner;
      const sISO = date+'T'+start+':00', eISO = date+'T'+end+':00';
      const caseId=(document.getElementById('ev-case')||{}).value||'';
      const ev={id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||null};
      DATA.calendar.push(ev);
      try{ if(typeof persistAll==='function') persistAll(); }catch(_){}
      if(typeof render==='function') render();
      e.stopPropagation(); __handled=true; return;
    }

    if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); e.stopPropagation(); __handled=true; return; }
    if(act==='closeModal'){ document.getElementById('modal-root')?.remove(); e.stopPropagation(); __handled=true; return; }

    if(act==='saveEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) e.stopPropagation(); __handled=true; return;
      const date=(document.getElementById('em-date')||{}).value||ev.startISO.slice(0,10);
      const s=(document.getElementById('em-start')||{}).value||new Date(ev.startISO).toISOString().slice(11,16);
      const e2=(document.getElementById('em-end')||{}).value||new Date(ev.endISO).toISOString().slice(11,16);
      ev.title=(document.getElementById('em-title')||{}).value||ev.title;
      ev.type=(document.getElementById('em-type')||{}).value||ev.type;
      ev.location=(document.getElementById('em-loc')||{}).value||ev.location;
      ev.startISO=`${date}T${s}:00`; ev.endISO=`${date}T${e2}:00`;
      const csel=(document.getElementById('em-case')||{}).value||''; ev.caseId=csel||null;
      if(((DATA.me||{}).role||'')==='Admin'){ const owner=(document.getElementById('em-owner')||{}).value||ev.ownerEmail; ev.ownerEmail=owner; ev.ownerName=((DATA.users||[]).find(u=>u.email===owner)||{}).name||owner; }
      notify('updated', ev); persist(); document.getElementById('modal-root')?.remove(); if(typeof render==='function') render(); e.stopPropagation(); __handled=true; return; }

    if(act==='deleteEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) notify('deleted', ev);
      DATA.calendar=(DATA.calendar||[]).filter(x=>x.id!==arg); persist(); document.getElementById('modal-root')?.remove(); if(typeof render==='function') render(); e.stopPropagation(); __handled=true; return; }

    if(act==='createCaseEvent'){ const csId=arg; const me=DATA.me||{email:'',name:''};
      const title=(document.getElementById('ce-title')||{}).value||'Untitled';
      const date=(document.getElementById('ce-date')||{}).value||new Date().toISOString().slice(0,10);
      const type=(document.getElementById('ce-type')||{}).value||'Appointment';
      const start=(document.getElementById('ce-start')||{}).value||'10:00';
      const end=(document.getElementById('ce-end')||{}).value||'11:00';
      const loc=(document.getElementById('ce-loc')||{}).value||'';
      const owner = (((DATA.me||{}).role||'')==='Admin') ? ((document.getElementById('ce-owner')||{}).value||me.email) : me.email;
      const ownerName = ((DATA.users||[]).find(u=>u.email===owner)||{}).name || owner;
      const sISO=`${date}T${start}:00`, eISO=`${date}T${end}:00`;
      const ev={id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:csId};
      DATA.calendar.push(ev); notify('created', ev); persist(); if(typeof render==='function') render(); e.stopPropagation(); __handled=true; return; }

    if(act==='notifOpen'){ const n=(DATA.notifications||[]).find(x=>x.id===arg); if(!n) e.stopPropagation(); __handled=true; return; n.read=true; const ev=(DATA.calendar||[]).find(e=>e.id===n.evId); if(ev) renderEventModal(ev); persist(); if(typeof render==='function') render(); e.stopPropagation(); __handled=true; return; }
    if(act==='notifDismiss'){ const n=(DATA.notifications||[]).find(x=>x.id===arg); if(n) n.read=true; persist(); if(typeof render==='function') render(); e.stopPropagation(); __handled=true; return; }
    if(act==='notifToggle'){ const s=App.state.notifs||{show:'unread'}; s.show=(s.show==='all'?'unread':'all'); App.set({notifs:s}); e.stopPropagation(); __handled=true; return; }
    if(act==='notifMarkAll'){ for(const n of (DATA.notifications||[])) n.read=true; persist(); App.set({}); e.stopPropagation(); __handled=true; return; }
  if(__handled){ return; } }, true);

  
function injectCalendarTabButton(){
  const tabs = document.querySelector('.tabs');
  if(!tabs) return;
  const has = Array.from(tabs.querySelectorAll('[data-act="tab"]')).some(el=>el.getAttribute('data-arg')==='calendar');
  if(!has){
    const btn=document.createElement('div'); btn.className='tab'; btn.setAttribute('data-act','tab'); btn.setAttribute('data-scope','case'); btn.setAttribute('data-arg','calendar'); btn.textContent='Calendar'; tabs.appendChild(btn);
  }
}
function injectCaseCalendar(){
    if(!window.App || !window.DATA) e.stopPropagation(); __handled=true; return;
    if(App.state.route!=='case' || !App.state.currentCaseId) e.stopPropagation(); __handled=true; return;
    const csId = App.state.currentCaseId;
    const list=(DATA.calendar||[]).filter(e=>e.caseId===csId).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows=list.map(e=>`<tr><td>${new Date(e.startISO).toLocaleDateString()}</td><td>${hhmm(e.startISO)}–${hhmm(e.endISO)}</td><td>${esc(e.title)}</td><td>${esc(e.location||'')}</td><td>${esc(e.ownerName||e.ownerEmail||'')}</td><td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td></tr>`).join('') || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;
    const ownerSelect = (((DATA.me||{}).role||'')==='Admin')
      ? `<div><label>Owner</label><select class="input" id="ce-owner">${(DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===(DATA.me||{}).email?'selected':'')}>${u.name}</option>`).join("")}</select></div>`
      : "";
    injectCalendarTabButton();
    const html = `
      <div class="tabpanel active" id="case-cal-ext">
        <div class="card"><h3 class="section-title">Case Calendar</h3>
          <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        </div>
        <div class="card"><h3 class="section-title">Add case event</h3>
          <div class="grid cols-3">
            <div><label>Title</label><input class="input" id="ce-title"></div>
            <div><label>Date</label><input class="input" id="ce-date" type="date" value="${ymd(new Date())}"></div>
            <div><label>Type</label><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select></div>
            <div><label>Start</label><input class="input" id="ce-start" type="time" value="10:00"></div>
            <div><label>End</label><input class="input" id="ce-end" type="time" value="11:00"></div>
            <div><label>Location</label><input class="input" id="ce-loc"></div>
            ${ownerSelect}
          </div>
          <div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="${csId}">Add</button></div>
        </div>
      </div>`;
    const main = document.querySelector('main.main') || document.querySelector('main');
    const existing = document.getElementById('case-cal-ext');
    if(existing) existing.outerHTML = html; else if(main) main.insertAdjacentHTML('beforeend', html);
  }

  function injectDashboardNotifs(){
    if(!window.App || App.state.route!=='dashboard') e.stopPropagation(); __handled=true; return;
    const ns=App.state.notifs||{show:'unread'};
    const list=(DATA.notifications||[]).filter(n=>ns.show==='all'||!n.read);
    const rows=list.map(n=>`<tr><td>${new Date(n.when).toLocaleString()}</td><td>${n.action}</td><td>${esc(n.title)}</td><td class="right"><button class="btn light" data-act="notifOpen" data-arg="${n.id}">Open</button> <button class="btn" data-act="notifDismiss" data-arg="${n.id}">Dismiss</button></td></tr>`).join('') || `<tr><td colspan="4" class="muted">No notifications</td></tr>`;
    const block=document.createElement('div'); block.id='notif-cal-ext';
    block.innerHTML=`
      <div class="card">
        <h3 class="section-title">Calendar updates</h3>
        <div class="right" style="margin-bottom:6px">
          <button class="btn light" data-act="notifToggle">${ns.show==='all'?'Show unread':'Show all'}</button>
          <button class="btn" data-act="notifMarkAll">Mark all read</button>
        </div>
        <table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    const main=document.querySelector('main.main')||document.querySelector('main');
    const existing=document.getElementById('notif-cal-ext'); if(existing) existing.replaceWith(block); else if(main) main.appendChild(block);
  }

  function wrapSet(){
    if(!window.App || typeof App.set!=='function' || App.__caseCalWrapped) e.stopPropagation(); __handled=true; return;
    const _set=App.set.bind(App);
    App.set=function(p){ const r=_set(p); try{ injectCaseCalendar(); injectDashboardNotifs(); injectCalendarFormExtras(); }catch(e){} return r; };
    App.__caseCalWrapped=true;
  }

  document.addEventListener('DOMContentLoaded', function(){ ensureStores(); wrapSet(); try{ injectCaseCalendar(); injectDashboardNotifs(); injectCalendarFormExtras(); }catch(e){} });
})();

function injectCalendarFormExtras(){
  try{
    const after = document.getElementById('ev-loc');
    if(after && !document.getElementById('ev-case')){
      const me=DATA.me||{}; const role=(me.role||''); const admin=(role==='Admin');
      const my=(DATA.cases||[]).filter(cs=>{ const inv=(cs.investigatorEmail||cs.investigator||'')+''; return admin||inv===me.email||inv===me.name; });
      const opts=my.map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${cs.title||''}</option>`).join('');
      const wrap=document.createElement('div');
      wrap.innerHTML = `<label>Case (optional)</label><select class="input" id="ev-case"><option value="">—</option>${opts}</select>`;
      after.parentElement.insertAdjacentElement('afterend', wrap);
    }
  }catch(_){}
}
