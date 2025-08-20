
(function(){ "use strict";
const LS_KEYS={ CAL:"synergy_single_calendar_v1", ME:"synergy_me_single" };
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function fmtDate(d){ const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const da=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
function saveCal(){ try{ localStorage.setItem(LS_KEYS.CAL, JSON.stringify((DATA.calendar||[]))); }catch(_){ } }
function loadCal(){ try{ const raw=localStorage.getItem(LS_KEYS.CAL); if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)) DATA.calendar=arr; } }catch(_){ } }

const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  cases:[
    {id:uid(), fileNumber:"INV-2024-101", title:"Safety complaint – workshop", organisation:"Sunrise Mining Pty Ltd"},
    {id:uid(), fileNumber:"INV-2025-002", title:"Bullying allegation – IT", organisation:"City of Melbourne"},
    {id:uid(), fileNumber:"INV-2025-003", title:"Misconduct – data exfiltration", organisation:"City of Melbourne"}
  ],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
  calendar:[]
};

const App={state:{route:"calendar", calendar:{ym:fmtDate(new Date()).slice(0,7), selectedDate:fmtDate(new Date()), view:"month"}, currentCaseId:null },
  set(p){ Object.assign(App.state,p||{}); render(); }
};

function Shell(content,active){
  document.querySelectorAll(".sidebar .nav li").forEach(li=>li.classList.toggle("active", li.getAttribute("data-arg")===active));
  document.getElementById("me-name").textContent = DATA.me.name;
  document.getElementById("me-role").textContent = DATA.me.role;
  return content;
}

function Cases(){
  const rows = DATA.cases.map(c=>`<tr>
      <td>${c.fileNumber}</td>
      <td>${c.title}</td>
      <td>${c.organisation||""}</td>
      <td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td>
    </tr>`).join("");
  const content = `
    <div class="card"><h2>Cases</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Case ID</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Title</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Organisation</th>
          <th style="text-align:right;padding:10px;border-bottom:1px solid var(--border)"></th></tr></thead>
        <tbody>${rows||'<tr><td colspan="4" style="padding:12px" class="muted">No cases.</td></tr>'}</tbody>
      </table>
    </div>`;
  return Shell(content,"cases");
}

function CasePage(id){
  const c = DATA.cases.find(x=>x.id===id)||DATA.cases[0];
  const list=(DATA.calendar||[]).filter(e=>e.caseId===c.id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
  const rows = list.map(e=>`<tr>
      <td>${new Date(e.startISO).toLocaleDateString()}</td>
      <td>${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} – ${new Date(e.endISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td>${e.title||''}</td>
      <td>${e.ownerName||e.ownerEmail||''}</td>
      <td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td>
    </tr>`).join("");
  const add=`<div class="card"><h3>Add case event</h3>
    <div class="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div><label>Title</label><input id="ce-title" class="input" placeholder="Appointment or note"></div>
      <div><label>Date</label><input id="ce-date" class="input" type="date" value="${fmtDate(new Date())}"></div>
      <div><label>Type</label><select id="ce-type" class="input"><option>Appointment</option><option>Note</option></select></div>
      <div><label>Start</label><input id="ce-start" class="input" type="time" value="09:00"></div>
      <div><label>End</label><input id="ce-end" class="input" type="time" value="10:00"></div>
      <div><label>Location</label><input id="ce-loc" class="input" placeholder="Room/Zoom/etc."></div>
    </div>
    <div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="${c.id}">Add</button></div>
  </div>`;
  const content = `
    <div class="card" style="display:flex;align-items:center;gap:8px">
      <div><h2>Case ${c.fileNumber}</h2><div class="muted">${c.title}</div></div>
      <div class="sp"></div><button class="btn light" data-act="route" data-arg="cases">Back</button>
    </div>
    <div class="card"><h3>Events</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Date</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Time</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Title</th>
          <th style="text-align:left;padding:10px;border-bottom:1px solid var(--border)">Owner</th>
          <th style="text-align:right;padding:10px;border-bottom:1px solid var(--border)"></th></tr></thead>
        <tbody>${rows||'<tr><td colspan="5" style="padding:12px" class="muted">No events yet.</td></tr>'}</tbody>
      </table>
    </div>
    ${add}`;
  return Shell(content,"cases");
}

const CAL={
  addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; },
  monthGrid(y,m){ const first=new Date(y,m,1); const start=CAL.addDays(first, -((first.getDay()+6)%7)); const weeks=[]; let cur=new Date(start);
    for(let w=0; w<6; w++){ const row=[]; for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1);} weeks.push(row);} return weeks; }
};

function renderEventModal(ev, opts){
  const isNew = !ev;
  const me = DATA.me || {email:"admin@synergy.com"};
  const isAdmin = (me.role==="Admin");

  const el=document.createElement('div'); el.className='modal-mask';
  const dateISO = ev ? ev.startISO.slice(0,10) : (opts && opts.date) || fmtDate(new Date());
  const startT  = ev ? ev.startISO.slice(11,16) : "09:00";
  const endT    = ev ? ev.endISO.slice(11,16)   : "10:00";
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="md-owner">${
      DATA.users.map(u=>`<option value="${u.email}" ${(ev&&ev.ownerEmail===u.email)||(!ev&&u.email===me.email)?'selected':''}>${u.name}</option>`).join("")
    }</select></div>` : "";
  const caseSelect = `<div><label>Attach to case</label><select class="input" id="md-case">
      <option value="">— None —</option>
      ${DATA.cases.map(c=>`<option value="${c.id}" ${(ev&&ev.caseId===c.id)?'selected':''}>${c.fileNumber} — ${c.title.replace(/</g,'&lt;')}</option>`).join("")}
    </select></div>`;

  el.innerHTML = `<div class="modal">
    <header><div><strong>${isNew?'New Event':'Event'}</strong></div><button class="btn light" data-close>Close</button></header>
    <div class="body">
      <div class="grid">
        <div><label>Title</label><input class="input" id="md-title" value="${ev?String(ev.title).replace(/</g,'&lt;'):''}"></div>
        <div><label>Date</label><input class="input" id="md-date" type="date" value="${dateISO}"></div>
        <div><label>Type</label><select class="input" id="md-type"><option ${!ev||ev.type==='Appointment'?'selected':''}>Appointment</option><option ${ev&&ev.type==='Note'?'selected':''}>Note</option></select></div>
        <div><label>Start</label><input class="input" id="md-start" type="time" value="${startT}"></div>
        <div><label>End</label><input class="input" id="md-end" type="time" value="${endT}"></div>
        <div><label>Location</label><input class="input" id="md-loc" value="${ev?String(ev.location||'').replace(/</g,'&lt;'):''}"></div>
        ${caseSelect}${ownerSelect}
      </div>
    </div>
    <footer>${!isNew?'<button class="btn danger" data-del>Delete</button>':''}<button class="btn" data-save>${isNew?'Create':'Save'}</button></footer>
  </div>`;

  function close(){ document.body.removeChild(el); }
  el.addEventListener('click', e=>{ if(e.target.matches('[data-close]') || e.target===el) close(); });
  el.querySelector('[data-save]').addEventListener('click', ()=>{
    const title=document.getElementById('md-title').value||'Untitled';
    const date =document.getElementById('md-date').value;
    const type =document.getElementById('md-type').value||'Appointment';
    const s    =document.getElementById('md-start').value||'09:00';
    const en   =document.getElementById('md-end').value||'10:00';
    const loc  =document.getElementById('md-loc').value||'';
    const caseId=(document.getElementById('md-case').value)||'';
    const owner = isAdmin ? (document.getElementById('md-owner').value || me.email) : (ev?ev.ownerEmail:me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+s+":00", eISO=date+"T"+en+":00";
    if(isNew){
      DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||undefined});
    }else{
      ev.title=title; ev.type=type; ev.startISO=sISO; ev.endISO=eISO; ev.location=loc; ev.ownerEmail=owner; ev.ownerName=ownerName; ev.caseId=caseId||undefined;
    }
    saveCal(); close(); App.set({}); 
  });
  const del=el.querySelector('[data-del]'); if(del){ del.addEventListener('click', ()=>{ DATA.calendar=(DATA.calendar||[]).filter(x=>x.id!==ev.id); saveCal(); close(); App.set({}); }); }
  document.body.appendChild(el);
}

function Calendar(){
  const S = App.state.calendar;
  const [yy,mm] = S.ym.split("-").map(n=>parseInt(n,10));
  const monthIndex = mm-1;
  const monthName = new Date(yy,monthIndex,1).toLocaleString(undefined,{month:"long", year:"numeric"});
  const weeks = (function(){ const first=new Date(yy,monthIndex,1); const start=new Date(first); start.setDate(first.getDate()-((first.getDay()+6)%7)); const arr=[]; let cur=new Date(start); for(let w=0;w<6;w++){ const row=[]; for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1);} arr.push(row);} return arr; })();
  function eventsForDay(d){ const iso=fmtDate(d); return (DATA.calendar||[]).filter(e=>(e.startISO||"").slice(0,10)===iso).sort((a,b)=>a.startISO.localeCompare(b.startISO)); }

  const grid = weeks.map(week=>{
    const tds = week.map(d=>{
      const inMonth = (d.getMonth()===monthIndex);
      const today = fmtDate(d)===fmtDate(new Date());
      const evs = eventsForDay(d);
      const chips = evs.map(e=>`<div class="cal-ev" title="${e.title}">
          <span class="cal-ev-dot"></span>
          <span class="cal-ev-title" data-act="openEvent" data-arg="${e.id}">${e.title}</span>
          <button class="cal-ev-del" data-act="deleteEvent" data-arg="${e.id}" title="Delete">×</button>
        </div>`).join("");
      return `<div class="cal-day ${inMonth?'':'cal-other'} ${today?'cal-today':''}" data-act="newEventOnDay" data-arg="${fmtDate(d)}">
          <div class="cal-date">${d.getDate()}</div>
          <div class="cal-evs">${chips||""}</div>
        </div>`;
    }).join("");
    return `<div class="cal-week">${tds}</div>`;
  }).join("");

  const toolbar = `<div class="cal-toolbar">
      <div class="left">
        <button class="btn light" data-act="calPrev">◀</button>
        <button class="btn light" data-act="calToday">Today</button>
        <button class="btn light" data-act="calNext">▶</button>
        <div class="cal-month">${monthName}</div>
      </div>
      <div class="right">
        <div class="btn ghost" data-act="route" data-arg="cases">Cases</div>
      </div>
    </div>`;

  const quick = `<div class="card"><h3>Add Event</h3>
    <div class="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
      <div><label>Date</label><input class="input" id="ev-date" type="date" value="${S.selectedDate||fmtDate(new Date())}"></div>
      <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
      <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
      <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
      <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
    </div>
    <div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Add Event</button></div>
  </div>`;

  const content = `<div class="card"><div class="cal-wrap">
      ${toolbar}
      <div class="cal-head"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div></div>
      <div class="cal-grid">${grid}</div>
    </div></div>${quick}`;

  return Shell(content,"calendar");
}

function seedIfEmpty(){
  if(DATA.calendar && DATA.calendar.length) return;
  const t=new Date(); const y=t.getFullYear(); const m=t.getMonth();
  const s=new Date(y,m,3,9,0,0).toISOString(); const e=new Date(y,m,3,10,0,0).toISOString();
  DATA.calendar.push({id:uid(), title:"Case intake – Sunrise", description:"", startISO:s, endISO:e, ownerEmail:DATA.users[1].email, ownerName:DATA.users[1].name, location:"Room 3", type:"Appointment", caseId:DATA.cases[0].id});
  saveCal();
}

function render(){
  const r=App.state.route;
  const el=document.getElementById('app');
  el.innerHTML = (r==='calendar' ? Calendar() : (r==='cases' ? Cases() : CasePage(App.state.currentCaseId)));
}

document.addEventListener('DOMContentLoaded', ()=>{
  try{ const raw=localStorage.getItem(LS_KEYS.ME); if(raw){ const me=JSON.parse(raw); if(me&&me.email){ DATA.me=me; } } }catch(_){ }
  loadCal(); seedIfEmpty(); render();
});

document.addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const act=t.getAttribute('data-act'); const arg=t.getAttribute('data-arg')||"";
  const S=App.state.calendar;
  if(act==='route'){ if(arg==='case'){ App.set({route:'case'}); } else { App.set({route:arg}); } return; }
  if(act==='openCase'){ App.set({currentCaseId:arg,route:'case'}); return; }
  if(act==='calToday'){ S.ym=fmtDate(new Date()).slice(0,7); S.selectedDate=fmtDate(new Date()); App.set({calendar:S}); return; }
  if(act==='calPrev'||act==='calNext'){ const [yy,mm]=S.ym.split('-').map(n=>parseInt(n,10)); let y=yy,m=mm-1; if(act==='calPrev')m--; else m++; if(m<0){m=11;y--;} if(m>11){m=0;y++;} S.ym=`${y}-${String(m+1).padStart(2,'0')}`; App.set({calendar:S}); return; }
  if(act==='newEventOnDay'){ S.selectedDate=arg; App.set({calendar:S}); renderEventModal(null,{date:arg}); return; }
  if(act==='createEvent'){ const title=(document.getElementById('ev-title')||{}).value||'Untitled'; const date=(document.getElementById('ev-date')||{}).value||fmtDate(new Date()); const type=(document.getElementById('ev-type')||{}).value||'Appointment'; const start=(document.getElementById('ev-start')||{}).value||'09:00'; const end=(document.getElementById('ev-end')||{}).value||'10:00'; const loc=(document.getElementById('ev-loc')||{}).value||''; const sISO=date+"T"+start+":00"; const eISO=date+"T"+end+":00"; DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:(DATA.me||{}).email||'admin@synergy.com', ownerName:(DATA.me||{}).name||'Admin', location:loc, type}); saveCal(); App.set({}); return; }
  if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); return; }
  if(act==='deleteEvent'){ DATA.calendar=(DATA.calendar||[]).filter(x=>x.id!==arg); saveCal(); App.set({}); return; }
  if(act==='createCaseEvent'){ const caseId=arg; const title=(document.getElementById('ce-title')||{}).value||'Untitled'; const date=(document.getElementById('ce-date')||{}).value||fmtDate(new Date()); const type=(document.getElementById('ce-type')||{}).value||'Appointment'; const start=(document.getElementById('ce-start')||{}).value||'10:00'; const end=(document.getElementById('ce-end')||{}).value||'11:00'; const loc=(document.getElementById('ce-loc')||{}).value||''; const sISO=date+"T"+start+":00"; const eISO=date+"T"+end+":00"; DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:(DATA.me||{}).email||'admin@synergy.com', ownerName:(DATA.me||{}).name||'Admin', location:loc, type, caseId}); saveCal(); App.set({}); return; }
});

document.querySelectorAll(".sidebar .nav li").forEach(li=>{
  li.addEventListener("click", ()=>{ const a=li.getAttribute("data-arg"); App.set({route:a}); });
});
})();