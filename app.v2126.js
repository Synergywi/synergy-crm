
(function(){ "use strict";
const BUILD="baseline-1.0.2"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM PRO "+BUILD+" • "+STAMP);

/* helpers */
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function esc(s){
  return (s||"").replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m] || m));
}

const LS_KEYS = {CAL:"synergy_calendar_v2126", ME:"synergy_me"};
function saveCal(){ try{ localStorage.setItem(LS_KEYS.CAL, JSON.stringify(DATA.calendar||[])); }catch(_){ } }
function loadCal(){
  try{ const raw=localStorage.getItem(LS_KEYS.CAL);
    if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)){ DATA.calendar=arr; return; } }
  }catch(_){}
  DATA.calendar = DATA.calendar || [];
}

/* seed minimal data */
const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"}
  ],
  cases:[
    {id:uid(), fileNumber:"INV-2024-101", title:"Safety complaint – workshop"},
    {id:uid(), fileNumber:"INV-2025-002", title:"Bullying allegation – IT"}
  ],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
  calendar:[]
};

/* calendar helpers */
const CAL={
  fmtDate(d){ const x=new Date(d); const y=x.getFullYear(); const m=String(x.getMonth()+1).padStart(2,'0'); const da=String(x.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; },
  sameDay(a,b){ return CAL.fmtDate(a)===CAL.fmtDate(b); },
  addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; },
  monthGrid(year,month){ const first=new Date(year,month,1); const start=CAL.addDays(first, -((first.getDay()+6)%7)); const weeks=[]; let cur=new Date(start); for(let w=0; w<6; w++){ const row=[]; for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1);} weeks.push(row);} return weeks; }
};

/* app shell */
const App={state:{route:"calendar",calendar:{view:"month",ym:(new Date()).toISOString().slice(0,7),selectedDate:CAL.fmtDate(new Date()),filterUsers:"ALL"}}, set(p){Object.assign(App.state,p||{}); render();}};

function Shell(content){ return `<main class="main">${content}</main><div id="boot" style="position:fixed;right:10px;bottom:8px;color:#64748b;font-size:12px">Ready (${BUILD})</div>`; }

function renderEventModal(ev, opts){
  const isNew = !!(opts && opts.isNew);
  const me = DATA.me || {email:""};
  const isAdmin = (me.role==="Admin");
  const el=document.createElement('div'); el.className='modal-mask';
  const dateISO = (ev && ev.startISO ? ev.startISO.slice(0,10) : (opts && opts.date ? opts.date : CAL.fmtDate(new Date())));
  const startT  = ev && ev.startISO ? ev.startISO.slice(11,16) : '09:00';
  const endT    = ev && ev.endISO   ? ev.endISO.slice(11,16)   : '10:00';
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="md-owner">${DATA.users.map(u=>`<option value="${u.email}" ${(ev&&ev.ownerEmail===u.email)||(!ev&&u.email===me.email)?'selected':''}>${u.name}</option>`).join("")}</select></div>` : "";
  const caseSelect = `<div><label>Attach to case</label><select class="input" id="md-case"><option value="">— None —</option>${DATA.cases.map(c=>`<option value="${c.id}" ${(ev&&ev.caseId===c.id)?'selected':''}>${c.fileNumber} — ${esc(c.title)}</option>`).join("")}</select></div>`;

  el.innerHTML=`<div class="modal">
    <header><div><strong>${isNew?'New Event':'Event'}</strong></div><button class="btn light" data-close>Close</button></header>
    <div class="body"><div class="grid">
      <div><label>Title</label><input class="input" id="md-title" value="${ev?esc(ev.title):''}"></div>
      <div><label>Date</label><input class="input" id="md-date" type="date" value="${dateISO}"></div>
      <div><label>Type</label><select class="input" id="md-type"><option ${!ev||ev.type==='Appointment'?'selected':''}>Appointment</option><option ${ev&&ev.type==='Note'?'selected':''}>Note</option></select></div>
      <div><label>Start</label><input class="input" id="md-start" type="time" value="${startT}"></div>
      <div><label>End</label><input class="input" id="md-end" type="time" value="${endT}"></div>
      <div><label>Location</label><input class="input" id="md-loc" value="${ev?esc(ev.location||''):''}"></div>
      ${caseSelect}${ownerSelect}
    </div></div>
    <footer>${!isNew?'<button class="btn" style="background:#ef4444" data-del>Delete</button>':''}<button class="btn" data-save>${isNew?'Create':'Save'}</button></footer>
  </div>`;

  function close(){ document.body.removeChild(el); }
  el.addEventListener('click', e=>{ if(e.target.matches('[data-close]')||e.target===el) close(); });

  el.querySelector('[data-save]').addEventListener('click', ()=>{
    const title=(document.getElementById('md-title')||{}).value||'Untitled';
    const date =(document.getElementById('md-date') ||{}).value;
    const type =(document.getElementById('md-type') ||{}).value||'Appointment';
    const s    =(document.getElementById('md-start')||{}).value||'09:00';
    const en   =(document.getElementById('md-end')  ||{}).value||'10:00';
    const loc  =(document.getElementById('md-loc')  ||{}).value||'';
    const caseId=(document.getElementById('md-case')||{}).value||'';
    const owner = isAdmin ? ((document.getElementById('md-owner')||{}).value || (DATA.me||{}).email) : (ev?ev.ownerEmail:(DATA.me||{}).email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+s+":00", eISO=date+"T"+en+":00";
    if(isNew){
      DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||undefined});
    }else{
      ev.title=title; ev.type=type; ev.startISO=sISO; ev.endISO=eISO; ev.location=loc; ev.ownerEmail=owner; ev.ownerName=ownerName; ev.caseId=caseId||undefined;
    }
    saveCal(); close(); App.set({});
  });
  const del=el.querySelector('[data-del]'); 
  if(del){ del.addEventListener('click', ()=>{ DATA.calendar=(DATA.calendar||[]).filter(x=>x.id!==(ev&&ev.id)); saveCal(); close(); App.set({}); }); }
  document.body.appendChild(el);
}

function Calendar(){
  const S = App.state.calendar;
  const [yy,mm] = (S.ym||CAL.fmtDate(new Date()).slice(0,7)).split("-").map(x=>parseInt(x,10));
  const monthIndex = mm-1;
  const monthName = new Date(yy,monthIndex,1).toLocaleString(undefined,{month:"long", year:"numeric"});
  const weeks = CAL.monthGrid(yy,monthIndex);

  function eventsForDay(d){
    const dayISO = CAL.fmtDate(d);
    return (DATA.calendar||[]).filter(ev=>(ev.startISO||"").slice(0,10)===dayISO).sort((a,b)=>a.startISO.localeCompare(b.startISO));
  }

  const grid = weeks.map(week=>{
    const tds = week.map(d=>{
      const inMonth = (d.getMonth()===monthIndex);
      const today = CAL.sameDay(d, new Date());
      const evs = eventsForDay(d);
      const chips = evs.map(e=>`<div class="cal-ev" title="${esc(e.title)}">
        <span class="cal-ev-dot"></span>
        <span class="cal-ev-title" data-act="openEvent" data-arg="${e.id}">${esc(e.title)}</span>
        <button class="cal-ev-del" data-act="deleteEvent" data-arg="${e.id}" title="Delete">×</button>
      </div>`).join("");
      return `<div class="cal-day ${inMonth?'':'cal-other'} ${today?'cal-today':''}" data-act="newEventOnDay" data-arg="${CAL.fmtDate(d)}">
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
        <div class="tab ${S.view==='month'?'active':''}" data-act="calView" data-arg="month">Month</div>
        <div class="tab ${S.view==='agenda'?'active':''}" data-act="calView" data-arg="agenda">Agenda</div>
      </div>
    </div>`;

  const form = (()=>{
    const selDate = S.selectedDate || CAL.fmtDate(new Date());
    return `<div class="card"><h3>Add Event</h3>
      <div class="grid" style="grid-template-columns:repeat(3,1fr)">
        <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
        <div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div>
        <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
        <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
        <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
      </div>
      <div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Add Event</button></div>
    </div>`;
  })();

  const monthGrid = `<div class="card"><div class="cal-wrap">${toolbar}
      <div class="cal-head"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div></div>
      <div class="cal-grid">${grid}</div>
    </div></div>`;

  return monthGrid + form;
}

function render(){ document.getElementById('app').innerHTML = Shell(Calendar()); }

document.addEventListener('DOMContentLoaded', ()=>{
  try{ const raw=localStorage.getItem(LS_KEYS.ME); if(raw){ const me=JSON.parse(raw); if(me&&me.email){ DATA.me=me; } } }catch(_){ }
  loadCal(); render();
});

document.addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg')||"";
  const S=App.state.calendar;
  if(act==='calToday'){ const today=new Date(); S.ym = CAL.fmtDate(today).slice(0,7); S.selectedDate=CAL.fmtDate(today); App.set({calendar:S}); return; }
  if(act==='calPrev'||act==='calNext'){ const [yy,mm]=S.ym.split('-').map(n=>parseInt(n,10)); let y=yy,m=mm-1; if(act==='calPrev')m--; else m++; if(m<0){m=11;y--;} if(m>11){m=0;y++;} S.ym=`${y}-${String(m+1).padStart(2,'0')}`; App.set({calendar:S}); return; }
  if(act==='calView'){ S.view=arg; App.set({calendar:S}); return; }
  if(act==='newEventOnDay'){ S.selectedDate=arg; App.set({calendar:S}); renderEventModal(null,{isNew:true,date:arg}); return; }
  if(act==='createEvent'){
    const title=(document.getElementById('ev-title')||{}).value||'Untitled';
    const date =(document.getElementById('ev-date') ||{}).value||CAL.fmtDate(new Date());
    const type =(document.getElementById('ev-type') ||{}).value||'Appointment';
    const start=(document.getElementById('ev-start')||{}).value||'09:00';
    const end  =(document.getElementById('ev-end')  ||{}).value||'10:00';
    const loc  =(document.getElementById('ev-loc')  ||{}).value||'';
    const sISO = date+"T"+start+":00", eISO=date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:(DATA.me||{}).email||'admin@synergy.com', ownerName:(DATA.me||{}).name||'Admin', location:loc, type});
    saveCal(); App.set({}); return;
  }
  if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); return; }
  if(act==='deleteEvent'){ DATA.calendar=(DATA.calendar||[]).filter(ev=>ev.id!==arg); saveCal(); App.set({}); return; }
  if(act==='createCaseEvent'){ const caseId=arg; const title=(document.getElementById('ce-title')||{}).value||'Untitled'; const date=(document.getElementById('ce-date')||{}).value||CAL.fmtDate(new Date()); const type=(document.getElementById('ce-type')||{}).value||'Appointment'; const start=(document.getElementById('ce-start')||{}).value||'10:00'; const end=(document.getElementById('ce-end')||{}).value||'11:00'; const loc=(document.getElementById('ce-loc')||{}).value||''; const sISO=date+"T"+start+":00", eISO=date+"T"+end+":00"; DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:(DATA.me||{}).email||'admin@synergy.com', ownerName:(DATA.me||{}).name||'Admin', location:loc, type, caseId}); saveCal(); App.set({}); return; }
});
})();