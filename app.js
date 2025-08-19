(function(){"use strict";
const BUILD="v2.17.1"; const STAMP="2025-08-19T23:55:10.356467";
console.log("Synergy CRM "+BUILD+" • "+STAMP);

// --- Utils ---
const uid=()=>"id-"+Math.random().toString(36).slice(2,9);
const pad=(n)=>(""+n).padStart(2,"0");
const today = new Date();
const YEAR=today.getFullYear(), LAST=YEAR-1;

// --- Seed Data ---
function mkCase(y,seq,p){ let b={id:uid(),fileNumber:"INV-"+y+"-"+pad(seq),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+pad(((seq%12)||1)),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b; }

const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",folders:{General:[]}},
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",notes:""},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",notes:""},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",notes:""}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"}),
  ],
  events:[
    {id:uid(), title:"Interview planning", date: YEAR+"-08-06", start:"10:00", end:"11:00", type:"Appointment", owner:"alex@synergy.com", caseId:null, location:"War Room"},
    {id:uid(), title:"Evidence review",   date: YEAR+"-08-13", start:"13:00", end:"14:30", type:"Appointment", owner:"priya@synergy.com", caseId:null, location:"HQ"},
    {id:uid(), title:"Client check-in",   date: YEAR+"-08-19", start:"09:00", end:"09:30", type:"Note", owner:"alex@synergy.com", caseId:null, location:""},
    {id:uid(), title:"Admin all-hands",   date: YEAR+"-08-26", start:"15:00", end:"16:00", type:"Appointment", owner:"admin@synergy.com", caseId:null, location:""},
  ],
  notifications:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// --- Persistence ---
const STORE="synergy_crm_v2171";
function persist(){ try{ localStorage.setItem(STORE, JSON.stringify({DATA})); }catch(_ ){} }
(function restore(){ try{ const raw=localStorage.getItem(STORE); if(raw){ const o=JSON.parse(raw)||{}; if(o.DATA) Object.assign(DATA,o.DATA); } }catch(_ ){} })();

// Lookups
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findEvent=id=>DATA.events.find(e=>e.id===id)||null;

// App shell
const App={ state:{ route:"calendar", tab:"Details", currentCaseId:null, currentEventId:null, filterOwner:"all", view:"month", currentMonth:(new Date()).toISOString().slice(0,7) },
  set(p){ Object.assign(App.state,p||{}); render(); },
  get(){ return DATA; }
};

function statusChip(s){ const classes=(s||'').trim().split(/\s+/).filter(Boolean); const cls='status '+classes.join(' '); return '<span class="badge '+cls+'" data-status="'+(s||'')+'">'+(s||'')+'</span>'; }

function Topbar(){ 
  let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>';
  return s;
}

function Sidebar(active){ 
  const base=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'];
  for(const it of base) out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');
  out.push('</ul></aside>'); return out.join('');
}

function Shell(content,active){ return Topbar() + '<div class="shell">'+ Sidebar(active) + '<main class="main">' + content + '</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// --- Calendar helpers ---
function monthStart(y,m){ return new Date(y,m,1); }
function monthEnd(y,m){ return new Date(y,m+1,0); }

function ymd(d){ return d.toISOString().slice(0,10); }
function parseYMD(s){ const [Y,M,D]=s.split('-').map(Number); return new Date(Y, M-1, D); }

function eventsByDay(owner){ 
  const map={}; const list=DATA.events.filter(ev=>owner==='all'||ev.owner===owner);
  for(const ev of list){ (map[ev.date]=map[ev.date]||[]).push(ev); }
  return map;
}

function CalendarMonth(){ 
  const [y,m] = App.state.currentMonth.split('-').map(Number);
  const start = monthStart(y, m-1);
  const end = monthEnd(y, m-1);
  const todayStr = ymd(new Date());
  const ownerSel = App.state.filterOwner;
  const byDay = eventsByDay(ownerSel);
  const dow = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  let head = '<div class="cal-head"><button class="btn light" data-act="prevMonth">◀</button><button class="btn light" data-act="today">Today</button><div class="mono" style="font-weight:600">'+start.toLocaleString(undefined,{month:'long', year:'numeric'})+'</div><button class="btn light" data-act="nextMonth">▶</button><div class="sp"></div>'+OwnerFilter()+'<div class="view-toggle"><button class="btn '+(App.state.view==='month'?'':'light')+'" data-act="setView" data-arg="month">Month</button> <button class="btn '+(App.state.view==='agenda'?'':'light')+'" data-act="setView" data-arg="agenda">Agenda</button></div></div>';
  let labels = '<div class="cal-grid">'+ dow.map(d=>'<div class="cal-dow">'+d+'</div>').join('');
  const firstDow = (start.getDay()+6)%7; // Mon=0
  for(let i=0;i<firstDow;i++) labels += '<div></div>';
  for(let d=1; d<=end.getDate(); d++){
    const dateStr = ymd(new Date(y,m-1,d));
    const isToday = dateStr===todayStr;
    const evts = (byDay[dateStr]||[]);
    labels += '<div class="cal-cell'+(isToday?' today':'')+'"><div class="cal-date">'+d+'</div>'+ evts.map(e=>'<div class="cal-evt"><span class="pill dot"></span><span>'+e.title+'</span>'+ (e.caseId?('<span class="pill">Case: '+(findCase(e.caseId)?.fileNumber||'')+'</span>'):'') +'<span class="sp"></span><button class="btn light" data-act="editEvent" data-arg="'+e.id+'">x</button></div>').join('') +'</div>';
  }
  labels += '</div>';
  return '<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+head+labels+'</div>'+AddEventForm();
}

function OwnerFilter(){ 
  const d=DATA; const opts=['<select class="input" id="owner-filter" style="width:180px">'];
  opts.push('<option value="all"'+(App.state.filterOwner==='all'?' selected':'')+'>All users</option>');
  for(const u of d.users) opts.push('<option value="'+u.email+'"'+(App.state.filterOwner===u.email?' selected':'')+'>'+u.name+'</option>');
  opts.push('</select>'); return opts.join('');
}

function AddEventForm(caseId){ 
  const d=DATA; const caseOpts=['<option value="">(optional)</option>'].concat(d.cases.map(c=>'<option value="'+c.id+'">'+c.fileNumber+' — '+c.title+'</option>')).join('');
  return '<div class="card"><h3>Add Event</h3><div class="grid cols-3">'
    +'<div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>'
    +'<div><label>Date</label><input class="input" id="ev-date" type="date"></div>'
    +'<div><label>Owner</label><select class="input" id="ev-owner">'+d.users.map(u=>'<option value="'+u.email+'">'+u.name+'</option>').join('')+'</select></div>'
    +'<div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>'
    +'<div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>'
    +'<div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>'
    +'<div><label>Location</label><input class="input" id="ev-loc" placeholder="Room or link"></div>'
    +'<div><label>Case (optional)</label><select class="input" id="ev-case">'+caseOpts+'</select></div>'
    +'<div></div></div><div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Create</button></div></div>';
}

function CalendarAgenda(){ 
  const d=App.get();
  const ownerOpts=OwnerFilter();
  const filtered=d.events.filter(ev=>App.state.filterOwner==='all'||ev.owner===App.state.filterOwner);
  const items=filtered.map(ev=>{ 
    const caseLabel=ev.caseId?('<span class="pill">Case: '+(findCase(ev.caseId)?.fileNumber||'')+'</span>'):'';
    return '<div class="event-row"><div class="pill">'+ev.date+'</div><div>'+ev.title+'</div>'+caseLabel+'<div class="sp"></div><button class="btn light" data-act="editEvent" data-arg="'+ev.id+'">Edit</button></div>';
  }).join('') || '<div class="muted">No events yet.</div>';
  return '<div class="section"><header><h3 class="section-title">Calendar</h3></header><div class="cal-head"><div class="sp"></div>'+ownerOpts+'<div class="view-toggle"><button class="btn '+(App.state.view==='month'?'':'light')+'" data-act="setView" data-arg="month">Month</button> <button class="btn '+(App.state.view==='agenda'?'':'light')+'" data-act="setView" data-arg="agenda">Agenda</button></div></div>'+items+'</div>'+AddEventForm();
}

function Calendar(){ 
  const body = (App.state.view==='month') ? CalendarMonth() : CalendarAgenda();
  const modal='<div id="modal" class="modal hidden"><div class="panel" id="modal-body"></div></div>';
  return Shell(body+modal,'calendar');
}

// --- Other pages (short) ---
function Dashboard(){ const d=App.get(); let rows=''; for(const c of d.cases) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+statusChip(c.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>'; const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div><span class="mono">Build '+STAMP+'</span></div></div>' + '<div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; return Shell(html,'dashboard'); }

function Companies(){ const d=App.get(); const rows=d.companies.map(co=>'<tr><td>'+co.id+'</td><td>'+co.name+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies'); }
function Contacts(){ const d=App.get(); const rows=d.contacts.map(c=>'<tr><td>'+c.name+'</td><td>'+c.email+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts'); }
function Documents(){ const d=App.get(); const rows=d.cases.map(c=>'<tr><td>'+c.fileNumber+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents'); }

// --- Cases ---
function Cases(){ const d=App.get(); const rows=d.cases.map(cc=>'<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+statusChip(cc.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>').join(''); const tools='<div class="right" style="margin-bottom:8px"><button class="btn" data-act="newCase">New Case</button></div>'; return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases'); }

function CasePage(id){ 
  const d=App.get(), cs=findCase(id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases');
  const tabs=["Details","Notes","Tasks","Documents","Calendar"];
  const tabLinks=tabs.map(t=>'<button class="btn '+(App.state.tab===t?'':'light')+'" data-act="switchTab" data-arg="'+t+'">'+t+'</button>').join(' ');
  const header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div>'+tabLinks+'<div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save Case</button><button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete Case</button><button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>';
  const invOpts=d.users.map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join('');
  const coOpts=d.companies.map(c=>'<option '+(c.id===cs.companyId?'selected':'')+' value="'+c.id+'">'+c.name+' ('+c.id+')</option>').join('');
  const details='<div class="card"><div class="grid cols-2">'
   +'<div><label>Case ID</label><input class="input" id="c-id" value="'+(cs.fileNumber||'')+'"></div>'
   +'<div><label>Organisation (display)</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div>'
   +'<div style="grid-column:span 2"><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div>'
   +'<div><label>Company</label><select class="input" id="c-company">'+coOpts+'</select></div>'
   +'<div><label>Investigator</label><select class="input" id="c-inv">'+invOpts+'</select></div>'
   +'<div><label>Status</label><select class="input" id="c-status"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div>'
   +'<div><label>Priority</label><select class="input" id="c-priority"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div>'
   +'</div></div>';
  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
  for(const nn of (cs.notes||[])) notesRows+='<tr><td>'+nn.time+'</td><td>'+nn.by+'</td><td>'+nn.text+'</td></tr>';
  const notes='<div class="section"><header><h3 class="section-title">Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add Note</button></header><textarea class="input" id="note-text" placeholder="Type your note here"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+notesRows+'</tbody></table></div>';
  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  for(const tt of (cs.tasks||[])) taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>';
  const tasks='<div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts+'</select></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+taskRows+'</tbody></table></div>';
  if(!cs.folders) cs.folders={General:[]};
  let docRows=''; for(const fname in cs.folders){ if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname]; docRows+='<tr><th colspan="3">'+fname+'</th></tr>'; docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>'; if(!files.length) docRows+='<tr><td colspan="3" class="muted">No files</td></tr>'; for(const ff of files){ const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; } }
  const docs='<div class="section"><header><h3 class="section-title">Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';
  const linked=DATA.events.filter(ev=>ev.caseId===cs.id);
  const list=linked.map(ev=>'<div class="event-row"><div class="pill">'+ev.date+'</div><div>'+ev.title+'</div><div class="sp"></div><button class="btn light" data-act="editEvent" data-arg="'+ev.id+'">Edit</button></div>').join('') || '<div class="muted">No linked events yet.</div>';
  const addCaseEvent='<div class="card"><h3>Add case event</h3><div class="grid cols-3">'
   +'<div><label>Title</label><input class="input" id="cv-title"></div>'
   +'<div><label>Date</label><input class="input" id="cv-date" type="date"></div>'
   +'<div><label>Owner</label><select class="input" id="cv-owner">'+DATA.users.map(u=>'<option value="'+u.email+'">'+u.name+'</option>').join('')+'</select></div>'
   +'<div><label>Start</label><input class="input" id="cv-start" type="time" value="10:00"></div>'
   +'<div><label>End</label><input class="input" id="cv-end" type="time" value="11:00"></div>'
   +'<div><label>Type</label><select class="input" id="cv-type"><option>Appointment</option><option>Note</option></select></div>'
   +'<div><label>Location</label><input class="input" id="cv-loc"></div>'
   +'<div></div><div></div></div><div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="'+id+'">Create</button></div></div>';
  const calTab='<div class="section"><header><h3 class="section-title">Case Calendar</h3></header>'+list+'</div>'+addCaseEvent+'<div id="modal" class="modal hidden"><div class="panel" id="modal-body"></div></div>';
  let body=details; if(App.state.tab==="Notes") body=notes; else if(App.state.tab==="Tasks") body=tasks; else if(App.state.tab==="Documents") body=docs; else if(App.state.tab==="Calendar") body=calTab;
  return Shell(header+body,'cases');
}

// --- Render ---
function render(){ 
  const r=App.state.route, el=document.getElementById('app'); 
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='calendar') el.innerHTML=Calendar();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML='<div class="section"><header><h3 class="section-title">Resources</h3></header><div class="card">Templates/Guides placeholder</div></div>';
  else if(r==='admin') el.innerHTML='<div class="section"><header><h3 class="section-title">Admin</h3></header><div class="card">Admin placeholder</div></div>';
  else el.innerHTML=Dashboard();
}

// --- Actions ---
document.addEventListener('click',(e)=>{
  let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route') { App.set({route:arg}); return; }
  if(act==='openCase') { App.set({currentCaseId:arg, route:'case', tab:'Details'}); return; }
  if(act==='switchTab') { App.set({tab:arg}); return; }
  if(act==='setView') { App.set({view:arg}); return; }
  if(act==='prevMonth') { const d=parseYMD(App.state.currentMonth+'-01'); d.setMonth(d.getMonth()-1); App.set({currentMonth: d.toISOString().slice(0,7)}); return; }
  if(act==='nextMonth') { const d=parseYMD(App.state.currentMonth+'-01'); d.setMonth(d.getMonth()+1); App.set({currentMonth: d.toISOString().slice(0,7)}); return; }
  if(act==='today') { const d=new Date(); App.set({currentMonth:d.toISOString().slice(0,7)}); return; }

  if(act==='newCase'){ const seq=('00'+(DATA.cases.length+1)).slice(-3); const inv=DATA.users.find(u=>u.role!=="Client")||{name:'',email:''}; const created=(new Date()).toISOString().slice(0,7); const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}}; DATA.cases.unshift(cs); persist(); App.set({currentCaseId:cs.id, route:'case', tab:'Details'}); return; }
  if(act==='saveCase'){ const cs=findCase(arg); if(!cs) return; const v=id=>{const el=document.getElementById(id); return el?el.value:null;}; const invEmail=v('c-inv'); if(invEmail!=null){ cs.investigatorEmail=invEmail; cs.investigatorName=(DATA.users.find(u=>u.email===invEmail)||{}).name||''; } const co=v('c-company'); if(co!=null) cs.companyId=co; [['title','c-title'],['organisation','c-org'],['status','c-status'],['priority','c-priority']].forEach(([k,i])=>{ const val=v(i); if(val!=null) cs[k]=val; }); const idEl=document.getElementById('c-id'); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim(); persist(); alert('Case saved'); return; }
  if(act==='deleteCase'){ const cs=findCase(arg); if(!cs) return; if(!confirm('Delete case '+(cs.fileNumber||'')+'?')) return; DATA.cases=DATA.cases.filter(x=>x.id!==cs.id); persist(); App.set({route:'cases'}); return; }
  if(act==='addNote'){ const cs=findCase(arg); if(!cs) return; const tx=(document.getElementById('note-text').value||'').trim(); if(!tx){ alert('Enter a note'); return; } const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes.unshift({time:stamp, by:me, text:tx}); document.getElementById('note-text').value=''; persist(); App.set({}); return; }
  if(act==='addStdTasks'){ const cs=findCase(arg); if(!cs) return; const base=cs.tasks; ["Gather documents","Interview complainant","Interview respondent","Write report"].forEach(a=> base.push({id:'T-'+(base.length+1), title:a, assignee:cs.investigatorName, due:'', status:'Open'})); persist(); App.set({}); return; }
  if(act==='addTask'){ const cs=findCase(arg); if(!cs) return; const whoSel=document.getElementById('task-assignee'); const who=whoSel.options[whoSel.selectedIndex].text; cs.tasks.push({id:'T-'+(cs.tasks.length+1), title:(document.getElementById('task-title').value||'').trim(), assignee:who, due:document.getElementById('task-due').value, status:'Open'}); persist(); App.set({}); return; }

  // Calendar actions
  if(act==='createEvent'){ 
    const ev={ id:uid(), title:(document.getElementById('ev-title').value||'').trim(), date:document.getElementById('ev-date').value,
      start:document.getElementById('ev-start').value, end:document.getElementById('ev-end').value, type:document.getElementById('ev-type').value,
      owner:document.getElementById('ev-owner').value, location:document.getElementById('ev-loc').value, caseId:(document.getElementById('ev-case').value||null) || null };
    DATA.events.push(ev); persist(); App.set({}); return;
  }
  if(act==='editEvent'){ const ev=findEvent(arg); if(!ev) return; App.state.currentEventId=arg; App.state.showModal=true; render(); renderEditModal(ev); return; }
  if(act==='saveEvent'){ 
    const ev=findEvent(arg); if(!ev) return;
    ev.title=document.getElementById('ed-title').value; ev.date=document.getElementById('ed-date').value; ev.owner=document.getElementById('ed-owner').value;
    ev.start=document.getElementById('ed-start').value; ev.end=document.getElementById('ed-end').value; ev.type=document.getElementById('ed-type').value;
    ev.location=document.getElementById('ed-loc').value; ev.caseId=(document.getElementById('ed-case').value||'')||null;
    persist(); document.getElementById('modal').classList.add('hidden'); App.set({}); return;
  }
  if(act==='deleteEvent'){ const ev=findEvent(arg); if(!ev) return; if(!confirm('Delete event "'+(ev.title||'')+'"?')) return; DATA.events = DATA.events.filter(x=>x.id!==ev.id); persist(); document.getElementById('modal').classList.add('hidden'); App.set({}); return; }
  if(act==='closeModal'){ document.getElementById('modal').classList.add('hidden'); return; }
  if(act==='createCaseEvent'){ const ev={ id:uid(), title:(document.getElementById('cv-title').value||'').trim(), date:document.getElementById('cv-date').value,
      start:document.getElementById('cv-start').value, end:document.getElementById('cv-end').value, type:document.getElementById('cv-type').value,
      owner:document.getElementById('cv-owner').value, location:document.getElementById('cv-loc').value, caseId:arg }; DATA.events.push(ev); persist(); App.set({}); return; }

});

// Change handlers
document.addEventListener('change',(e)=>{ if(e.target && e.target.id==='owner-filter'){ const val=e.target.value; try{ localStorage.setItem('synergy_owner_filter_v1', val); }catch(_ ){} App.set({filterOwner:val}); } });
document.addEventListener('change',(e)=>{ if(e.target && e.target.id==='file-input' && App.state.currentUploadTarget){ const p=App.state.currentUploadTarget.split('::'); const cs=findCase(p[0]); if(!cs) return; const folder=p[1]||'General'; cs.folders[folder]=cs.folders[folder]||[]; const files=e.target.files; const list=cs.folders[folder]; const MAX=5*1024*1024; for(let i=0;i<files.length;i++){ const f=files[i]; if(f.size>MAX){ alert('File too large (>5MB): '+f.name); continue; } const ok=/^image\//.test(f.type)||f.type==='application/pdf'; if(!ok){ alert('Only images or PDFs allowed: '+f.name); continue; } const reader=new FileReader(); reader.onload=ev=>{ list.push({ name:f.name, size:f.size+' B', dataUrl:ev.target.result }); persist(); App.set({}); }; reader.readAsDataURL(f); } e.target.value=''; } });

// Bootstrap
document.addEventListener('DOMContentLoaded',()=>{ try{ const saved=localStorage.getItem('synergy_owner_filter_v1'); if(saved) App.state.filterOwner=saved; }catch(_ ){} App.set({route:'calendar'}); });

// Modal renderer
function renderEditModal(ev){ 
  const d=DATA;
  const caseOpts=['<option value="">(none)</option>'].concat(d.cases.map(c=>'<option value="'+c.id+'" '+(ev.caseId===c.id?'selected':'')+'>'+c.fileNumber+' — '+c.title+'</option>')).join('');
  const ownerOpts=d.users.map(u=>'<option value="'+u.email+'" '+(ev.owner===u.email?'selected':'')+'>'+u.name+'</option>').join('');
  const html='<h3>Edit Event</h3><div class="grid cols-3">'
   +'<div><label>Title</label><input class="input" id="ed-title" value="'+ev.title+'"></div>'
   +'<div><label>Date</label><input class="input" id="ed-date" type="date" value="'+ev.date+'"></div>'
   +'<div><label>Owner</label><select class="input" id="ed-owner">'+ownerOpts+'</select></div>'
   +'<div><label>Start</label><input class="input" id="ed-start" type="time" value="'+(ev.start||"")+'"></div>'
   +'<div><label>End</label><input class="input" id="ed-end" type="time" value="'+(ev.end||"")+'"></div>'
   +'<div><label>Type</label><select class="input" id="ed-type"><option '+(ev.type==="Appointment"?'selected':'')+'>Appointment</option><option '+(ev.type==="Note"?'selected':'')+'>Note</option></select></div>'
   +'<div><label>Location</label><input class="input" id="ed-loc" value="'+(ev.location||"")+'"></div>'
   +'<div><label>Case</label><select class="input" id="ed-case">'+caseOpts+'</select></div>'
   +'<div></div></div><div class="right" style="margin-top:10px">'
   +'<button class="btn danger" data-act="deleteEvent" data-arg="'+ev.id+'">Delete</button> '
   +'<button class="btn light" data-act="closeModal">Cancel</button> '
   +'<button class="btn" data-act="saveEvent" data-arg="'+ev.id+'">Save</button></div>';
  const modal=document.getElementById('modal'), body=document.getElementById('modal-body'); if(modal&&body){ body.innerHTML=html; modal.classList.remove('hidden'); }
}

})();