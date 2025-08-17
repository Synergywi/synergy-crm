
// utils
const BUILD = "baseline-1.1.8";
const STAMP = new Date().toISOString();
const YEAR = new Date().getFullYear();
const $ = (sel) => document.querySelector(sel);
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const esc = (s) => (s==null ? "" : String(s)).replace(/[&<>\"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

// helpers
const Tabs = (scope, items) =>
  `<div class="tabs">${items.map(([k,v])=>`<div class="tab ${(App.state.tabs[scope]||items[0][0])===k?'active':''}" data-act="tab" data-arg="${scope}:${k}">${v}</div>`).join("")}</div>`;

const statusChip = (s) => {
  const key = (s||"").toLowerCase().replace(/\s+/g,'-');
  const map = { planning:'status-planning', investigation:'status-investigation', 'evidence-review':'status-evidence', reporting:'status-reporting', closed:'status-closed' };
  return `<span class="chip ${map[key]||'status-planning'}"><i></i>${esc(s||'')}</span>`;
};

function Sidebar(active){
  const items=[
    ["dashboard","Dashboard","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M3 10l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z'/></svg>","#3b82f6"],
    ["calendar","Calendar","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M7 2v3M17 2v3M3 8h18M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0  0 1-2-2z'/></svg>","#f97316"],
    ["cases","Cases","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>","#8b5cf6"],
    ["companies","Companies","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M3 21V7l9-4 9 4v14M9 21V9m6 12V9M3 10h18'/></svg>","#06b6d4"],
    ["contacts","Contacts","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4zM2 20a7 7 0 0 1 14 0'/></svg>","#10b981"],
    ["documents","Documents","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5'/></svg>","#64748b"],
    ["resources","Resources","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4h16v13H6.5A2.5 2.5 0 0 0 4 19.5z'/></svg>","#eab308"],
    ["admin","Admin","<svg class='nav-icon' viewBox='0 0 24 24'><path d='M11 2v2M11 20v2M4.22 4.22l1.42 1.42M17.36 17.36l1.42 1.42M2 11h2M20 11h2M4.22 17.78l1.42-1.42M17.36 6.64l1.42-1.42M8 11a4 4 0 1 0 8 0a4 4 0 1 0-8 0z'/></svg>","#0ea5e9"]
  ];
  return `<aside class="sidebar"><h3>Investigations</h3><ul>${items.map(([k,v,icon,color])=>`<li class="${active===k?'active':''}" data-act="route" data-arg="${k}"><span class="nav-icon-wrap" style="--ico:${color}">${icon}</span><span>${v}</span></li>`).join("")}</ul></aside>`;
}
const Topbar=()=>{
  const me=DATA.me||{}; const unread=App.state.notificationsUnread||0;
  const bell=(me.role==="Admin"&&unread>0)?`<button class="btn light" data-act="gotoNotifications">🔔 <span class="notif-badge">${unread}</span></button>`:"";
  const back=(me.role!=="Admin"?'<button class="btn light" data-act="clearImpersonation">Switch to Admin</button>':"");
  return `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>${bell}<div class="muted" style="margin-right:10px">You: ${esc(me.name||'')} (${esc(me.role||'')})</div>${back}<span class="badge">Soft Stable ${BUILD}</span></div>`;
};
const Shell=(content,active)=>Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div>${Modal()}<div id="boot">Ready (${BUILD})</div>`;

// data
const DATA = {
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",city:"Brisbane"},
    {id:"C-002",name:"City of Melbourne",industry:"Government",city:"Melbourne"},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Healthcare",city:"Brisbane"}
  ],
  contacts:[{id:"P-001",name:"Admin",email:"admin@synergy.com",companyId:"C-001"}],
  cases:[
    {id:"INV-2024-101",fileNumber:"INV-2024-101",title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",investigatorName:"Alex Ng",investigatorEmail:"alex@synergy.com",status:"Closed",created:String(YEAR)+"-06-01"},
    {id:"INV-2024-102",fileNumber:"INV-2024-102",title:"Bullying complaint in Finance",organisation:"City of Melbourne",investigatorName:"Priya Menon",investigatorEmail:"priya@synergy.com",status:"Closed",created:String(YEAR)+"-02-10"},
    {id:"INV-2025-001",fileNumber:"INV-2025-001",title:"Safety complaint — workshop",organisation:"Sunrise Mining Pty Ltd",investigatorName:"Alex Ng",investigatorEmail:"alex@synergy.com",status:"Investigation",created:String(YEAR)+"-07-05"},
    {id:"INV-2025-002",fileNumber:"INV-2025-002",title:"Bullying complaint",organisation:"Queensland Health (Metro North)",investigatorName:"Priya Menon",investigatorEmail:"priya@synergy.com",status:"Planning",created:String(YEAR)+"-07-10"}
  ],
  calendar:[],
  resources:{links:[{title:"Policy",url:"#"}],faqs:[{q:"How to add a case?",a:"Use the Cases menu."}],guides:["Onboarding","Workflows"]}
};

// persistence
const saveData=()=>{ try{ localStorage.setItem("synergy_data_v1", JSON.stringify({companies:DATA.companies,contacts:DATA.contacts,cases:DATA.cases,calendar:DATA.calendar})) }catch(_){} };
const loadData=()=>{ try{ const raw=localStorage.getItem("synergy_data_v1"); if(!raw) return; const o=JSON.parse(raw)||{}; if(o.companies) DATA.companies=o.companies; if(o.contacts) DATA.contacts=o.contacts; if(o.cases) DATA.cases=o.cases; if(o.calendar) DATA.calendar=o.calendar; }catch(_){} };

// app
const App = { el:document.getElementById("app"), state:{ route:"dashboard", tabs:{dashboard:"overview",case:"details",resources:"links",company:"summary",admin:"users"}, notifications:[], notificationsUnread:0, calendar:{ ym:new Date().toISOString().slice(0,7), view:"month", selectedDate:new Date().toISOString().slice(0,10), filterUsers:"ALL"}, modalEventId:null }, set(p){ Object.assign(App.state,p); render(); } };

// notifications
function pushCalNotification(action,ev){
  const item={id:uid(),kind:"calendar",action:action,title:ev.title||"Untitled",owner:ev.ownerName||ev.ownerEmail||"",ownerEmail:ev.ownerEmail||"",when:new Date().toISOString(),startISO:ev.startISO||"",endISO:ev.endISO||"",read:false};
  App.state.notifications.unshift(item);
  App.state.notifications=App.state.notifications.slice(0,100);
  App.state.notificationsUnread=(App.state.notifications.filter(n=>!n.read)).length;
  try{ localStorage.setItem("synergy_notifs",JSON.stringify(App.state.notifications)); localStorage.setItem("synergy_notifs_unread",String(App.state.notificationsUnread)); }catch(_){}
}

// pages (same as stable7 with no logic changes)
function Dashboard(){
  const tab=App.state.tabs.dashboard;
  const rows=DATA.cases.map(c=>`<tr><td>${c.fileNumber}</td><td>${esc(c.organisation)}</td><td>${esc(c.investigatorName)}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const isAdmin=(DATA.me&&DATA.me.role==="Admin");
  const unread=App.state.notificationsUnread||0;
  const showAll=!!App.state.notificationsShowAll;
  const visible=(App.state.notifications||[]).filter(n=>showAll?true:!n.read).slice(0,10);
  const notifRows=visible.map(n=>{const ts=new Date(n.when).toLocaleString(); const who=n.owner?` — ${n.owner}`:""; const day=n.startISO?` (${new Date(n.startISO).toLocaleDateString()})`:""; return `<tr><td>${ts}</td><td>${esc(n.title)}${day}${who}</td><td>${esc(n.action)}</td><td class="right"><button class="btn light" data-act="openNotif" data-arg="${n.id}">Open</button> <button class="btn light" data-act="readNotif" data-arg="${n.id}">Dismiss</button></td></tr>`;}).join("")||'<tr><td colspan="4" class="muted">No calendar activity yet.</td></tr>';
  const toggler=showAll?'<button class="btn light" data-act="notifShowUnread">Show unread</button>':'<button class="btn light" data-act="notifShowAll">Show all</button>';
  const notifCard = !isAdmin ? '' : `<div class="section"><header style="display:flex;align-items:center;gap:8px;justify-content:space-between"><h3 class="section-title">Calendar updates ${unread?`<span class="notif-badge">${unread}</span>`:''}</h3><div>${toggler} <button class="btn light" data-act="markNotifsRead">Mark all read</button></div></header><table><thead><tr><th>Time</th><th>Event</th><th>Action</th><th></th></tr></thead><tbody>${notifRows}</tbody></table></div>`;
  const overview=`<div class="card"><h3 class="section-title">Welcome</h3><div class="muted">${STAMP}</div></div>${notifCard}<div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const week=`<div class="card"><h3 class="section-title">This Week</h3><div class="muted">New cases: ${DATA.cases.filter(c=>c.created.startsWith(String(YEAR)+'-')).length}</div></div>`;
  return Shell(Tabs('dashboard',[['overview','Overview'],['week','This Week']]) + (tab==='overview'?overview:week),'dashboard');
}

function Cases(){const rows=DATA.cases.map(c=>`<tr><td>${c.fileNumber}</td><td>${esc(c.title)}</td><td>${esc(c.organisation)}</td><td>${esc(c.investigatorName)}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join(""); return Shell(`<div class="card"><h3 class="section-title">Cases</h3><table><thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'cases'); }

function CasePage(id){
  const cs=DATA.cases.find(x=>x.id===id); if(!cs) return Shell(`<div class="card">Case not found</div>`,'cases');
  const tab=App.state.tabs.case||'details';
  const tabs=Tabs('case',[['details','Details'],['notes','Notes'],['tasks','Tasks'],['documents','Documents'],['people','People'],['calendar','Calendar']]);
  const details=`<div class="grid cols-2"><div class="card"><h3 class="section-title">About this case</h3><div><strong>Case ID:</strong> ${cs.fileNumber}</div><div><strong>Organisation:</strong> ${esc(cs.organisation)}</div><div><strong>Investigator:</strong> ${esc(cs.investigatorName)}</div><div><strong>Status:</strong> ${statusChip(cs.status)}</div></div><div class="card"><h3 class="section-title">Summary</h3><div class="muted">Use the tabs to manage notes, tasks, documents, people and calendar for this case.</div></div></div>`;
  const people=`<div class="card"><h3 class="section-title">People</h3><div class="muted">Coming soon.</div></div>`;
  const caseEvents=(DATA.calendar||[]).filter(e=>e.caseId===cs.id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
  const ceRows=caseEvents.map(e=>{const d=new Date(e.startISO), end=new Date(e.endISO); const canEdit=(DATA.me&&(DATA.me.role==='Admin'||DATA.me.email===e.ownerEmail)); return `<tr><td>${d.toLocaleDateString()}</td><td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td data-act='openEvent' data-arg='${e.id}'><button class='btn light' data-act='openEvent' data-arg='${e.id}'>Edit</button> ${esc(e.title)}</td><td>${esc(e.ownerName||e.ownerEmail||'')}</td><td class='right'>${canEdit?`<button class='btn light' data-act='openEvent' data-arg='${e.id}'>Edit</button> <button class='btn light' data-act='deleteEvent' data-arg='${e.id}'>Delete</button>`:''}</td></tr>`;}).join('')||'<tr><td colspan="5" class="muted">No events for this case yet.</td></tr>';
  const ownerSel = (DATA.me && DATA.me.role==='Admin') ? `<div><label>Owner</label><select class='input' id='ev-owner'>${DATA.users.map(u=>`<option value='${u.email}' ${u.email===(cs.investigatorEmail||DATA.me.email)?'selected':''}>${u.name} (${u.role})</option>`).join('')}</select></div>` : '';
  const addForm=`<div class='card'><h3 class='section-title'>Add case event</h3><div class='grid cols-3'><div><label>Title</label><input class='input' id='ev-title'></div><div><label>Date</label><input class='input' id='ev-date' type='date' value='${new Date().toISOString().slice(0,10)}'></div><div><label>Type</label><select class='input' id='ev-type'><option>Appointment</option><option>Note</option></select></div><div><label>Start</label><input class='input' id='ev-start' type='time' value='09:00'></div><div><label>End</label><input class='input' id='ev-end' type='time' value='10:00'></div><div><label>Location</label><input class='input' id='ev-loc' placeholder='Room/Zoom/etc.'></div>${ownerSel}<input type='hidden' id='ev-case' value='${cs.id}'></div><div class='right' style='margin-top:8px'><button class='btn' data-act='createEvent'>Add Event</button></div></div>`;
  const caseCalendar = `<div class='card'><h3 class='section-title'>Case Calendar</h3><table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Owner</th><th></th></tr></thead><tbody>${ceRows}</tbody></table></div>` + addForm;
  const body = `${tabs}
    <div class="tabpanel ${tab==='details'?'active':''}">${details}</div>
    <div class="tabpanel ${tab==='notes'?'active':''}"><div class="card">Notes (TBD)</div></div>
    <div class="tabpanel ${tab==='tasks'?'active':''}"><div class="card">Tasks (TBD)</div></div>
    <div class="tabpanel ${tab==='documents'?'active':''}"><div class="card">Documents (TBD)</div></div>
    <div class="tabpanel ${tab==='people'?'active':''}">${people}</div>
    <div class="tabpanel ${tab==='calendar'?'active':''}">${caseCalendar}</div>`;
  return Shell(body,'cases');
}

function Companies(){ const rows=DATA.companies.map(c=>`<tr><td>${c.id}</td><td>${esc(c.name)}</td><td>${esc(c.industry||'')}</td><td>${esc(c.city||'')}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${c.id}">Open</button></td></tr>`).join(""); return Shell(`<div class="card"><h3 class="section-title">Companies</h3><table><thead><tr><th>ID</th><th>Name</th><th>Industry</th><th>City</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'companies'); }
function CompanyPage(id){
  const c=DATA.companies.find(x=>x.id===id); if(!c) return Shell(`<div class="card">Company not found</div>`,'companies');
  const tab=App.state.tabs.company||'summary';
  const tabs=Tabs('company',[['summary','Summary'],['contacts','Company Contacts'],['documents','Company Documents']]);
  const header=`<div class="card"><h3 class="section-title">${esc(c.name)} <span class="muted">(${c.id})</span></h3><div class="grid cols-3"><div><strong>Industry:</strong> ${esc(c.industry||'')}</div><div><strong>City:</strong> ${esc(c.city||'')}</div><div><strong>Website:</strong> <span class="muted">—</span></div></div></div>`;
  const recentCases=DATA.cases.filter(cs=>cs.organisation===c.name).sort((a,b)=>a.fileNumber.localeCompare(b.fileNumber)).map(cs=>`<tr><td>${cs.fileNumber}</td><td>${esc(cs.title)}</td><td>${statusChip(cs.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>`).join("")||'<tr><td colspan="4" class="muted">No cases yet.</td></tr>';
  const summary=`${header}<div class="card"><h3 class="section-title">Recent Cases</h3><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${recentCases}</tbody></table></div>`;
  const contacts=`<div class="card"><h3 class="section-title">Company Contacts</h3><div class="muted">Demo placeholder.</div></div>`;
  const docs=`<div class="card"><h3 class="section-title">Company Documents</h3><div class="muted">Demo placeholder.</div></div>`;
  const body = `${tabs}<div class="tabpanel ${tab==='summary'?'active':''}">${summary}</div><div class="tabpanel ${tab==='contacts'?'active':''}">${contacts}</div><div class="tabpanel ${tab==='documents'?'active':''}">${docs}</div>`;
  return Shell(body,'companies');
}

function Contacts(){return Shell(`<div class="card"><h3 class="section-title">Contacts</h3><div class="muted">Demo contacts list.</div></div>`,'contacts');}
function Documents(){return Shell(`<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Demo documents.</div></div>`,'documents');}
function Resources(){const tab=App.state.tabs.resources||'links'; const links=`<div class="card"><h3 class="section-title">Links</h3><div class="grid cols-2">${DATA.resources.links.map(l=>`<div><a href="${l.url}">${esc(l.title)}</a></div>`).join("")}</div></div>`; const faqs=`<div class="card"><h3 class="section-title">FAQs</h3>${DATA.resources.faqs.map(f=>`<div style="margin:6px 0"><strong>${esc(f.q)}</strong><div class="muted">${esc(f.a)}</div></div>`).join("")}</div>`; const guides=`<div class="card"><h3 class="section-title">Guides</h3><ul>${DATA.resources.guides.map(g=>`<li>${esc(g)}</li>`).join("")}</ul></div>`; return Shell(Tabs('resources',[['links','Links'],['faqs','FAQs'],['guides','Guides']]) + (tab==='links'?links:tab==='faqs'?faqs:guides),'resources');}
function Admin(){const users=`<div class="card"><h3 class="section-title">Users</h3><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>${DATA.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td class="right"><button class="btn light" data-act="impersonate" data-arg="${u.email}">Impersonate</button></td></tr>`).join("")}</tbody></table><div class="right" style="margin-top:8px">${(DATA.me&&DATA.me.role!=="Admin")?'<button class="btn light" data-act="clearImpersonation">Revert to Admin</button>':''}</div></div>`; const settings=`<div class="card"><h3 class="section-title">Settings</h3><div class="muted">Demo settings.</div></div>`; const tabs=Tabs('admin',[['users','Users'],['settings','Settings']]); const tab=App.state.tabs.admin||'users'; return Shell(tabs + (tab==='users'?users:settings),'admin');}

// calendar (same as 7; form below calendar)
function Calendar(){
  const S=App.state.calendar||{}; const view=S.view||'month'; const me=DATA.me||{email:"",role:""}; const isAdmin=me.role==="Admin"; const ym=S.ym||new Date().toISOString().slice(0,7); const [year,month]=ym.split('-').map(n=>parseInt(n,10));
  const first=new Date(year,month-1,1); const startDow=(first.getDay()+6)%7; const days=new Date(year,month,0).getDate();
  const filtered=(DATA.calendar||[]).filter(e=> (S.filterUsers==="ALL"||e.ownerEmail===S.filterUsers) ); const inMonth=filtered.filter(e=>e.startISO.slice(0,7)===ym);
  const ownerFilter = isAdmin ? `<select id="cal-owner-filter" class="input" style="width:auto"><option value="ALL" ${S.filterUsers==="ALL"?'selected':''}>All users</option>${DATA.users.map(u=>`<option value="${u.email}" ${S.filterUsers===u.email?'selected':''}>${u.name}</option>`).join("")}</select>` : "";
  const selDate=S.selectedDate||new Date().toISOString().slice(0,10);
  function cell(day){const dateStr=`${ym}-${String(day).padStart(2,'0')}`; const evs=inMonth.filter(e=>e.startISO.slice(0,10)===dateStr); const chips=evs.map(e=>`<div class="cal-ev" data-act="openEvent" data-arg="${e.id}"><span class="cal-ev-dot"></span><span class="cal-ev-title">${esc(e.title)}</span></div>`).join(""); return `<div class="cal-cell"><div class="muted" style="font-weight:700">${day}</div>${chips}</div>`;}
  const blanks = Array.from({length:startDow}).map(()=>`<div class="cal-cell"></div>`).join(""); const daysHtml = Array.from({length:days}).map((_,i)=>cell(i+1)).join("");
  const monthGrid=`<div class="cal"><div class="cal-head"><div class="muted">${year}-${String(month).padStart(2,'0')}</div><div class="sp"></div>${ownerFilter}<div class="sp"></div><div><button class="btn light" data-act="prevMonth">◀</button><button class="btn light" data-act="today">Today</button><button class="btn light" data-act="nextMonth">▶</button><button class="btn" data-act="agendaView">Agenda</button></div></div><div class="cal-dow"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div></div><div class="cal-grid">${blanks}${daysHtml}</div></div>`;
  const agendaRows=filtered.filter(e=>e.startISO.slice(0,7)===ym).sort((a,b)=>a.startISO.localeCompare(b.startISO)).map(e=>{const d=new Date(e.startISO), end=new Date(e.endISO); return `<tr><td>${d.toLocaleDateString()}</td><td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td data-act="openEvent" data-arg="${e.id}"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Edit</button> ${esc(e.title)}</td><td>${esc(e.location||'')}</td><td>${esc(e.ownerName||e.ownerEmail||'')}</td><td class="right"><button class="btn light" data-act="deleteEvent" data-arg="${e.id}">Delete</button></td></tr>`;}).join("") || '<tr><td colspan="6" class="muted">No events</td></tr>';
  const agenda=`<div class="card"><h3 class="section-title">Agenda</h3><table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${agendaRows}</tbody></table><div class="right" style="margin-top:8px"><button class="btn" data-act="monthView">Month</button></div></div>`;
  const form=`<div class="card"><h3 class="section-title">Add ${isAdmin?"Event (any user)":"My Event"}</h3><div class="grid cols-3"><div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div><div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div><div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div><div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div><div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div><div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div><div><label>Case (optional)</label><select class="input" id="ev-case"><option value="">— None —</option>${DATA.cases.map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${esc(cs.title)}</option>`).join("")}</select></div>${isAdmin?`<div><label>Owner</label><select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===me.email?'selected':''}>${u.name}</option>`).join("")}</select></div>`:""}</div><div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Add Event</button></div></div>`;
  return Shell((view==='month'?monthGrid:agenda) + form,'calendar');
}

// modal, routing, events, boot — same logic as stable7

function Modal(){
  const id=App.state.modalEventId; if(!id) return ""; const ev=(DATA.calendar||[]).find(e=>e.id===id); if(!ev) return "";
  const me=DATA.me||{email:"",role:""}; const isAdmin=me.role==="Admin"; const canEdit=isAdmin||me.email===ev.ownerEmail;
  const date=(ev.startISO||"").slice(0,10), start=(ev.startISO||"").slice(11,16), end=(ev.endISO||"").slice(11,16);
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="md-ev-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===ev.ownerEmail?'selected':''}>${u.name} (${u.role})</option>`).join("")}</select></div>` : "";
  const caseSelect = `<div><label>Case (optional)</label><select class="input" id="md-ev-case"><option value="">— None —</option>${DATA.cases.map(cs=>`<option value="${cs.id}" ${cs.id===(ev.caseId||'')?'selected':''}>${cs.fileNumber} — ${esc(cs.title)}</option>`).join("")}</select></div>`;
  return `<div class="modal-backdrop" data-act="modalCloseBackdrop"><div class="modal"><div class="modal-head"><div class="modal-title">Edit Event</div><button class="modal-x" data-act="modalClose">×</button></div><div class="modal-body"><div class="grid cols-3"><div><label>Title</label><input class="input" id="md-ev-title" value="${esc(ev.title||'')}"></div><div><label>Date</label><input class="input" id="md-ev-date" type="date" value="${date}"></div><div><label>Type</label><select class="input" id="md-ev-type"><option ${ev.type==='Appointment'?'selected':''}>Appointment</option><option ${ev.type==='Note'?'selected':''}>Note</option></select></div><div><label>Start</label><input class="input" id="md-ev-start" type="time" value="${start}"></div><div><label>End</label><input class="input" id="md-ev-end" type="time" value="${end}"></div><div><label>Location</label><input class="input" id="md-ev-loc" value="${esc(ev.location||'')}"></div>${caseSelect}${ownerSelect}</div></div><div class="modal-foot"><button class="btn light" data-act="modalClose">Close</button>${canEdit?`<button class="btn danger" data-act="modalDeleteEvent" data-arg="${ev.id}">Delete</button>`:""}${canEdit?`<button class="btn" data-act="modalSaveEvent" data-arg="${ev.id}">Save</button>`:""}</div></div></div>`;
}

/* render */
function viewFor(route){
  if(route==='dashboard') return Dashboard();
  if(route==='calendar') return Calendar();
  if(route==='cases') return Cases();
  if(route.startsWith('case:')) return CasePage(route.split(':')[1]);
  if(route==='companies') return Companies();
  if(route.startsWith('company:')) return CompanyPage(route.split(':')[1]);
  if(route==='contacts') return Contacts();
  if(route==='documents') return Documents();
  if(route==='resources') return Resources();
  if(route==='admin') return Admin();
  return `<div class="card">Unknown route</div>`;
}
function render(){ App.el.innerHTML=viewFor(App.state.route); }

/* events */
document.addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return; const act=t.getAttribute('data-act'); const arg=t.getAttribute('data-arg');
  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='tab'){ const [scope,key]=(arg||'dashboard:overview').split(':'); App.state.tabs[scope]=key; App.set({}); return; }
  if(act==='openCase'){ App.set({route:'case:'+arg}); return; }
  if(act==='openCompany'){ App.set({route:'company:'+arg}); return; }
  // calendar nav
  if(act==='prevMonth'||act==='nextMonth'||act==='today'||act==='agendaView'||act==='monthView'){
    const S=Object.assign({},App.state.calendar);
    const d=new Date((S.ym||new Date().toISOString().slice(0,7))+'-01T00:00:00');
    if(act==='prevMonth') d.setMonth(d.getMonth()-1);
    if(act==='nextMonth') d.setMonth(d.getMonth()+1);
    if(act==='today'){ const now=new Date(); S.ym=now.toISOString().slice(0,7); S.selectedDate=now.toISOString().slice(0,10); S.view='month'; App.set({calendar:S}); return; }
    if(act==='agendaView'){ S.view='agenda'; App.set({calendar:S}); return; }
    if(act==='monthView'){ S.view='month'; App.set({calendar:S}); return; }
    S.ym=d.toISOString().slice(0,7); App.set({calendar:S}); return;
  }
  // calendar CRUD
  if(act==='createEvent'){
    const me=DATA.me||{email:"",role:""}; const isAdmin=me.role==='Admin';
    const title=($('#ev-title')||{}).value||'Untitled';
    const date=($('#ev-date')||{}).value||new Date().toISOString().slice(0,10);
    const start=($('#ev-start')||{}).value||'09:00';
    const end=($('#ev-end')||{}).value||'10:00';
    const loc=($('#ev-loc')||{}).value||'';
    const type=($('#ev-type')||{}).value||'Appointment';
    const owner=(isAdmin? (($('#ev-owner')||{}).value||me.email): me.email);
    const ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner;
    const caseId=(($('#ev-case')||{}).value)||'';
    const ev={id:uid(),title,description:'',startISO:date+'T'+start+':00',endISO:date+'T'+end+':00',ownerEmail:owner,ownerName,location:loc,type,caseId};
    DATA.calendar.push(ev); saveData(); pushCalNotification('created',ev); alert('Event added'); App.set({});
    return;
  }
  if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return; App.state.modalEventId=ev.id; App.set({}); return; }
  if(act==='modalClose'){ App.state.modalEventId=null; App.set({}); return; }
  if(act==='modalCloseBackdrop'){ if(e.target && e.target.getAttribute('data-act')==='modalCloseBackdrop'){ App.state.modalEventId=null; App.set({}); } return; }
  if(act==='modalSaveEvent'){
    const id=arg; const ev=(DATA.calendar||[]).find(e=>e.id===id); if(!ev) return;
    const me=DATA.me||{email:'',role:''}; if(!(me.role==='Admin'||me.email===ev.ownerEmail)){ alert('No permission to edit'); return; }
    const title=($('#md-ev-title')||{}).value||ev.title;
    const date=($('#md-ev-date')||{}).value||ev.startISO.slice(0,10);
    const start=($('#md-ev-start')||{}).value||ev.startISO.slice(11,16);
    const end=($('#md-ev-end')||{}).value||ev.endISO.slice(11,16);
    const loc=($('#md-ev-loc')||{}).value||ev.location||'';
    const type=($('#md-ev-type')||{}).value||ev.type||'Appointment';
    const owner=(me.role==='Admin'?(($('#md-ev-owner')||{}).value||ev.ownerEmail):ev.ownerEmail);
    const ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner;
    const caseId=(($('#md-ev-case')||{}).value||ev.caseId||'');
    ev.title=title; ev.startISO=date+'T'+start+':00'; ev.endISO=date+'T'+end+':00'; ev.location=loc; ev.type=type; ev.ownerEmail=owner; ev.ownerName=ownerName; ev.caseId=caseId;
    pushCalNotification('updated',ev); App.state.modalEventId=null; saveData(); App.set({});
    return;
  }
  if(act==='modalDeleteEvent'){
    const id=arg; const ev=(DATA.calendar||[]).find(e=>e.id===id); const me=DATA.me||{email:'',role:''};
    if(!(me.role==='Admin'||(ev&&me.email===ev.ownerEmail))){ alert('No permission to delete'); return; }
    DATA.calendar=(DATA.calendar||[]).filter(e=>e.id!==id);
    if(ev) pushCalNotification('deleted',ev);
    App.state.modalEventId=null; saveData(); App.set({}); return;
  }
  if(act==='deleteEvent'){
    const ev=(DATA.calendar||[]).find(e=>e.id===arg); const me=DATA.me||{email:'',role:''};
    if(!(me.role==='Admin'||(ev&&me.email===ev.ownerEmail))){ alert('No permission to delete'); return; }
    DATA.calendar=(DATA.calendar||[]).filter(e=>e.id!==arg);
    if(ev) pushCalNotification('deleted',ev); saveData(); App.set({}); return;
  }
  // notifications
  if(act==='markNotifsRead'){ (App.state.notifications||[]).forEach(n=>n.read=true); App.state.notificationsUnread=0; try{localStorage.setItem('synergy_notifs',JSON.stringify(App.state.notifications)); localStorage.setItem('synergy_notifs_unread','0');}catch(_){ } App.set({}); return; }
  if(act==='openNotif'){ const it=(App.state.notifications||[]).find(n=>n.id===arg); if(it){ it.read=true; App.state.notificationsUnread=Math.max(0,(App.state.notificationsUnread||0)-1); try{localStorage.setItem('synergy_notifs',JSON.stringify(App.state.notifications)); localStorage.setItem('synergy_notifs_unread',String(App.state.notificationsUnread));}catch(_){ } if(it.startISO){ const d=new Date(it.startISO); const ym=d.toISOString().slice(0,7); App.state.calendar=Object.assign({},App.state.calendar,{ym,selectedDate:d.toISOString().slice(0,10),view:'agenda'}); } App.set({route:'calendar'}); } return; }
  if(act==='readNotif'){ const it=(App.state.notifications||[]).find(n=>n.id===arg); if(it&&!it.read){ it.read=true; App.state.notificationsUnread=Math.max(0,(App.state.notificationsUnread||0)-1); try{localStorage.setItem('synergy_notifs',JSON.stringify(App.state.notifications)); localStorage.setItem('synergy_notifs_unread',String(App.state.notificationsUnread));}catch(_){ } App.set({}); } return; }
  if(act==='notifShowAll'){ App.state.notificationsShowAll=true; App.set({}); return; }
  if(act==='notifShowUnread'){ App.state.notificationsShowAll=false; App.set({}); return; }
  // impersonation
  if(act==='impersonate'){ const u=DATA.users.find(x=>x.email===arg); if(!u){ alert('User not found'); return; } DATA.me={name:u.name,email:u.email,role:u.role}; try{localStorage.setItem('synergy_me',JSON.stringify(DATA.me));}catch(_){ } alert('Now acting as '+u.name+' ('+u.role+')'); App.set({}); return; }
  if(act==='clearImpersonation'){ const admin=DATA.users.find(x=>x.role==='Admin')||{name:'Admin',email:'admin@synergy.com',role:'Admin'}; DATA.me={name:admin.name,email:admin.email,role:admin.role}; try{localStorage.removeItem('synergy_me');}catch(_){ } alert('Switched back to Admin'); App.set({}); return; }
  if(act==='gotoNotifications'){ App.state.tabs.dashboard='overview'; App.set({route:'dashboard'}); return; }
});

document.addEventListener('change', e=>{ if(e.target && e.target.id==='cal-owner-filter'){ const S=App.state.calendar||{}; S.filterUsers=e.target.value||"ALL"; App.set({calendar:S}); } });

/* boot */
document.addEventListener('DOMContentLoaded', ()=>{
  try{ const raw=localStorage.getItem('synergy_me'); if(raw){ const me=JSON.parse(raw); if(me&&me.email){ DATA.me=me; } } }catch(_){ }
  try{ const ns=JSON.parse(localStorage.getItem('synergy_notifs')||'[]'); App.state.notifications=ns; App.state.notificationsUnread=(ns.filter(n=>!n.read)).length; }catch(_){ App.state.notifications=[]; App.state.notificationsUnread=0; }
  loadData(); render();
});
