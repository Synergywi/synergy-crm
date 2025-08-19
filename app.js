
(function(){
"use strict";
const VERSION="v2.16.0"; const BUILD="Soft Stable"; const STAMP=(new Date()).toISOString();
const uid=()=> "id-"+Math.random().toString(36).slice(2,9);
const todayYMD=()=> (new Date()).toISOString().slice(0,10);
const fmtHM=s=> (s? s : "");
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

const KEY="synergy_store_"+VERSION;
function load(){ try{const t=localStorage.getItem(KEY); return t?JSON.parse(t):null;}catch(_){return null;} }
function save(){ try{localStorage.setItem(KEY, JSON.stringify(DATA));}catch(_){} }

function mkCase(y,seq,p){ let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b; }

function seed(){
  const users=[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ];
  const companies=[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",folders:{General:[]}}
  ];
  const cases=[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review"})
  ];
  const events=[
    {id:uid(), title:"Interview planning",  date: YEAR+"-08-06", start:"10:00", end:"11:00", type:"Appointment", location:"Room 3", caseId: cases[2].id, owner:"alex@synergy.com", updatedAt: STAMP},
    {id:uid(), title:"Evidence review",     date: YEAR+"-08-13", start:"14:00", end:"15:30", type:"Appointment", location:"War room", caseId: cases[4].id, owner:"chris@synergy.com", updatedAt: STAMP},
    {id:uid(), title:"Draft report sync",   date: YEAR+"-08-22", start:"14:00", end:"14:45", type:"Appointment", location:"HQ",       caseId: null,           owner:"priya@synergy.com", updatedAt: STAMP}
  ];
  return { me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}, users, companies, contacts:[
      {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001"},
      {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003"},
      {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002"}
    ], cases, events, notifications:{items:[], showUnreadOnly:false} };
}

const DATA = load() || seed();

function addNotif(kind, ev){ DATA.notifications.items.unshift({id:uid(), when:new Date().toISOString(), action:kind, title:ev.title, eventId:ev.id, unread:true}); }

const App={
  state:{route:"dashboard", caseId:null, cal:{year:(new Date()).getFullYear(), month:(new Date()).getMonth()}, caseTab:"Details", calOwner:"all"},
  set(p){ Object.assign(this.state,p||{}); render(); save(); },
  me(){ return DATA.me || {role:"Admin"}; }
};

function Topbar(){
  const isAdmin = App.me().role==="Admin";
  const unread = (DATA.notifications.items||[]).filter(n=>!n.read).length;
  const bell = isAdmin ? (`<button class="icon" title="Notifications" data-act="openNotifs">${(window.Toolbar?Toolbar.icon('bell'):'🔔')}${unread?`<span class="badge-dot">${unread}</span>`:''}</button> `) : '';
  return `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>${bell}<span class="badge">${BUILD} ${VERSION}</span></div>`;
}
function Sidebar(active){
  const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">${items.map(([r,l])=>`<li ${active===r?'class="active"':''} data-act="route" data-arg="${r}">${l}</li>`).join('')}</ul></aside>`;
}
function Shell(content,active){ return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${VERSION})</div>`; }

function notifTable(onlyUnread){
  const list=(DATA.notifications.items||[]).slice().sort((a,b)=>String(b.when).localeCompare(String(a.when)));
  const rows=(onlyUnread?list.filter(n=>!n.read):list).map(n=>`<tr>
    <td class="mono">${n.when.replace('T',' ').slice(0,16)}</td>
    <td>${n.action}</td><td>${n.title}</td>
    <td class="right">
      <button class="btn light" data-act="openFromNotif" data-arg="${n.eventId}">Open</button>
      <button class="btn light" data-act="dismissNotif" data-arg="${n.id}">Dismiss</button>
    </td>
  </tr>`).join('');
  return rows || `<tr><td colspan="4" class="muted">No notifications</td></tr>`;
}
function Dashboard(){
  let rows = DATA.cases.slice(0,6).map(c=>`<tr>
    <td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td>
    <td><span class="chip status-${c.status.replace(/ /g,"\\ ")}">${c.status}</span></td>
    <td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td>
  </tr>`).join('');
  if(!rows) rows = `<tr><td colspan="5" class="muted">No cases</td></tr>`;
  const tbl = `<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  const notif = `<div class="card">
    <div style="display:flex;align-items:center;gap:8px"><h3>Calendar updates (Admin)</h3><div class="sp"></div>
      <button class="btn light" data-act="showUnread">Show unread</button> <button class="btn light" data-act="markAllRead">Mark all read</button>
    </div>
    <table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>${notifTable()}</tbody></table>
  </div>`;
  return Shell(`<div class="card"><h3>Welcome</h3><div class="mono">Timestamp: ${STAMP}</div></div>
  <div class="section"><header><h3 class="section-title">Active Cases</h3></header>${tbl}</div>${notif}`, 'dashboard');
}

// Calendar helpers
function monthMatrix(y,m){const f=new Date(y,m,1);const s=new Date(f);s.setDate(f.getDate()-((f.getDay()+6)%7));const cells=[];for(let i=0;i<42;i++){const d=new Date(s);d.setDate(s.getDate()+i);cells.push(d)}return cells;}
function Calendar(){
  const y=App.state.cal.year, m=App.state.cal.month;
  const matrix=monthMatrix(y,m);
  const me=App.me(), isAdmin=me.role==="Admin";
  const owner= isAdmin ? (App.state.calOwner || 'all') : (me.email||'');
  const evs = DATA.events.filter(e=>{
    if(isAdmin){ if(owner!=='all' && e.owner!==owner) return false; } else { if(e.owner!==owner) return false; }
    const dt=new Date(e.date); return dt.getMonth()===m && dt.getFullYear()===y;
  });
  const by = evs.reduce((a,e)=>{(a[e.date]=a[e.date]||[]).push(e); return a;},{});
  let grid=''; for(const d of matrix){ const ymd=d.toISOString().slice(0,10); const other=d.getMonth()!==m; grid+=`<div class="day${other?' muted':''}"><div class="num">${d.getDate()}</div>`; (by[ymd]||[]).forEach(ev=>{ grid+=`<span class="ev${ev.type==='Note'?' note':''}" data-act="openEvent" data-arg="${ev.id}" title="${ev.title}">${ev.title}</span>`; }); grid+='</div>'; }
  const ownerOpts = isAdmin
    ? ['<option value="all">All users</option>'].concat(DATA.users.map(u=>`<option value="${u.email}" ${(owner===u.email?'selected':'')}>${u.name}</option>`)).join('')
    : `<option value="${owner}" selected>${(DATA.users.find(u=>u.email===owner)||{name:owner}).name||owner}</option>`;
  const addForm = `<div class="section"><header><h3 class="section-title">Add Event</h3></header>
    <div class="grid cols-6">
      <input class="input" id="ev-title" placeholder="Title">
      <input class="input" id="ev-date" type="date" value="${todayYMD()}">
      <input class="input" id="ev-start" type="time">
      <input class="input" id="ev-end" type="time">
      <select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select>
      <input class="input" id="ev-loc" placeholder="Location">
      <select class="input" id="ev-case"><option value="">(Optional) Link to case</option>${DATA.cases.map(c=>`<option value="${c.id}">${c.fileNumber} — ${c.title}</option>`).join('')}</select>
      ${isAdmin ? `<select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}">${u.name}</option>`).join('')}</select>` : `<input class="input" id="ev-owner" value="${owner}" readonly>`}
    </div>
    <div class="right" style="margin-top:8px"><button class="btn" data-act="addEvent">Add Event</button></div>
  </div>`;
  const head = `<div class="section"><header><h3 class="section-title">Calendar</h3><div class="sp"></div>
    <button class="btn light" data-act="prevMonth">◀</button> <button class="btn light" data-act="today">Today</button> <button class="btn light" data-act="nextMonth">▶</button>
    <span style="width:16px"></span><select class="input" id="owner-filter">${ownerOpts}</select></header></div>`;
  return Shell(head+`<div class="calendar-grid">${grid}</div>`+addForm+`<div id="modal-root"></div>`, 'calendar');
}

function eventModal(ev){
  const caseOpts = ['<option value="">(no case)</option>'].concat(DATA.cases.map(c=>`<option value="${c.id}" ${(ev.caseId===c.id?'selected':'')}>${c.fileNumber} — ${c.title}</option>`)).join('');
  const ownerOpts = DATA.users.map(u=>`<option value="${u.email}" ${(ev.owner===u.email?'selected':'')}>${u.name}</option>`).join('');
  return `<div class="modal"><div class="modal-card">
    <h3>Edit Event</h3>
    <div class="grid cols-2">
      <label>Title <input class="input" id="ed-title" value="${ev.title||''}"></label>
      <label>Date  <input class="input" id="ed-date"  type="date" value="${ev.date||''}"></label>
      <label>Start <input class="input" id="ed-start" type="time" value="${ev.start||''}"></label>
      <label>End   <input class="input" id="ed-end"   type="time" value="${ev.end||''}"></label>
      <label>Type  <select class="input" id="ed-type"><option${ev.type==='Appointment'?' selected':''}>Appointment</option><option${ev.type==='Note'?' selected':''}>Note</option></select></label>
      <label>Location <input class="input" id="ed-loc" value="${ev.location||''}"></label>
      <label style="grid-column:span 2">Case <select class="input" id="ed-case">${caseOpts}</select></label>
      <label style="grid-column:span 2">Owner <select class="input" id="ed-owner">${ownerOpts}</select></label>
    </div>
    <div class="right" style="margin-top:12px">
      <button class="btn danger" data-act="deleteEvent" data-arg="${ev.id}">Delete</button>
      <button class="btn light" data-act="closeModal">Cancel</button>
      <button class="btn" data-act="saveEvent" data-arg="${ev.id}">Save</button>
    </div>
  </div></div>`;
}

function Cases(){
  const rows = DATA.cases.map(cc=>`<tr>
    <td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td>
    <td><span class="chip status-${cc.status.replace(/ /g,"\\ ")}">${cc.status}</span></td>
    <td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td>
  </tr>`).join('');
  return Shell(`<div class="section"><header><h3 class="section-title">Cases</h3></header>
    <table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, 'cases');
}

function CasePage(){
  const id=App.state.caseId; const cs=DATA.cases.find(c=>c.id===id); if(!cs) return Shell('<div class="card">Case not found</div>','cases');
  const tab=App.state.caseTab||"Details"; const tabs=["Details","Notes","Tasks","Documents","People","Calendar"];
  const tabsHtml = tabs.map(t=>`<button class="btn ${t===tab?'':'light'}" data-act="caseTab" data-arg="${t}">${t}</button>`).join(' ');

  const invOpts=DATA.users.map(u=>`<option ${u.email===cs.investigatorEmail?'selected':''} value="${u.email}">${u.name} (${u.role})</option>`).join('');
  const coOpts=DATA.companies.map(co=>`<option ${co.id===cs.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join('');
  const details = `<div class="grid cols-2">
    <div><label>Case ID</label><input class="input" id="c-id" value="${cs.fileNumber||''}"></div>
    <div><label>Organisation (display)</label><input class="input" id="c-org" value="${cs.organisation||''}"></div>
    <div><label>Title</label><input class="input" id="c-title" value="${cs.title||''}"></div>
    <div><label>Company</label><select class="input" id="c-company">${coOpts}</select></div>
    <div><label>Investigator</label><select class="input" id="c-inv">${invOpts}</select></div>
    <div><label>Status</label><input class="input" id="c-status" value="${cs.status||''}"></div>
    <div><label>Priority</label><input class="input" id="c-priority" value="${cs.priority||''}"></div>
  </div>`;

  const notesRows = (cs.notes||[]).map(nn=>`<tr><td>${nn.time}</td><td>${nn.by}</td><td>${nn.text}</td></tr>`).join('') || `<tr><td colspan="3" class="muted">No notes yet.</td></tr>`;
  const notes = `<textarea class="input" id="note-text" placeholder="Type your note here"></textarea>
  <div class="right" style="margin-top:6px"><button class="btn light" data-act="addNote" data-arg="${id}">Add Note</button></div>
  <table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>${notesRows}</tbody></table>`;

  const taskRows = (cs.tasks||[]).map(t=>`<tr><td>${t.id}</td><td>${t.title}</td><td>${t.assignee}</td><td>${t.due}</td><td>${t.status}</td></tr>`).join('') || `<tr><td colspan="5" class="muted">No tasks yet.</td></tr>`;
  const invNames = DATA.users.filter(u=>u.role!=="Admin").map(u=>`<option>${u.name}</option>`).join('');
  const tasks = `<div class="grid cols-3">
    <input class="input" id="task-title" placeholder="Task title">
    <input class="input" id="task-due" type="date">
    <select class="input" id="task-assignee">${invNames}</select>
  </div>
  <div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="${id}">Add</button> <button class="btn light" data-act="addStdTasks" data-arg="${id}">Add standard tasks</button></div>
  <table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${taskRows}</tbody></table>`;

  if(!cs.folders) cs.folders={General:[]};
  let docRows=''; for(const fname in cs.folders){ const files=cs.folders[fname]; docRows+=`<tr><th colspan="3">${fname}</th></tr>`; if(!files.length){docRows+=`<tr><td colspan="3" class="muted">No files</td></tr>`;} }
  const docs = `<div class="muted">Upload/preview supported in later pass.</div><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${docRows}</tbody></table>`;

  const people = `<div class="muted">Link/unlink contacts from company in later pass.</div>`;

  const caseEvents = DATA.events.filter(e=>e.caseId===id).sort((a,b)=>a.date.localeCompare(b.date));
  const evRows = (caseEvents.map(e=>`<tr>
    <td class="mono">${e.date}</td><td>${fmtHM(e.start)}${e.end?`–${fmtHM(e.end)}`:''}</td><td>${e.title}</td><td>${e.type||''}</td>
    <td>${(DATA.users.find(u=>u.email===e.owner)||{name:e.owner}).name}</td><td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Edit</button></td>
  </tr>`).join('')) || `<tr><td colspan="6" class="muted">No events linked to this case.</td></tr>`;
  const ownerOpts = DATA.users.map(u=>`<option value="${u.email}" ${(u.email===cs.investigatorEmail?'selected':'')}>${u.name}</option>`).join('');
  const caseCal = `<div class="card"><h3>Case Calendar</h3>
    <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Type</th><th>Owner</th><th></th></tr></thead><tbody>${evRows}</tbody></table></div>
    <div class="card"><h4>Add case event</h4>
      <div class="grid cols-4">
        <div><label>Title</label><input class="input" id="cc-title"></div>
        <div><label>Date</label><input class="input" id="cc-date" type="date" value="${todayYMD()}"></div>
        <div><label>Start</label><input class="input" id="cc-start" type="time"></div>
        <div><label>End</label><input class="input" id="cc-end" type="time"></div>
        <div><label>Type</label><select class="input" id="cc-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Location</label><input class="input" id="cc-loc"></div>
        <div><label>Owner</label><select class="input" id="cc-owner">${ownerOpts}</select></div>
      </div>
      <div class="right" style="margin-top:6px"><button class="btn" data-act="addCaseEvent" data-arg="${id}">Add case event</button></div>
    </div>`;

  const body = (tab==="Details")?details:(tab==="Notes")?notes:(tab==="Tasks")?tasks:(tab==="Documents")?docs:(tab==="People")?people:caseCal;

  const header = `<div class="card"><div style="display:flex;align-items:center;gap:8px">
    <h2>Case ${cs.fileNumber}</h2><div class="sp"></div>
    <button class="btn" data-act="saveCase" data-arg="${id}">Save Case</button>
    <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button>
  </div><div style="margin-top:8px">${tabsHtml}</div></div>`;

  return Shell(header+`<div class="section">${body}</div>`, 'cases');
}

function Contacts(){ let rows=''; for(const c of DATA.contacts){ rows+=`<tr><td>${c.name}</td><td>${c.email}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`; } return Shell(`<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'contacts'); }
function ContactPage(){ const id=App.state.contactId; const c=DATA.contacts.find(x=>x.id===id); if(!c) return Shell('<div class="card">Contact not found</div>','contacts'); const html=`<div class="card"><div style="display:flex;gap:8px;align-items:center"><h2>Contact</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="contacts">Back</button></div><div class="grid cols-4" style="margin-top:10px"><div><label>Name</label><input class="input" id="ct-name" value="${c.name||''}"></div><div><label>Email</label><input class="input" id="ct-email" value="${c.email||''}"></div></div></div>`; return Shell(html,'contacts'); }
function Companies(){ let rows=''; for(const co of DATA.companies){ const caseCount=DATA.cases.filter(c=>c.companyId===co.id).length; rows+=`<tr><td>${co.id}</td><td>${co.name}</td><td>${caseCount}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`; } return Shell(`<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th><th>Cases</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'companies'); }
function CompanyPage(){ const id=App.state.companyId; const co=DATA.companies.find(c=>c.id===id); if(!co) return Shell('<div class="card">Company not found</div>','companies'); const cs=DATA.cases.filter(x=>x.companyId===id).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.title}</td><td><span class="chip status-${c.status.replace(/ /g,"\\ ")}">${c.status}</span></td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join(''); const contacts=DATA.contacts.filter(x=>x.companyId===id).map(k=>`<li>${k.name} — ${k.email}</li>`).join('')||'<li class="muted">No contacts</li>'; const html=`<div class="section"><header><h3 class="section-title">${co.name}</h3></header><div class="grid cols-2"><div class="card"><h3>Recent cases</h3><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${cs}</tbody></table></div><div class="card"><h3>Company Contacts</h3><ul>${contacts}</ul></div></div></div>`; return Shell(html,'companies'); }
function Documents(){ let rows=''; for(const c of DATA.cases){ let count=0; for(const k in c.folders){ count+=c.folders[k].length; } rows+=`<tr><td>${c.fileNumber}</td><td>${count}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open Case</button></td></tr>`; } return Shell(`<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'documents'); }
function Resources(){ return Shell('<div class="section"><header><h3 class="section-title">Resources</h3></header><div class="muted">Links / FAQs / Guides</div></div>','resources'); }
function Admin(){ let rows=''; for(const u of DATA.users){ rows+=`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`; } return Shell(`<div class="section"><header><h3 class="section-title">Users</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table></div>`,'admin'); }

function render(){
  const r=App.state.route, el=document.getElementById('app');
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='calendar') el.innerHTML=Calendar();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage();
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='contact') el.innerHTML=ContactPage();
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='company') el.innerHTML=CompanyPage();
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else if(r==='admin') el.innerHTML=Admin();
  else el.innerHTML=Dashboard();
}

document.addEventListener('click', e=>{
  let t=e.target; while(t&&t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({route:'case', caseId:arg, caseTab:'Details'}); return; }
  if(act==='openContact'){ App.set({route:'contact', contactId:arg}); return; }
  if(act==='openCompany'){ App.set({route:'company', companyId:arg}); return; }

  if(act==='caseTab'){ App.set({caseTab:arg}); return; }
  if(act==='saveCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return;
    const gv=id=>{const el=document.getElementById(id); return el?el.value:null;};
    cs.fileNumber=gv('c-id')||cs.fileNumber; cs.organisation=gv('c-org')||cs.organisation; cs.title=gv('c-title')||cs.title;
    cs.companyId=gv('c-company')||cs.companyId; const inv=gv('c-inv'); if(inv){ cs.investigatorEmail=inv; const u=DATA.users.find(x=>x.email===inv); cs.investigatorName=u?u.name:""; }
    cs.status=gv('c-status')||cs.status; cs.priority=gv('c-priority')||cs.priority; save(); alert("Case saved"); return;
  }
  if(act==='addNote'){ const id=App.state.caseId; const cs=DATA.cases.find(c=>c.id===id); if(!cs) return; const txt=(document.getElementById('note-text')||{}).value||""; if(!txt){alert("Enter a note"); return;} cs.notes.unshift({time:new Date().toISOString().replace('T',' ').slice(0,16), by:App.me().email, text:txt}); App.set({}); return; }
  if(act==='addTask'){ const id=App.state.caseId; const cs=DATA.cases.find(c=>c.id===id); if(!cs) return; const tt=document.getElementById('task-title').value; const dd=document.getElementById('task-due').value; const aa=document.getElementById('task-assignee').value; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:tt,assignee:aa,due:dd,status:'Open'}); App.set({}); return; }
  if(act==='addStdTasks'){ const id=App.state.caseId; const cs=DATA.cases.find(c=>c.id===id); if(!cs) return; ["Gather documents","Interview complainant","Interview respondent","Write report"].forEach(s=>cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:s,assignee:cs.investigatorName,due:"",status:"Open"})); App.set({}); return; }

  if(act==='prevMonth'){ const m=App.state.cal.month-1; const d=new Date(App.state.cal.year,m,1); App.set({cal:{year:d.getFullYear(),month:d.getMonth()}}); return; }
  if(act==='nextMonth'){ const m=App.state.cal.month+1; const d=new Date(App.state.cal.year,m,1); App.set({cal:{year:d.getFullYear(),month:d.getMonth()}}); return; }
  if(act==='today'){ const d=new Date(); App.set({cal:{year:d.getFullYear(),month:d.getMonth()}}); return; }

  if(act==='addEvent'){
    const me=App.me(); const isAdmin=me.role==="Admin";
    const ev={
      id:uid(),
      title:(document.getElementById('ev-title')||{}).value||'Untitled',
      date:(document.getElementById('ev-date')||{}).value,
      start:(document.getElementById('ev-start')||{}).value,
      end:(document.getElementById('ev-end')||{}).value,
      type:(document.getElementById('ev-type')||{}).value||'Appointment',
      location:(document.getElementById('ev-loc')||{}).value||'',
      caseId:(document.getElementById('ev-case')||{}).value||null,
      owner: isAdmin ? (document.getElementById('ev-owner')||{}).value : (me.email||''),
      updatedAt:new Date().toISOString()
    };
    DATA.events.push(ev); addNotif('created', ev); App.set({}); return;
  }
  if(act==='openEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(!ev) return; const host=document.getElementById('modal-root'); if(host) host.innerHTML=eventModal(ev); return; }
  if(act==='closeModal'){ const m=document.querySelector('.modal'); if(m) m.remove(); return; }
  if(act==='saveEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(!ev) return;
    ev.title=(document.getElementById('ed-title')||{}).value||ev.title;
    ev.date=(document.getElementById('ed-date')||{}).value||ev.date;
    ev.start=(document.getElementById('ed-start')||{}).value||ev.start;
    ev.end=(document.getElementById('ed-end')||{}).value||ev.end;
    ev.type=(document.getElementById('ed-type')||{}).value||ev.type;
    ev.location=(document.getElementById('ed-loc')||{}).value||ev.location;
    ev.caseId=(document.getElementById('ed-case')||{}).value||null;
    ev.owner=(document.getElementById('ed-owner')||{}).value||ev.owner;
    ev.updatedAt=new Date().toISOString(); addNotif('updated', ev);
    const mdom=document.querySelector('.modal'); if(mdom) mdom.remove(); App.set({}); return;
  }
  if(act==='deleteEvent'){ const i=DATA.events.findIndex(e=>e.id===arg); if(i===-1) return; const ev=DATA.events[i]; if(confirm('Delete this event?')){ DATA.events.splice(i,1); addNotif('deleted', ev); const mdom=document.querySelector('.modal'); if(mdom) mdom.remove(); App.set({}); } return; }

  if(act==='openNotifs'){ App.set({route:'dashboard'}); return; }
  if(act==='showUnread'){ DATA.notifications.showUnreadOnly=true; App.set({}); return; }
  if(act==='markAllRead'){ (DATA.notifications.items||[]).forEach(n=>n.unread=false); App.set({}); return; }
  if(act==='dismissNotif'){ DATA.notifications.items = (DATA.notifications.items||[]).map(n=>n.id===arg?({...n, unread:false}):n); App.set({}); return; }
  if(act==='openFromNotif'){ const ev=DATA.events.find(e=>e.id===arg); App.set({route:'calendar'}); if(ev){ setTimeout(()=>{ const host=document.getElementById('modal-root'); if(host) host.innerHTML=eventModal(ev); }, 50);} return; }

  if(act==='addCaseEvent'){
    const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return;
    const ev={ id:uid(),
      title:(document.getElementById('cc-title')||{}).value||'Untitled',
      date:(document.getElementById('cc-date')||{}).value,
      start:(document.getElementById('cc-start')||{}).value,
      end:(document.getElementById('cc-end')||{}).value,
      type:(document.getElementById('cc-type')||{}).value||'Appointment',
      location:(document.getElementById('cc-loc')||{}).value||'',
      caseId: cs.id,
      owner: (document.getElementById('cc-owner')||{}).value || cs.investigatorEmail || (App.me().email||''),
      updatedAt:new Date().toISOString()
    };
    DATA.events.push(ev); addNotif('created', ev); App.set({}); return;
  }
});

document.addEventListener('change', e=>{
  const t=e.target;
  if(t && t.id==='owner-filter'){ App.state.calOwner = t.value; App.set({}); }
  if(t && t.id==='cal-owner'){ App.state.calOwner = t.value; App.set({}); }
});

document.addEventListener('DOMContentLoaded', ()=>{ App.set({route:'dashboard'}); });
})();
