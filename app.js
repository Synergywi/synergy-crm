// Extended build with notifications, calendar modal, case calendar tab
(function(){ "use strict";
/* ===== Boot / Build ===== */
const BUILD="baseline-1.1.0"; const STAMP="2025-08-18T00:00:00Z";
console.log("Synergy CRM "+BUILD+" • "+STAMP);
// ===== Persistence (non-intrusive) =====
const STORE_KEY_MAIN = 'synergy_store_main_v2110';
const STORE_KEY_NOTIFS = 'synergy_store_notifs_v2110';
function loadStore(key, fallback){
  try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback; }catch(_){ return fallback; }
}
function saveStore(key, obj){
  try{ localStorage.setItem(key, JSON.stringify(obj)); }catch(_){ }
}

// Initialize persisted containers
DATA.calendar = Array.isArray(DATA.calendar)?DATA.calendar:[];
DATA.calendar = loadStore(STORE_KEY_MAIN, {calendar: DATA.calendar, me: DATA.me}).calendar || DATA.calendar;
DATA.me = loadStore(STORE_KEY_MAIN, {calendar: [], me: DATA.me}).me || DATA.me;

// App state & notifications
// Using existing App from baseline; do not redeclare.
App.state.notifications = loadStore(STORE_KEY_NOTIFS, []);
function persistMain(){ saveStore(STORE_KEY_MAIN, {calendar: DATA.calendar||[], me: DATA.me||{}}); }
function persistNotifs(){ saveStore(STORE_KEY_NOTIFS, App.state.notifications||[]); }

function addNotif(kind, verb, ev){
  const n = { id: uid(), kind, verb, evId: ev.id, title: ev.title, when: (new Date()).toISOString(), read:false };
  App.state.notifications = [n, ...(App.state.notifications||[])];
  persistNotifs();
}
function markAllRead(){ App.state.notifications = (App.state.notifications||[]).map(n=>({ ...n, read:true })); persistNotifs(); }
function dismissNotif(id){ App.state.notifications = (App.state.notifications||[]).filter(n=>n.id!==id); persistNotifs(); }
function unreadCount(){ return (App.state.notifications||[]).filter(n=>!n.read).length; }

/* ===== Helpers & Persistence ===== */
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function esc(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;
const STORE_KEY="synergy_store_v1";
function loadStore(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)||"{}"); }catch(_){ return {}; } }
function saveStore(obj){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(obj)); }catch(_){ } }
function pull(k, fallback){ const s=loadStore(); return (k in s)?s[k]:fallback; }
function push(k, v){ const s=loadStore(); s[k]=v; saveStore(s); return v; }

/* ===== Seed Data ===== */
function mkCase(y,seq,p){let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b;}
const DATA = (()=>{
  const fresh = {
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
    resources:{links:[{title:"Investigation Framework", url:"#"}],faqs:[],guides:[]},
    calendar:[],
    me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
  };
  return {
    users:pull("users",fresh.users),
    companies:pull("companies",fresh.companies),
    contacts:pull("contacts",fresh.contacts),
    cases:pull("cases",fresh.cases),
    resources:pull("resources",fresh.resources),
    calendar:pull("calendar",fresh.calendar),
    me:pull("me",fresh.me)
  };
})();
function persistAll(){
  push("users", DATA.users);
  push("companies", DATA.companies);
  push("contacts", DATA.contacts);
  push("cases", DATA.cases);
  push("calendar", DATA.calendar);
  push("me", DATA.me);
}

/* ===== Notifications (Admin) ===== */
// Using existing App from baseline; do not redeclare.
App.state.notifications = pull("notifications", []);
function addNotif(kind, verb, ev){
  const n = { id:uid(), kind, verb, evId:ev.id, title:ev.title, when:(new Date()).toISOString(), read:false };
  App.state.notifications.unshift(n);
  push("notifications", App.state.notifications);
}
function markAllRead(){ App.state.notifications=(App.state.notifications||[]).map(n=>Object.assign(n,{read:true})); push("notifications", App.state.notifications); }
function dismissNotif(id){ App.state.notifications=(App.state.notifications||[]).filter(n=>n.id!==id); push("notifications", App.state.notifications); }
function unreadCount(){ return (App.state.notifications||[]).filter(n=>!n.read).length; }

/* ===== UI ===== */
function Topbar(){
  let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>';
  if(App.state.asUser){
    s+='<span class="chip">Viewing as '+(App.state.asUser.name||App.state.asUser.email)+' ('+App.state.asUser.role+')</span> <button class="btn light" data-act="exitPortal">Exit</button> ';
  }
  // Notifications bell (Admin only)
  const me=(DATA.me||{});
  if((me.role||'Admin')==='Admin'){
    s+='<div class="notify"><button class="btn light" data-act="openNotifs" title="Notifications">🔔</button>'
      + (unreadCount() ? '<span class="badge-dot" data-act="openNotifs">'+unreadCount()+'</span>' : '')
      + '</div>';
  }
  s+='<span class="badge">Soft Stable '+BUILD+'</span></div>';
  return s;
});
  const bell = (me.role==="Admin")
    ? `<div class="notify"><button class="btn light" data-act="openNotifs" aria-label="Notifications">🔔</button>${unreadCount()?`<span class="badge-dot" data-act="openNotifs">${unreadCount()}</span>`:""}</div>`
    : "";
  return `<div class="topbar">
      <div class="brand">Synergy CRM</div>
      <div class="sp"></div>
      ${bell}
      <div class="muted" style="margin-right:10px">You: ${me.name} (${me.role})</div>
      <span class="badge">Soft Stable ${BUILD}</span>
    </div>`;
}
function Sidebar(active){
  const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["companies","Companies"],["contacts","Contacts"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">`+items.map(it=>`<li ${(active===it[0]?'class="active"':'')} data-act="route" data-arg="${it[0]}">${it[1]}</li>`).join("")+`</ul></aside>`;
}
function Tabs(key,arr){
  const cur=App.state.tabs[key]||arr[0][0];
  return `<div class="section" style="margin-bottom:8px">`+arr.map(t=>`<button class="btn light" data-act="tab" data-arg="${key}::${t[0]}">${t[1]}</button>`).join(" ")+`</div>`;
}
function Shell(content,active){ return Topbar()+`<div class="shell">`+Sidebar(active)+`<main class="main">`+content+`</main></div><div id="boot">Ready (${BUILD})</div>`; }

/* ===== Dashboard ===== */
function Dashboard(){
  const me=DATA.me||{}; const isAdmin=me.role==="Admin";
  const rows=DATA.cases.slice(0,6).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td><td>${c.status}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const notifCard = isAdmin ? (()=>{
    const mode=App.state.notifMode||"unread";
    const list=(App.state.notifications||[]).filter(n=> mode==="all"?true:!n.read);
    const nrows = list.map(n=>`<tr><td>${new Date(n.when).toLocaleString()}</td><td>${esc(n.verb)} • ${esc(n.title)}</td><td class="right"><button class="btn light" data-act="gotoEventFromNotif" data-arg="${n.evId}">Open</button> <button class="btn light" data-act="dismissNotif" data-arg="${n.id}">Dismiss</button></td></tr>`).join("") || `<tr><td colspan="3" class="muted">${mode==="all"?"No notifications yet.":"All caught up."}</td></tr>`;
    return `<div class="card">
      <h3 class="section-title">Calendar updates (Admin only)</h3>
      <div class="right" style="margin-bottom:6px">
        <button class="btn light" data-act="notifMode" data-arg="unread">Show unread</button>
        <button class="btn light" data-act="notifMode" data-arg="all">Show all</button>
        <button class="btn light" data-act="markAllRead">Mark all read</button>
      </div>
      <table class="table"><thead><tr><th>When</th><th>Event</th><th></th></tr></thead><tbody>${nrows}</tbody></table>
    </div>`;
  })() : "";
  const overview =
    `<div class="card"><h3>Welcome</h3><div class="muted">${STAMP}</div></div>`
    + (isAdmin ? notifCard : "")
    + `<div class="section"><header><h3 class="section-title">Active Cases</h3></header>
         <table class="table"><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>
       </div>`;
  return Shell(Tabs('dashboard',[['overview','Overview'],['week','This Week']]) + overview, 'dashboard');
}

/* ===== Calendar ===== */
function monthMatrix(date){
  const d=new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(d); start.setDate(1 - ((d.getDay()+6)%7)); // Monday
  const weeks=[]; let cur=new Date(start);
  for(let w=0; w<6; w++){ const days=[]; for(let i=0;i<7;i++){ days.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(days); }
  return weeks;
}
function CalendarView(){
  const me=DATA.me||{}; const isAdmin=me.role==="Admin";
  const st = App.state.cal || {date:new Date(), mode:"month", filterOwner:""};
  const date=new Date(st.date||new Date());
  const evsAll=(DATA.calendar||[]).filter(e=> isAdmin ? (!st.filterOwner || e.ownerEmail===st.filterOwner) : e.ownerEmail===me.email);

  const ownerSel = isAdmin ? `<select class="input" id="cal-owner"><option value="">(All owners)</option>${DATA.users.map(u=>`<option value="${u.email}" ${(st.filterOwner===u.email?'selected':'')}>${u.name}</option>`).join("")}</select>` : "";

  let grid="";
  if(st.mode==="month"){
    const weeks=monthMatrix(date);
    grid = `<div class="card"><div class="grid cols-3"><div><button class="btn light" data-act="calPrev">◀</button> <strong>${date.toLocaleString(undefined,{month:'long', year:'numeric'})}</strong> <button class="btn light" data-act="calNext">▶</button></div><div><button class="btn light" data-act="toggleAgenda">Toggle Agenda</button></div><div class="right">${ownerSel}</div></div>`;
    grid += `<div class="grid" style="grid-template-columns:repeat(7,1fr);gap:6px;margin-top:8px">`;
    grid += weeks.map(week=> week.map(dy=>{
      const ymd = dy.toISOString().slice(0,10);
      const dayEvs = evsAll.filter(e=> e.startISO.slice(0,10)===ymd);
      const chips = dayEvs.map(e=>`<div class="cal-ev" data-act="openEvent" data-arg="${e.id}"><span class="cal-ev-dot"></span><span class="cal-ev-title">${esc(e.title)}</span></div>`).join("");
      return `<div class="card" style="padding:8px"><div style="font-size:12px;color:#475569">${dy.getDate()}</div>${chips||'<div class="muted" style="font-size:12px">—</div>'}</div>`;
    }).join("")).join("") + `</div>`;
    grid += `</div>`;
  } else {
    const sorted=evsAll.slice().sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows=sorted.map(e=>`<tr><td>${new Date(e.startISO).toLocaleDateString()}</td><td>${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${new Date(e.endISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td>${esc(e.title)}</td><td>${esc(e.location||'')}</td><td>${e.ownerName||e.ownerEmail}</td><td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">No events</td></tr>`;
    grid = `<div class="card"><div class="grid cols-3"><div><strong>${date.toLocaleString(undefined,{month:'long', year:'numeric'})}</strong></div><div><button class="btn light" data-act="toggleAgenda">Toggle Month</button></div><div class="right">${ownerSel}</div></div><table class="table"><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  const selDate = (st.selectedDate)|| new Date().toISOString().slice(0,10);
  const ownerField = isAdmin ? `<div><label>Owner</label><select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===me.email?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
  const caseSelect = `<div><label>Case (optional)</label><select class="input" id="ev-case"><option value="">—</option>${DATA.cases.map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${esc(cs.title||'')}</option>`).join("")}</select></div>`;
  const form = `<div class="card"><h3 class="section-title">Add ${isAdmin?"Event (any user)":"My Event"}</h3>
    <div class="grid cols-3">
      <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
      <div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div>
      <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
      <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
      <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
      <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
      ${caseSelect}
      ${ownerField}
    </div>
    <div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Add Event</button></div>
  </div>`;

  return Shell(grid+form, 'calendar');
}
function renderEventModal(ev){
  if(!ev){ document.getElementById('modal-root')?.remove(); return; }
  const me=DATA.me||{}; const isAdmin=me.role==="Admin";
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="em-owner">${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
  const caseSelect = `<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${DATA.cases.map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||"")?'selected':'')}>${cs.fileNumber} — ${esc(cs.title||'')}</option>`).join("")}</select></div>`;
  const node=document.createElement('div'); node.id='modal-root'; node.innerHTML=`
    <div class="modal-backdrop" data-act="closeModal"></div>
    <div class="modal">
      <h3 class="section-title">Edit Event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
        <div><label>Date</label><input class="input" id="em-date" type="date" value="${ev.startISO.slice(0,10)}"></div>
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
}

/* ===== Simple Cases/Companies/Contacts to complete routes ===== */
function Cases(){
  const rows=DATA.cases.map(cc=>`<tr><td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td>${cc.status}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td></tr>`).join("");
  return Shell(`<div class="section"><header><h3 class="section-title">Cases</h3></header><table class="table"><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, 'cases');
}
function CasePage(id){
  const cs=DATA.cases.find(c=>c.id===id);
  if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const tabs = Tabs('case', [['details','Details'],['notes','Notes'],['tasks','Tasks'],['documents','Documents'],['people','People'],['calendar','Calendar']]);
  const tab = App.state.tabs.case || 'details';
  const details = `<div class="card"><div class="grid cols-2">
    <div><label>File no.</label><input class="input" id="c-id" value="${cs.fileNumber}"></div>
    <div><label>Organisation</label><input class="input" id="c-org" value="${esc(cs.organisation||'')}"></div>
    <div><label>Title</label><input class="input" id="c-title" value="${esc(cs.title||'')}"></div>
    <div><label>Status</label><select class="input" id="c-status">
      <option${cs.status==='Planning'?' selected':''}>Planning</option>
      <option${cs.status==='Investigation'?' selected':''}>Investigation</option>
      <option${cs.status==='Evidence Review'?' selected':''}>Evidence Review</option>
      <option${cs.status==='Reporting'?' selected':''}>Reporting</option>
      <option${cs.status==='Closed'?' selected':''}>Closed</option>
    </select></div>
  </div>
  <div class="right" style="margin-top:6px"><button class="btn" data-act="saveCase" data-arg="${id}">Save</button> <button class="btn light" data-act="route" data-arg="cases">Back</button></div>
  </div>`;
  const notesRows = (cs.notes||[]).map(n=>`<tr><td>${n.time}</td><td>${n.by}</td><td>${esc(n.text)}</td></tr>`).join("") || `<tr><td colspan="3" class="muted">No notes yet.</td></tr>`;
  const notes = `<div class="card"><h3 class="section-title">Notes</h3><textarea class="input" id="note-text" placeholder="Type your note here"></textarea><div class="right" style="margin-top:6px"><button class="btn light" data-act="addNote" data-arg="${id}">Add Note</button></div><table class="table"><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>${notesRows}</tbody></table></div>`;
  const tasks = `<div class="card"><h3 class="section-title">Tasks</h3><div class="right" style="margin-bottom:6px"><button class="btn light" data-act="addStdTasks" data-arg="${id}">Add standard tasks</button></div><table class="table"><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${(cs.tasks||[]).map(tt=>`<tr><td>${tt.id}</td><td>${esc(tt.title)}</td><td>${esc(tt.assignee||'')}</td><td>${esc(tt.due||'')}</td><td>${esc(tt.status||'')}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">No tasks yet.</td></tr>`}</tbody></table></div>`;
  const documents = `<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Folders & uploads (baseline behavior).</div></div>`;
  const people = `<div class="card"><h3 class="section-title">People</h3><div class="muted">Link/unlink company contacts (baseline).</div></div>`;
  const caseEvents = (()=>{
    const list=(DATA.calendar||[]).filter(e=>e.caseId===id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows=list.map(e=>`<tr><td>${new Date(e.startISO).toLocaleDateString()}</td><td>${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${new Date(e.endISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td>${esc(e.title)}</td><td>${esc(e.location||'')}</td><td>${e.ownerName||e.ownerEmail}</td><td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">No events linked to this case.</td></tr>`;
    const ownerSelect = (DATA.me.role==="Admin") ? `<div><label>Owner</label><select class="input" id="ce-owner">${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===DATA.me.email?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
    return `<div class="card"><h3 class="section-title">Case Calendar</h3><table class="table"><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
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
  const body = `<div class="tabpanel ${tab==='details'?'active':''}">${details}</div>
                <div class="tabpanel ${tab==='notes'?'active':''}">${notes}</div>
                <div class="tabpanel ${tab==='tasks'?'active':''}">${tasks}</div>
                <div class="tabpanel ${tab==='documents'?'active':''}">${documents}</div>
                <div class="tabpanel ${tab==='people'?'active':''}">${people}</div>
                <div class="tabpanel ${tab==='calendar'?'active':''}">${caseEvents}</div>`;
  return Shell(tabs+body, 'cases');
}
function Companies(){
  const rows=DATA.companies.map(co=>`<tr><td>${co.id}</td><td>${co.name}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`).join("");
  return Shell(`<div class="section"><header><h3 class="section-title">Companies</h3></header><table class="table"><thead><tr><th>ID</th><th>Name</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'companies');
}
function Contacts(){
  const rows=DATA.contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`).join("");
  return Shell(`<div class="section"><header><h3 class="section-title">Contacts</h3></header><table class="table"><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'contacts');
}
function Documents(){ return Shell('<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Global documents area (baseline preserved).</div></div>','documents'); }
function Resources(){ return Shell('<div class="card"><h3 class="section-title">Resources</h3><div class="muted">Static resources (links/FAQs/guides).</div></div>','resources'); }
function Admin(){
  const rows=DATA.users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join("");
  return Shell(`<div class="card"><h3 class="section-title">Users</h3><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table></div>`,'admin');
}

/* ===== Render Router ===== */
function render(){
  const r=App.state.route, el=document.getElementById('app');
  document.getElementById('boot').textContent='Rendering '+r+'…';
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='calendar') el.innerHTML=CalendarView();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else if(r==='admin') el.innerHTML=Admin();
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}

/* ===== Actions ===== */
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
  const me=DATA.me||{}; const isAdmin=me.role==="Admin";

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='tab'){ const [k,v]=arg.split('::'); App.state.tabs[k]=v; App.set({}); return; }
  if(act==='openCase'){ App.set({currentCaseId:arg, route:'case'}); return; }
  if(act==='openCompany'){ App.set({currentCompanyId:arg, route:'companies'}); return; }
  if(act==='openContact'){ App.set({currentContactId:arg, route:'contacts'}); return; }

  // Notifications controls
  if(act==='openNotifs'){ App.state.tabs.dashboard='overview'; App.set({route:'dashboard'}); return; }
  if(act==='notifMode'){ App.state.notifMode=arg; App.set({}); return; }
  if(act==='markAllRead'){ markAllRead(); App.set({}); return; }
  if(act==='dismissNotif'){ dismissNotif(arg); App.set({}); return; }
  if(act==='gotoEventFromNotif'){ markAllRead(); App.set({route:'calendar'}); setTimeout(()=>{ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); },0); return; }

  // Calendar view switching
  if(act==='toggleAgenda'){ const st=App.state.cal||{}; st.mode = (st.mode==='month'?'agenda':'month'); App.state.cal=st; App.set({}); return; }
  if(act==='calPrev'){ const st=App.state.cal||{date:new Date()}; const d=new Date(st.date||new Date()); d.setMonth(d.getMonth()-1); st.date=d; App.state.cal=st; App.set({}); return; }
  if(act==='calNext'){ const st=App.state.cal||{date:new Date()}; const d=new Date(st.date||new Date()); d.setMonth(d.getMonth()+1); st.date=d; App.state.cal=st; App.set({}); return; }
  if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); return; }

  if(act==='createEvent'){
    const title=(document.getElementById('ev-title')||{}).value||'Untitled';
    const date=(document.getElementById('ev-date')||{}).value||new Date().toISOString().slice(0,10);
    const type=(document.getElementById('ev-type')||{}).value||'Appointment';
    const start=(document.getElementById('ev-start')||{}).value||'09:00';
    const end=(document.getElementById('ev-end')||{}).value||'10:00';
    const loc=(document.getElementById('ev-loc')||{}).value||'';
    const caseId=(document.getElementById('ev-case')||{}).value||"";
    const owner = (isAdmin ? (document.getElementById('ev-owner')||{}).value||me.email : me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+start+":00";
    const eISO = date+"T"+end+":00";
    const ev={id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||null};
    DATA.calendar.push(ev);
    persistAll();
    if(isAdmin) addNotif("calendar","created",ev);
    alert('Event added');
    App.set({}); return;
  }

  if(act==='saveEvent'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
    const date=(document.getElementById('em-date')||{}).value||ev.startISO.slice(0,10);
    const s=(document.getElementById('em-start')||{}).value||new Date(ev.startISO).toISOString().slice(11,16);
    const e=(document.getElementById('em-end')||{}).value||new Date(ev.endISO).toISOString().slice(11,16);
    ev.title=(document.getElementById('em-title')||{}).value||ev.title;
    ev.type=(document.getElementById('em-type')||{}).value||ev.type;
    ev.location=(document.getElementById('em-loc')||{}).value||ev.location;
    ev.startISO=date+"T"+s+":00";
    ev.endISO=date+"T"+e+":00";
    const caseId=(document.getElementById('em-case')||{}).value||"";
    ev.caseId=caseId||null;
    if(isAdmin){
      const owner=(document.getElementById('em-owner')||{}).value||ev.ownerEmail;
      ev.ownerEmail=owner;
      ev.ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner;
    }
    persistAll();
    if(isAdmin) addNotif("calendar","updated",ev);
    document.getElementById('modal-root')?.remove();
    App.set({}); return;
  }

  if(act==='deleteEvent'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg);
    DATA.calendar = (DATA.calendar||[]).filter(e=>e.id!==arg);
    persistAll();
    if(isAdmin && ev) addNotif("calendar","deleted",ev);
    document.getElementById('modal-root')?.remove();
    App.set({}); return;
  }

  if(act==='closeModal'){ document.getElementById('modal-root')?.remove(); return; }

  // Case actions
  if(act==='saveCase'){
    const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return;
    const idEl=document.getElementById('c-id'); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim();
    const t=document.getElementById('c-title'); if(t) cs.title=t.value;
    const o=document.getElementById('c-org'); if(o) cs.organisation=o.value;
    const stSel=document.getElementById('c-status'); if(stSel) cs.status=stSel.value;
    persistAll(); alert('Case saved'); return;
  }
  if(act==='addNote'){
    const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return;
    const text=(document.getElementById('note-text')||{}).value||""; if(!text){ alert('Enter a note'); return; }
    cs.notes=cs.notes||[]; cs.notes.unshift({time:new Date().toISOString().slice(0,16).replace('T',' '), by:(DATA.me.email||'admin@synergy.com'), text});
    persistAll(); App.set({}); return;
  }
  if(act==='addStdTasks'){
    const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return;
    const base=cs.tasks; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(a=>base.push({id:'T-'+(base.length+1), title:a, assignee:cs.investigatorName||'', due:'', status:'Open'}));
    persistAll(); App.set({}); return;
  }
  if(act==='createCaseEvent'){
    const caseId=arg;
    const title=(document.getElementById('ce-title')||{}).value||'Untitled';
    const date=(document.getElementById('ce-date')||{}).value||new Date().toISOString().slice(0,10);
    const type=(document.getElementById('ce-type')||{}).value||'Appointment';
    const start=(document.getElementById('ce-start')||{}).value||'10:00';
    const end=(document.getElementById('ce-end')||{}).value||'11:00';
    const loc=(document.getElementById('ce-loc')||{}).value||'';
    const owner = (DATA.me.role==="Admin" ? (document.getElementById('ce-owner')||{}).value||DATA.me.email : DATA.me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+start+":00"; const eISO = date+"T"+end+":00";
    const ev={id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId};
    DATA.calendar.push(ev); persistAll(); if(DATA.me.role==="Admin") addNotif("calendar","created",ev);
    App.set({}); return;
  }
});

document.addEventListener('change',e=>{
  if(e.target && e.target.id==='cal-owner'){
    const st=App.state.cal||{}; st.filterOwner=e.target.value; App.state.cal=st; App.set({});
  }
});

document.addEventListener('DOMContentLoaded',()=>{ App.set({route:'dashboard'}); });
})();

// === Post-App initializer (extends existing App safely) ===
(function(){
  if (typeof App === 'undefined' || !App || !App.state) return;
  App.state.notifications = App.state.notifications || [];
  App.state.cal = App.state.cal || { date:new Date(), mode:'month', filterOwner:'' };
})();

