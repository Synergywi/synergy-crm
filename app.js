
(function(){ "use strict";
const BUILD="calendar-1.1.0"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM PRO "+BUILD+" • "+STAMP);

/* ========== utils ========== */
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function esc(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;","—":"—",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]||m)); }
function $(sel,root){ return (root||document).querySelector(sel); }
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

/* ========== simple persistence (localStorage) ========== */
const STORE_KEYS = {
  me: "synergy_me",
  filters: "synergy_filters_cases_v2104",
  calendar: "synergy_calendar_v1",
  data: "synergy_data_v1" // (for case links only; minimal: cases/companies/contacts)
};
function saveCalendar(){
  try{ localStorage.setItem(STORE_KEYS.calendar, JSON.stringify(DATA.calendar||[])); }catch(_){}
}
function loadCalendar(){
  try{
    const raw = localStorage.getItem(STORE_KEYS.calendar);
    if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)) return arr; }
  }catch(_){}
  return null;
}

/* ========== seed data ========== */
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",
    investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),
    relatedContactIds:[],notes:[],tasks:[],folders:{General:[]}};
  Object.assign(b,p||{}); return b;
}
const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Private",state:"QLD",city:"Brisbane",postcode:"4000",abn:"12 345 678 901",acn:"345 678 901",website:"www.sunrisemining.com",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Public",state:"VIC",city:"Melbourne",postcode:"3000",abn:"98 765 432 100",acn:"—",website:"www.melbourne.vic.gov.au",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Healthcare",type:"Public",state:"QLD",city:"Brisbane",postcode:"4006",abn:"76 543 210 999",acn:"—",website:"www.health.qld.gov.au",folders:{General:[]}},
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",role:"Investigator",phone:"07 345 5678",notes:"Investigator for Sunrise."},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",role:"Investigator",phone:"07 987 1123",notes:"Senior investigator."},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",role:"Reviewer",phone:"03 675 9922",notes:"Reviewer for CoM cases."}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  resources:{
    links:[{title:"Investigation Framework", url:"#"}, {title:"HR Policy", url:"#"}],
    faqs:[{q:"How to open a case?", a:"Go to Cases → New."},{q:"Where are templates?", a:"Documents tab."}],
    guides:["Interview best practices.pdf","Case lifecycle.png"]
  },
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
  calendar:[]
};
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

/* ========== App shell (unchanged pieces trimmed for brevity) ========== */
const App={state:{route:"dashboard",currentCaseId:null,currentCompanyId:null,currentContactId:null,
  tabs:{dashboard:"overview",cases:"list",contacts:"list",companies:"list",company:"summary",documents:"templates",resources:"links",admin:"users",case:"details",contact:"profile"},
  settings:{emailAlerts:true, darkMode:false},
  calendar:{ view:"month", ym:(new Date()).toISOString().slice(0,7), selectedDate:(new Date()).toISOString().slice(0,10), filterUsers:"ALL" }
}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

/* ========== Minimal UI (dashboard + sidebar + tabs) ========== */
function Topbar(){ const me=(DATA.me||{}); const back=(me.role!=="Admin"?'<button class="btn light" data-act="clearImpersonation">Switch to Admin</button>':""); return `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><div class="muted" style="margin-right:10px">You: ${me.name||"Unknown"} (${me.role||"User"})</div>${back}<span class="badge">Soft Stable ${BUILD}</span></div>`; }
function Sidebar(active){
  const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">${items.map(([k,v])=>`<li ${active===k?'class="active"':''} data-act="route" data-arg="${k}">${v}</li>`).join("")}</ul></aside>`;
}
function Shell(content,active){ return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`; }
function Tabs(scope, items){
  const cur=App.state.tabs[scope]||items[0][0];
  const btn=(k,l)=>`<div class="tab ${cur===k?'active':''}" data-act="tab" data-scope="${scope}" data-arg="${k}">${l}</div>`;
  return `<div class="tabs">${items.map(i=>btn(i[0],i[1])).join("")}</div>`;
}

/* ========== Calendar engine ========== */
const CAL={
  fmtDate(d){ const x=new Date(d); return x.toISOString().slice(0,10); },
  sameDay(a,b){ return CAL.fmtDate(a)===CAL.fmtDate(b); },
  addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; },
  monthGrid(year,month){ const first=new Date(year,month,1); const start=CAL.addDays(first, -((first.getDay()+6)%7)); const weeks=[]; let cur=new Date(start); for(let w=0; w<6; w++){ const row=[]; for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(row);} return weeks; }
};

/* ========== Seed & load calendar ========== */
(function initMe(){ try{ const raw=localStorage.getItem(STORE_KEYS.me); if(raw){ const me=JSON.parse(raw); if(me&&me.email){ DATA.me=me; } } }catch(_){ }})();
(function initCalendar(){
  const saved=loadCalendar();
  if(saved){ DATA.calendar=saved; return; }
  const today=new Date(); const y=today.getFullYear(), m=today.getMonth(); const u = DATA.users;
  function ev(day, startH, endH, who, title, loc, type, caseId){
    const s=new Date(y,m,day,startH,0,0).toISOString();
    const e=new Date(y,m,day,endH,0,0).toISOString();
    return { id:uid(), title, description:"", startISO:s, endISO:e, ownerEmail:who.email, ownerName:who.name, location:loc||"", type:type||"Appointment", caseId:caseId||null };
  }
  DATA.calendar=[
    ev(3,  9,10, u[1], "Case intake - Sunrise", "Room 3", "Appointment"),
    ev(5, 14,15, u[2], "Interview planning", "Teams", "Note"),
    ev(12,11,12, u[3], "Evidence review", "Room 2", "Appointment"),
    ev(18,10,11, u[1], "Client check-in", "Phone", "Appointment"),
    ev(21,13,14, u[2], "Draft report sync", "Zoom", "Appointment"),
    ev(26, 9,10, u[0], "Admin all-hands", "Boardroom", "Appointment")
  ];
  saveCalendar();
})();

/* ========== Pages (Cases trimmed; we only add Case Calendar tab) ========== */
function Dashboard(){
  return Shell(`<div class="card"><h3>Welcome</h3><div class="muted">${STAMP}</div></div>`, 'dashboard');
}

function Cases(){
  const tab=App.state.tabs.cases||"list";
  const rows=(DATA.cases||[]).map(cc=>`<tr><td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td></tr>`).join("");
  const listView = `<div class="section"><header><h3 class="section-title">Cases</h3></header><table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  return Shell(Tabs('cases',[['list','List']]) + listView, 'cases');
}

function CasePage(id){
  const cs=findCase(id); if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const tab=App.state.tabs.case||'details';

  const details = `<div class="card"><h3 class="section-title">Details</h3>
    <div class="grid cols-2">
      <div><label>Case ID</label><input class="input" id="c-id" value="${cs.fileNumber||''}"></div>
      <div><label>Title</label><input class="input" id="c-title" value="${cs.title||''}"></div>
    </div>
    <div class="right" style="margin-top:8px"><button class="btn light" data-act="route" data-arg="cases">Back</button></div>
  </div>`;

  const caseCal=(()=>{
    const list=(DATA.calendar||[]).filter(e=>e.caseId===id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows=list.map(e=>`<tr><td>${new Date(e.startISO).toLocaleDateString()}</td>
      <td>${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${new Date(e.endISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td>${esc(e.title)}</td><td>${esc(e.location||'')}</td><td>${e.ownerName||e.ownerEmail}</td>
      <td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button> <button class="btn light" data-act="deleteEvent" data-arg="${e.id}">Delete</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;
    const me=DATA.me||{email:""};
    const ownerSelect = (me.role==="Admin") ? `<div><label>Owner</label><select class="input" id="ce-owner">${(DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===(me.email||'')?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
    return `<div class="card"><h3 class="section-title">Case Calendar</h3>
      <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="card"><h3 class="section-title">Add case event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="ce-title"></div>
          <div><label>Date</label><input class="input" id="ce-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
          <div><label>Type</label><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select></div>
          <div><label>Start</label><input class="input" id="ce-start" type="time" value="10:00"></div>
          <div><label>End</label><input class="input" id="ce-end" type="time" value="11:00"></div>
          <div><label>Location</label><input class="input" id="ce-loc"></div>
          ${ownerSelect}
        </div>
        <div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="${id}">Add</button></div>
      </div>`;
  })();

  const tabs = Tabs('case',[['details','Details'],['calendar','Calendar']]);
  const body = `<div class="tabpanel ${tab==='details'?'active':''}">${details}</div><div class="tabpanel ${tab==='calendar'?'active':''}">${caseCal}</div>`;
  return Shell(`<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case ${cs.fileNumber}</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>` + tabs + body,'cases');
}

/* ========== Calendar Page ========== */
function Calendar(){
  const me = DATA.me || {email:"",role:""};
  const isAdmin = (me.role==="Admin");
  const calState = App.state.calendar;
  const ym = calState.ym|| (new Date()).toISOString().slice(0,7);
  const [yy,mm] = ym.split("-").map(x=>parseInt(x,10));
  const monthIndex = mm-1;
  const monthName = new Date(yy,monthIndex,1).toLocaleString(undefined,{month:"long", year:"numeric"});
  const weeks = CAL.monthGrid(yy, monthIndex);

  function eventsForDay(d){
    const dayISO = CAL.fmtDate(d);
    return (DATA.calendar||[]).filter(ev=>{
      if(!isAdmin && ev.ownerEmail!==me.email) return false;
      if(isAdmin && calState.filterUsers!=="ALL" && ev.ownerEmail!==calState.filterUsers) return false;
      return CAL.fmtDate(ev.startISO)===dayISO;
    }).sort((a,b)=>a.startISO.localeCompare(b.startISO));
  }

  const grid = weeks.map(week=>{
    const tds = week.map(d=>{
      const inMonth = (d.getMonth()===monthIndex);
      const today = CAL.sameDay(d, new Date());
      const evs = eventsForDay(d);
      const chips = evs.map(e=>`<div class="cal-ev" title="${e.title} (${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})">
        <span class="cal-ev-dot"></span>
        <span class="cal-ev-title" data-act="openEvent" data-arg="${e.id}">${e.title}</span>
        <button class="cal-ev-del" data-act="deleteEvent" data-arg="${e.id}" title="Delete">×</button>
      </div>`).join("");
      return `<div class="cal-day ${inMonth?'':'cal-other'} ${today?'cal-today':''}" data-act="pickDay" data-arg="${d.toISOString().slice(0,10)}">
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
        ${isAdmin ? `<select class="input" id="cal-owner-filter">
          <option value="ALL"${calState.filterUsers==="ALL"?" selected":""}>All users</option>
          ${DATA.users.map(u=>`<option value="${u.email}"${calState.filterUsers===u.email?" selected":""}>${u.name}</option>`).join("")}
        </select>`: ""}
        <div class="cal-viewtabs">
          <div class="tab ${calState.view==='month'?'active':''}" data-act="calView" data-arg="month">Month</div>
          <div class="tab ${calState.view==='agenda'?'active':''}" data-act="calView" data-arg="agenda">Agenda</div>
        </div>
      </div>
    </div>`;

  const agenda = (()=>{
    const list = (DATA.calendar||[]).filter(ev=>{
      if(!isAdmin && ev.ownerEmail!==me.email) return false;
      if(isAdmin && calState.filterUsers!=="ALL" && ev.ownerEmail!==calState.filterUsers) return false;
      const d = new Date(ev.startISO);
      return (d.getMonth()===monthIndex && d.getFullYear()===yy);
    }).sort((a,b)=>a.startISO.localeCompare(b.startISO));

    const rows = list.map(e=>{
      const d=new Date(e.startISO), end=new Date(e.endISO);
      const caseLabel = e.caseId ? (findCase(e.caseId)||{}).fileNumber||"—" : "—";
      return `<tr>
        <td>${d.toLocaleDateString()}</td>
        <td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
        <td>${e.title}</td>
        <td>${e.location||''}</td>
        <td>${e.ownerName||e.ownerEmail||''}</td>
        <td>${caseLabel}</td>
        <td class="right">
          <button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button>
          <button class="btn light" data-act="deleteEvent" data-arg="${e.id}">Delete</button>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="7" class="muted">No events this month.</td></tr>`;
    return `<div class="card"><h3 class="section-title">Agenda — ${monthName}</h3>
      <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th>Case</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  })();

  const form = (()=>{
    const selDate = calState.selectedDate || new Date().toISOString().slice(0,10);
    const isAdminOwner = (me.role === "Admin") ? `<div><label>Owner</label><select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===me.email?'selected':''}>${u.name}</option>`).join("")}</select></div>` : "";
    const caseSelect = `<div><label>Link to case (optional)</label><select class="input" id="ev-case"><option value="">— None —</option>${(DATA.cases||[]).map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${esc(cs.title)}</option>`).join("")}</select></div>`;
    return `<div id="calendar-add-form" class="card"><h3 class="section-title">Add ${me.role==="Admin"?"Event (any user)":"My Event"}</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
        <div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div>
        <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
        <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
        <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
        ${isAdminOwner}
        ${caseSelect}
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn" data-act="createEvent">Add Event</button>
      </div>
    </div>`;
  })();

  const monthGrid = `<div class="card"><div class="cal-wrap">${toolbar}
      <div class="cal-head">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>
      <div class="cal-grid">${grid}</div>
    </div></div>`;

  const content = (calState.view==='agenda') ? (toolbar + agenda) : (monthGrid + form);
  return Shell(content, 'calendar');
}

/* ========== Event modal (open/edit/save/delete) ========== */
function renderEventModal(ev){
  const me=DATA.me||{email:"",role:""};
  const isAdmin = me.role==="Admin";
  const d = new Date(ev.startISO);
  const ed = new Date(ev.endISO);
  const ownerSelect = isAdmin ? `<select class="input" id="em-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===ev.ownerEmail?'selected':''}>${u.name}</option>`).join("")}</select>` : `<div class="muted">${ev.ownerName||ev.ownerEmail}</div>`;
  const casesOpt = `<select class="input" id="em-case"><option value="">— None —</option>${(DATA.cases||[]).map(cs=>`<option value="${cs.id}" ${ev.caseId===cs.id?'selected':''}>${cs.fileNumber} — ${esc(cs.title)}</option>`).join("")}</select>`;
  const html=`<div id="ev-modal" class="modal-backdrop" style="position:fixed;inset:0;background:rgba(2,6,23,.45);z-index:999;display:flex;align-items:center;justify-content:center">
    <div class="card" style="width:720px;max-width:95vw">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><h3 class="section-title" style="margin:0">Edit event</h3><div class="sp"></div><button class="btn light" data-act="evClose">Close</button></div>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
        <div><label>Date</label><input class="input" id="em-date" type="date" value="${d.toISOString().slice(0,10)}"></div>
        <div><label>Type</label><select class="input" id="em-type"><option ${ev.type==='Appointment'?'selected':''}>Appointment</option><option ${ev.type==='Note'?'selected':''}>Note</option></select></div>
        <div><label>Start</label><input class="input" id="em-start" type="time" value="${d.toTimeString().slice(0,5)}"></div>
        <div><label>End</label><input class="input" id="em-end" type="time" value="${ed.toTimeString().slice(0,5)}"></div>
        <div><label>Location</label><input class="input" id="em-loc" value="${esc(ev.location||'')}"></div>
        <div><label>Owner</label>${ownerSelect}</div>
        <div><label>Link to case (optional)</label>${casesOpt}</div>
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn danger" data-act="evDelete" data-arg="${ev.id}">Delete</button>
        <button class="btn" data-act="evSave" data-arg="${ev.id}">Save</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ========== Quick add modal for date click ========== */
function renderQuickAdd(dateISO){
  const me=DATA.me||{email:"",role:""};
  const isAdmin = me.role==="Admin";
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="qa-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===me.email?'selected':''}>${u.name}</option>`).join("")}</select></div>` : "";
  const casesOpt = `<div><label>Link to case (optional)</label><select class="input" id="qa-case"><option value="">— None —</option>${(DATA.cases||[]).map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${esc(cs.title)}</option>`).join("")}</select></div>`;
  const html=`<div id="qa-modal" class="modal-backdrop" style="position:fixed;inset:0;background:rgba(2,6,23,.45);z-index:999;display:flex;align-items:center;justify-content:center">
    <div class="card" style="width:680px;max-width:95vw">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><h3 class="section-title" style="margin:0">Add event — ${dateISO}</h3><div class="sp"></div><button class="btn light" data-act="evQuickClose">Close</button></div>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="qa-title" placeholder="Appointment or note"></div>
        <div><label>Date</label><input class="input" id="qa-date" type="date" value="${dateISO}"></div>
        <div><label>Type</label><select class="input" id="qa-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="qa-start" type="time" value="09:00"></div>
        <div><label>End</label><input class="input" id="qa-end" type="time" value="10:00"></div>
        <div><label>Location</label><input class="input" id="qa-loc" placeholder="Room/Zoom/etc."></div>
        ${ownerSelect}
        ${casesOpt}
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn" data-act="evQuickSave">Add</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* ========== Router & render ========== */
function render(){
  const r=App.state.route, el=document.getElementById('app');
  document.getElementById('boot').textContent='Rendering '+r+'…';
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='contacts') el.innerHTML="<div class='card'>Contacts (omitted)</div>";
  else if(r==='companies') el.innerHTML="<div class='card'>Companies (omitted)</div>";
  else if(r==='documents') el.innerHTML="<div class='card'>Documents (omitted)</div>";
  else if(r==='resources') el.innerHTML="<div class='card'>Resources (omitted)</div>";
  else if(r==='admin') el.innerHTML="<div class='card'>Admin (omitted)</div>";
  else if(r==='calendar') el.innerHTML=Calendar();
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}
document.addEventListener('DOMContentLoaded', ()=>{ App.set({route:'calendar'}); });

/* ========== Actions ========== */
document.addEventListener('click', e=>{
  let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg')||"";
  const S=App.state.calendar||{view:"month"};

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({currentCaseId:arg,route:'case'}); return; }
  if(act==='tab'){ const scope=t.getAttribute('data-scope'); const tabs=Object.assign({},App.state.tabs); tabs[scope]=arg; App.set({tabs}); return; }

  // Calendar nav
  if(act==='calView'){ S.view=arg; App.set({calendar:S}); return; }
  if(act==='calToday'){ const today=new Date(); const ym=today.toISOString().slice(0,7); S.ym=ym; S.selectedDate=today.toISOString().slice(0,10); App.set({calendar:S}); return; }
  if(act==='calPrev' || act==='calNext'){
    const [yy,mm]= (S.ym||new Date().toISOString().slice(0,7)).split('-').map(x=>parseInt(x,10));
    let y=yy, m=mm-1;
    if(act==='calPrev'){ m--; } else { m++; }
    if(m<0){m=11;y--;} if(m>11){m=0;y++;}
    S.ym= `${y}-${String(m+1).padStart(2,'0')}`;
    App.set({calendar:S}); return;
  }
  if(act==='pickDay'){ S.selectedDate=arg; App.set({calendar:S}); renderQuickAdd(arg); return; }

  // Create from calendar form
  if(act==='createEvent'){
    const me=DATA.me||{email:""};
    const title=($("#ev-title")||{}).value||'Untitled';
    const date=($("#ev-date")||{}).value||new Date().toISOString().slice(0,10);
    const type=($("#ev-type")||{}).value||'Appointment';
    const start=($("#ev-start")||{}).value||'09:00';
    const end=($("#ev-end")||{}).value||'10:00';
    const loc=($("#ev-loc")||{}).value||'';
    const owner = (DATA.me.role==="Admin" ? ($("#ev-owner")||{}).value||me.email : me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const caseId = ($("#ev-case")||{}).value || null;
    const sISO = date+"T"+start+":00";
    const eISO = date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId});
    saveCalendar();
    alert('Event added'); App.set({}); return;
  }

  // Quick add modal
  if(act==='evQuickClose'){ const m=$("#qa-modal"); if(m) m.remove(); return; }
  if(act==='evQuickSave'){
    const me=DATA.me||{email:""};
    const title=($("#qa-title")||{}).value||'Untitled';
    const date=($("#qa-date")||{}).value||new Date().toISOString().slice(0,10);
    const type=($("#qa-type")||{}).value||'Appointment';
    const start=($("#qa-start")||{}).value||'09:00';
    const end=($("#qa-end")||{}).value||'10:00';
    const loc=($("#qa-loc")||{}).value||'';
    const owner = (DATA.me.role==="Admin" ? ($("#qa-owner")||{}).value||me.email : me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const caseId = ($("#qa-case")||{}).value || null;
    const sISO = date+"T"+start+":00";
    const eISO = date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId});
    saveCalendar();
    const m=$("#qa-modal"); if(m) m.remove();
    App.set({}); return;
  }

  // Case page: create event tied to case
  if(act==='createCaseEvent'){
    const caseId=arg;
    const me=DATA.me||{email:""};
    const title=($("#ce-title")||{}).value||'Untitled';
    const date=($("#ce-date")||{}).value||new Date().toISOString().slice(0,10);
    const type=($("#ce-type")||{}).value||'Appointment';
    const start=($("#ce-start")||{}).value||'10:00';
    const end=($("#ce-end")||{}).value||'11:00';
    const loc=($("#ce-loc")||{}).value||'';
    const owner = (DATA.me.role==="Admin" ? ($("#ce-owner")||{}).value||me.email : me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+start+":00";
    const eISO = date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId});
    saveCalendar();
    alert('Event added to case');
    App.set({}); return;
  }

  // Open event modal
  if(act==='openEvent'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg);
    if(!ev) return;
    renderEventModal(ev); return;
  }

  // Modal actions
  if(act==='evClose'){ const m=$("#ev-modal"); if(m) m.remove(); return; }
  if(act==='evDelete'){
    DATA.calendar=(DATA.calendar||[]).filter(ev=>ev.id!==arg);
    saveCalendar();
    const m=$("#ev-modal"); if(m) m.remove();
    App.set({}); return;
  }
  if(act==='evSave'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
    const title=($("#em-title")||{}).value||ev.title;
    const date=($("#em-date")||{}).value||ev.startISO.slice(0,10);
    const type=($("#em-type")||{}).value||ev.type;
    const start=($("#em-start")||{}).value||ev.startISO.slice(11,16);
    const end=($("#em-end")||{}).value||ev.endISO.slice(11,16);
    const loc=($("#em-loc")||{}).value||ev.location||"";
    const owner = (DATA.me.role==="Admin" ? ($("#em-owner")||{}).value||ev.ownerEmail : ev.ownerEmail);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const caseId = ($("#em-case")||{}).value || "";
    ev.title=title; ev.type=type; ev.location=loc; ev.ownerEmail=owner; ev.ownerName=ownerName;
    ev.startISO = date+"T"+start+":00"; ev.endISO = date+"T"+end+":00";
    ev.caseId = caseId || null;
    saveCalendar();
    const m=$("#ev-modal"); if(m) m.remove();
    App.set({}); return;
  }

  // Delete inline button in chips/agenda
  if(act==='deleteEvent'){ DATA.calendar=(DATA.calendar||[]).filter(ev=>ev.id!==arg); saveCalendar(); App.set({}); return; }
});

document.addEventListener('change', e=>{
  if(e.target && e.target.id==='cal-owner-filter'){
    const S=App.state.calendar||{}; S.filterUsers=e.target.value||"ALL"; App.set({calendar:S});
  }
});

})();