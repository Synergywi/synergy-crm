(function(){
"use strict";
const BUILD="v2.18.0-hs";
const STAMP = window.__STAMP__ || (new Date()).toISOString();
const EV_KEY="synergy_events_v4", CFG_KEY="synergy_settings_v1";

/* Helpers */
const uid=()=>"id-"+Math.random().toString(36).slice(2,9);
const ymd=d=>d.toISOString().slice(0,10);
const pad=n=>(""+n).padStart(2,"0");
const parseYMD=s=>{const [Y,M,D]=s.split("-").map(Number); return new Date(Y,M-1,D);};
const YEAR=(new Date()).getFullYear();

/* Seed */
function mkCase(y,seq,p){ let b={id:uid(),fileNumber:"INV-"+y+"-"+pad(seq),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+pad(((seq%12)||1)),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b; }
const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",city:"Perth",state:"WA",industry:"Mining",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",city:"Melbourne",state:"VIC",industry:"Public",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",city:"Brisbane",state:"QLD",industry:"Health",folders:{General:[]}}
  ],
  contacts:[
    {id:"P-1",name:"Alex Ng",email:"alex@synergy.com",phone:"0400 111 333",companyId:"C-001",notes:[]},
    {id:"P-2",name:"Priya Menon",email:"priya@synergy.com",phone:"0400 222 444",companyId:"C-003",notes:[]},
    {id:"P-3",name:"Chris Rice",email:"chris@synergy.com",phone:"0400 333 555",companyId:"C-002",notes:[]}
  ],
  cases:[
    mkCase(YEAR-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:(YEAR-1)+"-01"}),
    mkCase(YEAR-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:(YEAR-1)+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  documents:[
    {id:"D-1",title:"Investigation plan template",type:"doc",size:"52 KB",companyId:"",caseId:"",owner:"Admin",created:ymd(new Date(YEAR,6,1)),content:"Template body..."},
    {id:"D-2",title:"Interview guide (Sunrise)",type:"pdf",size:"128 KB",companyId:"C-001",caseId:"",owner:"Admin",created:ymd(new Date(YEAR,6,3)),content:""},
    {id:"D-3",title:"Evidence snapshot",type:"image",size:"420 KB",companyId:"",caseId:"",owner:"Admin",created:ymd(new Date(YEAR,6,10)),content:""}
  ],
  events:[],
  notifications:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// Restore / seed events
(function restoreEvents(){
  try{const raw=localStorage.getItem(EV_KEY); if(raw) DATA.events=JSON.parse(raw)||[];}catch(_){}
  if(!DATA.events.length){
    DATA.events=[
      {id:uid(), title:"Interview planning", date:`${YEAR}-08-06`, start:"09:00", end:"10:00", owner:"Admin", type:"Interview", caseId:null},
      {id:uid(), title:"Evidence review",   date:`${YEAR}-08-13`, start:"10:00", end:"12:00", owner:"Admin", type:"Evidence review", caseId:null},
      {id:uid(), title:"Client check-in",   date:`${YEAR}-08-19`, start:"11:00", end:"11:30", owner:"Admin", type:"Appointment", caseId:null},
      {id:uid(), title:"Admin all-hands",   date:`${YEAR}-08-26`, start:"15:00", end:"16:00", owner:"Admin", type:"Admin", caseId:null},
      {id:uid(), title:"Case intake - Sunrise", date:`${YEAR}-08-03`, start:"13:00", end:"14:00", owner:"Admin", type:"Risk", caseId:null}
    ];
    persistEvents();
  }
})();
function persistEvents(){ try{localStorage.setItem(EV_KEY, JSON.stringify(DATA.events));}catch(_){ } }

// Settings
const Settings={ load(){ try{ return JSON.parse(localStorage.getItem(CFG_KEY)||"{}"); }catch(_){return {};} },
  save(cfg){ try{ localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }catch(_){ } } };

// App State
const App={ state:{ route:"dashboard", currentMonth:(new Date()).toISOString().slice(0,7),
  currentCaseId:null, caseTab:"Details",
  currentCompanyId:null, companyTab:"Overview",
  currentContactId:null, contactTab:"Details",
  currentDocId:null, docTab:"Details" },
  set(p){ Object.assign(App.state,p||{}); render(); }, get(){ return DATA; }
};

// Shell
function Topbar(){ return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; }
function Sidebar(active){ const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let html='<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'; for(const it of items) html+='<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>'; html+='</ul></aside>'; return html; }
function Shell(content,active){ return Topbar() + '<div class="shell">' + Sidebar(active) + '<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

/* Dashboard */
function Dashboard(){ const d=DATA; let rows=d.cases.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join(''); return Shell('<div class="card"><div style="display:flex;gap:8px;align-items:center"><h3>Welcome</h3><div class="sp"></div><span class="mono">Build '+STAMP+'</span></div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case</th><th>Org</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','dashboard'); }

/* Cases */
function Cases(){ const d=DATA; const rows=d.cases.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Cases</h3><button class="btn" data-act="newCase">New Case</button></header><table><thead><tr><th>Case</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases'); }
function CasePage(id){ const cs=DATA.cases.find(x=>x.id===id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases'); const tabs=["Details","Notes","Tasks","Documents","Calendar"]; const tabBtns=tabs.map(t=>'<button class="btn '+(App.state.caseTab===t?'':'light')+'" data-act="caseTab" data-arg="'+t+'">'+t+'</button>').join(' '); let header='<div class="card"><div style="display:flex;align-items:center;gap:10px"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div><div class="tabbar">'+tabBtns+'</div><div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="cases">Back</button></div></div>'; let body=''; if(App.state.caseTab==="Details"){ body='<div class="card"><div class="grid cols-2"><div><label>Title</label><input id="c-title" class="input" value="'+(cs.title||'')+'"></div><div><label>Organisation</label><input id="c-org" class="input" value="'+(cs.organisation||'')+'"></div><div><label>Status</label><select id="c-status" class="input"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div><div><label>Priority</label><select id="c-priority" class="input"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div></div></div>'; } else if(App.state.caseTab==="Notes"){ const rows=(cs.notes||[]).map(n=>'<tr><td>'+n.time+'</td><td>'+n.by+'</td><td>'+n.text+'</td></tr>').join('')||'<tr><td colspan="3" class="muted">No notes</td></tr>'; body='<div class="section"><header><h3 class="section-title">Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add</button></header><textarea id="note-text" class="input" placeholder="Type note…"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.caseTab==="Tasks"){ let rows=(cs.tasks||[]).map(t=>'<tr><td>'+t.id+'</td><td>'+t.title+'</td><td>'+t.assignee+'</td><td>'+t.due+'</td><td>'+t.status+'</td></tr>').join('')||'<tr><td colspan="5" class="muted">No tasks</td></tr>'; const assignees=DATA.users.map(u=>'<option>'+u.name+'</option>').join(''); body='<div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input id="task-title" class="input" placeholder="Task title"><input id="task-due" class="input" type="date"><select id="task-assignee" class="input">'+assignees+'</select></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.caseTab==="Documents"){ const docs=DATA.documents.filter(d=>d.caseId===cs.id); const rows=docs.map(d=>'<tr><td>'+d.id+'</td><td>'+d.title+'</td><td>'+d.type+'</td><td>'+d.size+'</td><td class="right"><button class="btn light" data-act="openDoc" data-arg="'+d.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="5" class="muted">No linked documents</td></tr>'; body='<div class="section"><header><h3 class="section-title">Case Documents</h3></header><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Size</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.caseTab==="Calendar"){ const ev=DATA.events.filter(e=>e.caseId===cs.id); const items=ev.map(e=>'<div class="pill" data-act="openEvent" data-arg="'+e.id+'"><span class="dot" style="background:#0ea5e9"></span>'+e.title+' <span class="mono" style="font-size:11px">'+e.date+'</span></div>').join('')||'<div class="muted">No linked events</div>'; body='<div class="section"><header><h3 class="section-title">Case Events</h3></header>'+items+'</div>'; } return Shell(header+body,'cases'); }

/* Contacts */
function Contacts(){ const rows=DATA.contacts.map(p=>'<tr><td>'+p.name+'</td><td>'+p.email+'</td><td>'+p.companyId+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+p.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts'); }
function ContactPage(id){ const p=DATA.contacts.find(x=>x.id===id); if(!p) return Shell('<div class="card">Contact not found.</div>','contacts'); const tabs=["Details","Notes","Cases","Documents"]; const t=tabs.map(n=>'<button class="btn '+(App.state.contactTab===n?'':'light')+'" data-act="contactTab" data-arg="'+n+'">'+n+'</button>').join(' '); const header='<div class="card"><div style="display:flex;gap:8px;align-items:center"><h2>'+p.name+'</h2><div class="sp"></div><div class="tabbar">'+t+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="contacts">Back</button></div></div>'; let body=''; if(App.state.contactTab==="Details"){ body='<div class="card"><div class="grid cols-2"><div><label>Email</label><input class="input" value="'+p.email+'"></div><div><label>Phone</label><input class="input" value="'+(p.phone||"")+'"></div><div><label>Company</label><input class="input" value="'+p.companyId+'"></div></div></div>'; } else if(App.state.contactTab==="Notes"){ const rows=(p.notes||[]).map(n=>'<tr><td>'+n.time+'</td><td>'+n.by+'</td><td>'+n.text+'</td></tr>').join('')||'<tr><td colspan="3" class="muted">No notes</td></tr>'; body='<div class="section"><header><h3 class="section-title">Notes</h3><button class="btn light" data-act="addContactNote" data-arg="'+id+'">Add</button></header><textarea id="contact-note" class="input" placeholder="Type note…"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.contactTab==="Cases"){ const cs=DATA.cases.filter(c=>c.organisation && c.companyId===p.companyId); const rows=cs.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="4" class="muted">No cases</td></tr>'; body='<div class="section"><header><h3 class="section-title">Related Cases</h3></header><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.contactTab==="Documents"){ const docs=DATA.documents.filter(d=>d.companyId===p.companyId); const rows=docs.map(d=>'<tr><td>'+d.id+'</td><td>'+d.title+'</td><td>'+d.type+'</td><td class="right"><button class="btn light" data-act="openDoc" data-arg="'+d.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="4" class="muted">No docs</td></tr>'; body='<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } return Shell(header+body,'contacts'); }

/* Companies */
function Companies(){ const rows=DATA.companies.map(co=>'<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+co.city+'</td><td>'+co.state+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New</button></header><table><thead><tr><th>ID</th><th>Name</th><th>City</th><th>State</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies'); }
function CompanyPage(id){ const co=DATA.companies.find(x=>x.id===id); if(!co) return Shell('<div class="card">Company not found.</div>','companies'); const tabs=["Overview","Contacts","Cases","Documents"]; const t=tabs.map(n=>'<button class="btn '+(App.state.companyTab===n?'':'light')+'" data-act="companyTab" data-arg="'+n+'">'+n+'</button>').join(' '); const header='<div class="card"><div style="display:flex;gap:8px;align-items:center"><h2>'+co.name+'</h2><div class="sp"></div><div class="tabbar">'+t+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>'; let body=''; if(App.state.companyTab==="Overview"){ body='<div class="card"><div class="grid cols-3"><div><label>Company ID</label><input class="input" value="'+co.id+'"></div><div><label>City</label><input class="input" value="'+(co.city||"")+'"></div><div><label>State</label><input class="input" value="'+(co.state||"")+'"></div><div class="span-2"><label>Industry</label><input class="input" value="'+(co.industry||"")+'"></div></div></div>'; } else if(App.state.companyTab==="Contacts"){ const rows=DATA.contacts.filter(p=>p.companyId===id).map(p=>'<tr><td>'+p.name+'</td><td>'+p.email+'</td><td>'+p.phone+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+p.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="4" class="muted">No contacts</td></tr>'; body='<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.companyTab==="Cases"){ const rows=DATA.cases.filter(c=>c.companyId===id).map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="4" class="muted">No cases</td></tr>'; body='<div class="section"><header><h3 class="section-title">Cases</h3></header><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.companyTab==="Documents"){ const rows=DATA.documents.filter(d=>d.companyId===id).map(d=>'<tr><td>'+d.id+'</td><td>'+d.title+'</td><td>'+d.type+'</td><td>'+d.size+'</td><td class="right"><button class="btn light" data-act="openDoc" data-arg="'+d.id+'">Open</button></td></tr>').join('')||'<tr><td colspan="5" class="muted">No docs</td></tr>'; body='<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Size</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } return Shell(header+body,'companies'); }

/* Documents */
function Documents(){ const rows=DATA.documents.map(d=>'<tr><td>'+d.id+'</td><td>'+d.title+'</td><td>'+d.type+'</td><td>'+d.size+'</td><td class="right"><button class="btn light" data-act="openDoc" data-arg="'+d.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Documents</h3><button class="btn" data-act="newDoc">New</button></header><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Size</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents'); }
function DocumentPage(id){ const d=DATA.documents.find(x=>x.id===id); if(!d) return Shell('<div class="card">Document not found</div>','documents'); const tabs=["Details","Preview","Activity"]; const t=tabs.map(n=>'<button class="btn '+(App.state.docTab===n?'':'light')+'" data-act="docTab" data-arg="'+n+'">'+n+'</button>').join(' '); const header='<div class="card"><div style="display:flex;gap:8px;align-items:center"><h2>'+d.title+'</h2><div class="sp"></div><div class="tabbar">'+t+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="documents">Back</button></div></div>'; let body=''; if(App.state.docTab==="Details"){ body='<div class="card"><div class="grid cols-3"><div><label>Type</label><input class="input" value="'+d.type+'"></div><div><label>Size</label><input class="input" value="'+(d.size||"")+'"></div><div><label>Owner</label><input class="input" value="'+(d.owner||"")+'"></div><div><label>Created</label><input class="input" value="'+(d.created||"")+'"></div></div></div>'; } else if(App.state.docTab==="Preview"){ body='<div class="card"><div class="muted">Preview not available in demo (type: '+d.type+').</div></div>'; } else if(App.state.docTab==="Activity"){ body='<div class="card"><div class="muted">No activity recorded.</div></div>'; } return Shell(header+body,'documents'); }

/* Resources & Admin */
function Resources(){ return Shell('<div class="card">Resources stub</div>','resources'); }
function Admin(){ const cfg=Settings.load(); const start=cfg.startRoute||'dashboard'; const html='<div class="section"><header><h3 class="section-title">Admin</h3></header><div class="grid cols-3"><div><label>Default start page</label><select id="cfg-start" class="input"><option '+(start==='dashboard'?'selected':'')+' value="dashboard">Dashboard</option><option '+(start==='calendar'?'selected':'')+' value="calendar">Calendar</option><option '+(start==='cases'?'selected':'')+' value="cases">Cases</option></select></div><div class="span-2" style="align-self:end"><button class="btn" data-act="saveCfg">Save settings</button> <button class="btn danger" data-act="resetDemo">Reset demo data</button></div></div></div>'; return Shell(html,'admin'); }

/* Calendar */
function monthStart(y,m){ return new Date(y,m,1); }
function monthEnd(y,m){ return new Date(y,m+1,0); }
function renderPill(ev){ const cls=(ev.type||'Appointment').toLowerCase().replace(/\s+/g,' '); const tag=ev.caseId?('<span class="mono" style="font-size:11px">Case '+(DATA.cases.find(c=>c.id===ev.caseId)?.fileNumber||'')+'</span>'):''; return '<div class="pill '+cls+'" data-act="openEvent" data-arg="'+ev.id+'"><span class="dot"></span><span>'+ev.title+'</span>'+tag+' <button class="x" title="Delete" data-act="deleteEvent" data-arg="'+ev.id+'">x</button></div>'; }
function Calendar(){ const [Y,M]=App.state.currentMonth.split('-').map(Number); const start=monthStart(Y,M-1); const end=monthEnd(Y,M-1); const dow=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; let head='<div class="cal-head"><button class="btn light" data-act="prevMonth">◀</button><button class="btn light" data-act="today">Today</button><div style="font-weight:600;margin-left:8px">'+start.toLocaleString(undefined,{month:"long",year:"numeric"})+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="dashboard">Back to dashboard</button></div>'; head+='<div class="cal-grid" style="margin-bottom:6px">'+dow.map(d=>'<div class="cal-dow">'+d+'</div>').join('')+'</div>'; let grid='<div class="cal-grid">'; const firstDow=(start.getDay()+6)%7; for(let i=0;i<firstDow;i++) grid+='<div class="cal-cell"></div>'; const byDay={}; for(const e of DATA.events){ (byDay[e.date]=byDay[e.date]||[]).push(e); } for(let d=1; d<=end.getDate(); d++){ const ds=ymd(new Date(Y,M-1,d)); const list=(byDay[ds]||[]); grid+='<div class="cal-cell" data-act="newEventOn" data-arg="'+ds+'"><div class="cal-date">'+d+'</div><div class="cal-evt">'+list.map(renderPill).join('')+'</div></div>'; } grid+='</div>'; const quick=AddEventForm(); return Shell('<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+head+grid+'</div>'+quick,'calendar'); }
function AddEventForm(){ const u=DATA.users; const caseOpts=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'">'+c.fileNumber+'</option>')).join(''); return '<div class="section"><header><h3 class="section-title">Add Event</h3></header><div class="grid cols-4"><input class="input" id="qa-title" placeholder="Appointment or note"><input class="input" id="qa-date" type="date"><input class="input" id="qa-start" type="time" value="09:00"><input class="input" id="qa-end" type="time" value="10:00"><select class="input" id="qa-owner">'+u.map(x=>'<option>'+x.name+'</option>').join('')+'</select><select class="input" id="qa-type"><option>Appointment</option><option>Interview</option><option>Evidence review</option><option>Admin</option><option>Risk</option></select><select class="input" id="qa-case">'+caseOpts+'</select></div><div class="right" style="margin-top:8px"><button class="btn" data-act="createQuickEvent">Create</button></div></div>'; }

/* Routing render */
function render(){ const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='calendar') el.innerHTML=Calendar(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='documents') el.innerHTML=Documents(); else if(r==='document') el.innerHTML=DocumentPage(App.state.currentDocId); else if(r==='resources') el.innerHTML=Resources(); else if(r==='admin') el.innerHTML=Admin(); else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')'; }

/* Modal */
let currentEditId=null;
function openModal(ev){ currentEditId=ev?ev.id:null; const m=document.getElementById('modal'); const ownerSel=document.getElementById('md-owner'); ownerSel.innerHTML=DATA.users.map(u=>'<option '+((ev&&ev.owner)===u.name?'selected':'')+'>'+u.name+'</option>').join(''); const caseSel=document.getElementById('md-case'); caseSel.innerHTML=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'" '+((ev&&ev.caseId)===c.id?'selected':'')+'>'+c.fileNumber+'</option>')).join(''); document.getElementById('md-title').value=(ev&&ev.title)||''; document.getElementById('md-date').value=(ev&&ev.date)||ymd(new Date()); document.getElementById('md-start').value=(ev&&ev.start)||'09:00'; document.getElementById('md-end').value=(ev&&ev.end)||'10:00'; document.getElementById('md-type').value=(ev&&ev.type)||'Appointment'; m.classList.remove('hidden'); }
function closeModal(){ document.getElementById('modal').classList.add('hidden'); currentEditId=null; }

/* Actions */
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({route:'case', currentCaseId:arg, caseTab:'Details'}); return; }
  if(act==='openCompany'){ App.set({route:'company', currentCompanyId:arg, companyTab:'Overview'}); return; }
  if(act==='openContact'){ App.set({route:'contact', currentContactId:arg, contactTab:'Details'}); return; }
  if(act==='openDoc'){ App.set({route:'document', currentDocId:arg, docTab:'Details'}); return; }

  if(act==='caseTab'){ App.set({caseTab:arg}); return; }
  if(act==='companyTab'){ App.set({companyTab:arg}); return; }
  if(act==='contactTab'){ App.set({contactTab:arg}); return; }
  if(act==='docTab'){ App.set({docTab:arg}); return; }

  if(act==='newCase'){ const inv=DATA.users[1]; const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+pad(DATA.cases.length+1),title:'New case',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created:ymd(new Date()),notes:[],tasks:[],folders:{General:[]}}; DATA.cases.unshift(cs); App.set({route:'case', currentCaseId:cs.id}); return; }
  if(act==='saveCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const v=id=>document.getElementById(id)?.value||''; cs.title=v('c-title'); cs.organisation=v('c-org'); cs.status=v('c-status'); cs.priority=v('c-priority'); alert('Case saved'); return; }
  if(act==='deleteCase'){ if(confirm('Delete this case?')){ DATA.cases=DATA.cases.filter(c=>c.id!==arg); App.set({route:'cases'}); } return; }
  if(act==='addStdTasks'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(a=>cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:a,assignee:'Admin',due:'',status:'Open'})); App.set({}); return; }
  if(act==='addTask'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const tsk={id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,assignee:document.getElementById('task-assignee').value,due:document.getElementById('task-due').value,status:'Open'}; cs.tasks.push(tsk); App.set({}); return; }
  if(act==='addNote'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const txt=document.getElementById('note-text').value.trim(); if(!txt) return; cs.notes.unshift({time:new Date().toLocaleString(), by:DATA.me.name, text:txt}); App.set({}); return; }
  if(act==='addContactNote'){ const p=DATA.contacts.find(x=>x.id===arg); if(!p) return; const txt=document.getElementById('contact-note').value.trim(); if(!txt) return; p.notes.unshift({time:new Date().toLocaleString(), by:DATA.me.name, text:txt}); App.set({}); return; }

  // Calendar
  if(act==='prevMonth'){ const d=parseYMD(App.state.currentMonth+'-01'); d.setMonth(d.getMonth()-1); App.set({currentMonth:d.toISOString().slice(0,7)}); return; }
  if(act==='today'){ const d=new Date(); App.set({currentMonth:d.toISOString().slice(0,7)}); return; }
  if(act==='createQuickEvent'){ const ev={id:uid(), title:document.getElementById('qa-title').value||'Untitled', date:document.getElementById('qa-date').value||ymd(new Date()), start:document.getElementById('qa-start').value||'09:00', end:document.getElementById('qa-end').value||'10:00', owner:document.getElementById('qa-owner').value||'Admin', type:document.getElementById('qa-type').value||'Appointment', caseId:(document.getElementById('qa-case').value||'')||null}; DATA.events.push(ev); persistEvents(); App.set({}); return; }
  if(act==='newEventOn'){ openModal({date:arg}); return; }
  if(act==='openEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(ev) openModal(ev); return; }
  if(act==='deleteEvent'){ DATA.events = DATA.events.filter(e=>e.id!==arg); persistEvents(); App.set({}); return; }
  if(act==='closeModal'){ closeModal(); return; }
  if(act==='saveEvent'){ const payload={ id: currentEditId || uid(), title:(document.getElementById('md-title').value||'Untitled').trim(), date:document.getElementById('md-date').value||ymd(new Date()), start:document.getElementById('md-start').value||'09:00', end:document.getElementById('md-end').value||'10:00', owner:document.getElementById('md-owner').value||'Admin', type:document.getElementById('md-type').value||'Appointment', caseId:(document.getElementById('md-case').value||'')||null }; const i=DATA.events.findIndex(e=>e.id===payload.id); if(i>=0) DATA.events[i]=payload; else DATA.events.push(payload); persistEvents(); closeModal(); App.set({}); return; }

  // Admin
  if(act==='saveCfg'){ const cfg={startRoute: document.getElementById('cfg-start').value }; Settings.save(cfg); alert('Saved'); return; }
  if(act==='resetDemo'){ if(confirm('Reset demo data (events only)?')){ localStorage.removeItem(EV_KEY); location.reload(); } return; }
});

document.addEventListener('DOMContentLoaded', ()=>{
  const cfg=Settings.load(); const start=cfg.startRoute || 'calendar';
  App.set({route:start});
});

})();