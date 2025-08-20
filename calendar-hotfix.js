
/*! Synergy CRM Calendar Hotfix (standalone) v1.1 */
(function(){
  if(window.__CAL_HOTFIX__ && window.__CAL_HOTFIX__ >= "v1.1") return;
  window.__CAL_HOTFIX__ = "v1.1";
  console.log("[Calendar] Hotfix", window.__CAL_HOTFIX__, "loaded");

  const LS_KEY = 'synergy_calendar_v1';
  function saveCal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify((window.DATA||{}).calendar||[])); }catch(_){ } }
  function fmtDateLocal(d){ const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const da=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }

  function renderEventModal(ev, opts){
    const DATA = window.DATA||{};
    const me = DATA.me || {email:"admin@synergy.com", name:"Admin", role:"Admin"};
    const isAdmin = (me.role==="Admin");
    const el=document.createElement('div');
    el.className='modal-mask';
    const dateISO = (ev && ev.startISO ? ev.startISO.slice(0,10) : (opts && opts.date ? opts.date : fmtDateLocal(new Date())));
    const startT  = ev && ev.startISO ? ev.startISO.slice(11,16) : '09:00';
    const endT    = ev && ev.endISO   ? ev.endISO.slice(11,16)   : '10:00';
    const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="md-owner">${
      (DATA.users||[]).map(u=>`<option value="${u.email}" ${(ev&&ev.ownerEmail===u.email)||(!ev&&u.email===me.email)?'selected':''}>${u.name}</option>`).join("")
    }</select></div>` : "";
    const caseSelect = `<div><label>Attach to case</label><select class="input" id="md-case"><option value="">— None —</option>${
      (DATA.cases||[]).map(c=>`<option value="${c.id}" ${(ev&&ev.caseId===c.id)?'selected':''}>${c.fileNumber} — ${(c.title||'').replace(/</g,'&lt;')}</option>`).join("")
    }</select></div>`;
    el.innerHTML=`<div class="modal">
      <header><div><strong>${ev?'Event':'New Event'}</strong></div><button class="btn light" data-close>Close</button></header>
      <div class="body">
        <div class="grid" style="grid-template-columns:1fr 1fr">
          <div><label>Title</label><input class="input" id="md-title" value="${ev?String(ev.title).replace(/</g,'&lt;'):''}"></div>
          <div><label>Date</label><input class="input" id="md-date" type="date" value="${dateISO}"></div>
          <div><label>Type</label><select class="input" id="md-type"><option ${( !ev || ev.type==='Appointment') ? 'selected':''}>Appointment</option><option ${(ev&&ev.type==='Note')?'selected':''}>Note</option></select></div>
          <div><label>Start</label><input class="input" id="md-start" type="time" value="${startT}"></div>
          <div><label>End</label><input class="input" id="md-end" type="time" value="${endT}"></div>
          <div><label>Location</label><input class="input" id="md-loc" value="${ev?String(ev.location||'').replace(/</g,'&lt;'):''}"></div>
          ${caseSelect}${ownerSelect}
        </div>
      </div>
      <footer>${ev?'<button class="btn" style="background:#ef4444" data-del>Delete</button>':''}<button class="btn" data-save>${ev?'Save':'Create'}</button></footer>
    </div>`;
    function close(){ document.body.removeChild(el); }
    el.addEventListener('click', e=>{ if(e.target.matches('[data-close]')||e.target===el) close(); });
    el.querySelector('[data-save]').addEventListener('click', ()=>{
      const title=(document.getElementById('md-title')||{}).value||'Untitled';
      const date =(document.getElementById('md-date') ||{}).value||fmtDateLocal(new Date());
      const type =(document.getElementById('md-type') ||{}).value||'Appointment';
      const s    =(document.getElementById('md-start')||{}).value||'09:00';
      const en   =(document.getElementById('md-end')  ||{}).value||'10:00';
      const loc  =(document.getElementById('md-loc')  ||{}).value||'';
      const caseId=(document.getElementById('md-case')||{}).value||'';
      const owner = isAdmin ? ((document.getElementById('md-owner')||{}).value || me.email) : (ev?ev.ownerEmail:me.email);
      const ownerName = ((DATA.users||[]).find(u=>u.email===owner)||{}).name || owner;
      const sISO = date+"T"+s+":00", eISO=date+"T"+en+":00";
      if(!DATA.calendar) DATA.calendar=[];
      if(ev){
        ev.title=title; ev.type=type; ev.location=loc; ev.ownerEmail=owner; ev.ownerName=ownerName; ev.caseId=caseId||undefined; ev.startISO=sISO; ev.endISO=eISO;
      }else{
        DATA.calendar.push({id:"id-"+Math.random().toString(36).slice(2,10), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||undefined});
      }
      try{ saveCal(); if(window.App&&App.set) App.set({}); }catch(_){}
      close();
    });
    const del=el.querySelector('[data-del]');
    if(del){ del.addEventListener('click', ()=>{ const DATA=window.DATA||{}; DATA.calendar=(DATA.calendar||[]).filter(x=>x!==ev && x.id!==ev.id); try{ saveCal(); if(window.App&&App.set) App.set({}); }catch(_){ } close(); }); }
    document.body.appendChild(el);
  }
  window.renderEventModal = window.renderEventModal || renderEventModal;

  // BROAD day click hook
  document.addEventListener('click', function(e){
    const t=e.target.closest('[data-act="pickDay"], [data-act="newEventOnDay"], .cal-day, [data-day], [data-date]'); 
    if(!t) return;
    let d = t.getAttribute('data-arg') || t.getAttribute('data-day') || t.getAttribute('data-date');
    if(!d){
      const candidate = document.querySelector('#ev-date') || document.querySelector('input[type="date"]#ev-date');
      if(candidate && candidate.value) d = candidate.value;
    }
    if(!d) d = fmtDateLocal(new Date());
    renderEventModal(null,{isNew:true,date:d});
  }, true);

  // Case-add handler
  document.addEventListener('click', function(e){
    const t=e.target.closest('[data-act="createCaseEvent"]'); if(!t) return;
    const caseId = t.getAttribute('data-arg') || '';
    const title=(document.getElementById('ce-title')||{}).value||'Untitled';
    const date =(document.getElementById('ce-date') ||{}).value||fmtDateLocal(new Date());
    const type =(document.getElementById('ce-type') ||{}).value||'Appointment';
    const start=(document.getElementById('ce-start')||{}).value||'10:00';
    const end  =(document.getElementById('ce-end')  ||{}).value||'11:00';
    const loc  =(document.getElementById('ce-loc')  ||{}).value||'';
    const me=((window.DATA||{}).me)||{email:"admin@synergy.com",name:"Admin"};
    const sISO=date+"T"+start+":00", eISO=date+"T"+end+":00";
    if(!window.DATA) window.DATA={};
    if(!window.DATA.calendar) window.DATA.calendar=[];
    window.DATA.calendar.push({id:"id-"+Math.random().toString(36).slice(2,10), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:me.email, ownerName:me.name, location:loc, type, caseId});
    try{ saveCal(); if(window.App&&App.set) App.set({}); }catch(_){}
  }, true);

  // Manual test helper
  window.openNewEventNow = function(date){ renderEventModal(null,{isNew:true,date: date || fmtDateLocal(new Date())}); };
})();
