
// Case Calendar Extension (non-invasive, keeps visuals)
(function(){
  function byId(id){ return document.getElementById(id); }
  function esc(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
  function timeHHMM(d){ return new Date(d).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
  function ensureCaseCalendar(){
    try{
      if(!window.App || !window.DATA) return;
      if(App.state.route!=='case' || !App.state.currentCaseId) return;
      const main = document.querySelector('main.main'); if(!main) return;
      // If tab panel exists already, leave it to the app
      if(document.querySelector('#case-cal-ext')) return;

      const csId = App.state.currentCaseId;
      const evList = (DATA.calendar||[]).filter(e=>e.caseId===csId).sort((a,b)=>a.startISO.localeCompare(b.startISO));
      const rows = evList.map(e=>`
        <tr>
          <td>${new Date(e.startISO).toLocaleDateString()}</td>
          <td>${timeHHMM(e.startISO)}–${timeHHMM(e.endISO)}</td>
          <td>${esc(e.title)}</td>
          <td>${esc(e.location||'')}</td>
          <td>${esc(e.ownerName||e.ownerEmail||'')}</td>
          <td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td>
        </tr>`).join('') || `<tr><td colspan="6" class="muted">No case events yet.</td></tr>`;

      const ownerSelect = ((DATA.me||{}).role||'Admin')==='Admin'
        ? `<div><label>Owner</label><select class="input" id="ce-owner">${
            (DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===(DATA.me.email||'')?'selected':'')}>${u.name}</option>`).join('')
          }</select></div>`
        : "";

      const block = document.createElement('div');
      block.id = 'case-cal-ext';
      block.innerHTML = `
        <div class="tabpanel ${App.state.tabs.case==='calendar'?'active':''}">
          <div class="card">
            <h3 class="section-title">Case Calendar</h3>
            <table class="table"><thead>
              <tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr>
            </thead><tbody>${rows}</tbody></table>
          </div>
          <div class="card">
            <h3 class="section-title">Add case event</h3>
            <div class="grid cols-3">
              <div><label>Title</label><input class="input" id="ce-title"></div>
              <div><label>Date</label><input class="input" id="ce-date" type="date" value="${(new Date()).toISOString().slice(0,10)}"></div>
              <div><label>Type</label><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select></div>
              <div><label>Start</label><input class="input" id="ce-start" type="time" value="10:00"></div>
              <div><label>End</label><input class="input" id="ce-end" type="time" value="11:00"></div>
              <div><label>Location</label><input class="input" id="ce-loc"></div>
              ${ownerSelect}
            </div>
            <div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="${csId}">Add</button></div>
          </div>
        </div>`;

      // Append at end of main (after existing panels)
      main.appendChild(block);
    }catch(e){ /* no-op */ }
  }

  // Modal editor (reuses same HTML across both calendar + case views)
  if(typeof window.renderEventModal!=='function'){
    window.renderEventModal = function(ev){
      if(!ev){ document.getElementById('modal-root')?.remove(); return; }
      const me=DATA.me||{}; const isAdmin=(me.role||'Admin')==='Admin';
      const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="em-owner">${
        (DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join("")
      }</select></div>` : "";
      const caseSelect = `<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${
        (DATA.cases||[]).map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||"")?'selected':'')}>${cs.fileNumber} — ${esc(cs.title||'')}</option>`).join("")
      }</select></div>`;
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
        </div>`;
      document.body.appendChild(node);
    };
  }

  // Extend App.set to run our post-render hook
  if(window.App && typeof App.set==='function' && !App.__setWrapped){
    const _set = App.set.bind(App);
    App.set = function(p){ _set(p); try{ ensureCaseCalendar(); }catch(e){} };
    App.__setWrapped = true;
  }

  // Global click handlers (idempotent)
  document.addEventListener('click', function(e){
    let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
    const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
    if(act==='openEvent'){
      const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); return;
    }
    if(act==='closeModal'){ document.getElementById('modal-root')?.remove(); return; }
    if(act==='saveEvent'){
      const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
      const date=(byId('em-date')||{}).value||ev.startISO.slice(0,10);
      const s=(byId('em-start')||{}).value||new Date(ev.startISO).toISOString().slice(11,16);
      const e2=(byId('em-end')||{}).value||new Date(ev.endISO).toISOString().slice(11,16);
      ev.title=(byId('em-title')||{}).value||ev.title;
      ev.type=(byId('em-type')||{}).value||ev.type;
      ev.location=(byId('em-loc')||{}).value||ev.location;
      ev.startISO=date+'T'+s+':00'; ev.endISO=date+'T'+e2+':00';
      const caseId=(byId('em-case')||{}).value||''; ev.caseId=caseId||null;
      if(((DATA.me||{}).role||'Admin')==='Admin'){
        const owner=(byId('em-owner')||{}).value||ev.ownerEmail;
        ev.ownerEmail=owner; ev.ownerName=((DATA.users||[]).find(u=>u.email===owner)||{}).name||owner;
      }
      if(typeof persistAll==='function') persistAll();
      if(typeof render==='function') render();
      document.getElementById('modal-root')?.remove();
      return;
    }
    if(act==='deleteEvent'){
      DATA.calendar=(DATA.calendar||[]).filter(e=>e.id!==arg);
      if(typeof persistAll==='function') persistAll();
      if(typeof render==='function') render();
      document.getElementById('modal-root')?.remove();
      return;
    }
    if(act==='createCaseEvent'){
      const caseId=arg; const me=DATA.me||{email:''};
      const title=(byId('ce-title')||{}).value||'Untitled';
      const date=(byId('ce-date')||{}).value||new Date().toISOString().slice(0,10);
      const type=(byId('ce-type')||{}).value||'Appointment';
      const start=(byId('ce-start')||{}).value||'10:00';
      const end=(byId('ce-end')||{}).value||'11:00';
      const loc=(byId('ce-loc')||{}).value||'';
      const owner = ((DATA.me||{}).role||'Admin')==='Admin' ? ((byId('ce-owner')||{}).value||me.email) : me.email;
      const ownerName = ((DATA.users||[]).find(u=>u.email===owner)||{}).name || owner;
      const sISO=date+'T'+start+':00', eISO=date+'T'+end+':00';
      DATA.calendar = DATA.calendar||[]; DATA.calendar.push({id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId});
      if(typeof persistAll==='function') persistAll();
      if(typeof render==='function') render();
      return;
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function(){ try{ ensureCaseCalendar(); }catch(e){} });
})();
