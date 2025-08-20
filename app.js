(function(){
"use strict";
const BUILD = "v2.17.4-hs";
const STAMP = window.__STAMP__ || (new Date()).toISOString();

/* Utils */
const uid=()=>"id-"+Math.random().toString(36).slice(2,9);
const pad=n=>(""+n).padStart(2,"0");
const ymd=d=>d.toISOString().slice(0,10);
const parseYMD=s=>{const [Y,M,D]=s.split("-").map(Number); return new Date(Y,M-1,D);};
const today = new Date(); const YEAR=today.getFullYear();

/* Seed data */
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
    {id:"C-003",name:"Queensland Health (Metro North)",folders:{General:[]}}
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",notes:""},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",notes:""},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",notes:""}
  ],
  cases:[
    mkCase(YEAR-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:(YEAR-1)+"-01"}),
    mkCase(YEAR-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:(YEAR-1)+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  events: [],
  notifications:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// events persistence
const EV_KEY="synergy_events_v3";
(function restoreEvents(){ try{ const raw=localStorage.getItem(EV_KEY); if(raw){ DATA.events=JSON.parse(raw)||[]; } }catch(_){ } if(!DATA.events || !DATA.events.length){ // seed
  DATA.events=[
    {id:uid(), title:"Interview planning", date:`${YEAR}-08-06`, start:"09:00", end:"10:00", owner:"Admin", type:"Interview", caseId:null},
    {id:uid(), title:"Evidence review",   date:`${YEAR}-08-13`, start:"10:00", end:"12:00", owner:"Admin", type:"Evidence review", caseId:null},
    {id:uid(), title:"Client check-in",   date:`${YEAR}-08-19`, start:"11:00", end:"11:30", owner:"Admin", type:"Appointment", caseId:null},
    {id:uid(), title:"Admin all-hands",   date:`${YEAR}-08-26`, start:"15:00", end:"16:00", owner:"Admin", type:"Admin", caseId:null},
    {id:uid(), title:"Case intake - Sunrise", date:`${YEAR}-08-03`, start:"13:00", end:"14:00", owner:"Admin", type:"Risk", caseId:null}
  ];
  persistEvents();
}})();
function persistEvents(){ try{ localStorage.setItem(EV_KEY, JSON.stringify(DATA.events)); }catch(_){ } }

// App
const App={ state:{ route:"dashboard", tab:"Details", currentCaseId:null, currentMonth: (new Date()).toISOString().slice(0,7) },
  set(p){ Object.assign(App.state,p||{}); render(); },
  get(){ return DATA; }
};

// Shell
function Topbar(){ return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; }
function Sidebar(active){ const base=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){ out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>'); } out.push('</ul></aside>'); return out.join(''); }
function Shell(content,active){ return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// Dashboard
function Dashboard(){ const d=DATA; let rows=''; for(const c of d.cases) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>'; const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div><span class="mono">Build '+STAMP+'</span></div></div>'+'<div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case</th><th>Org</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'; return Shell(html,'dashboard'); }

// Cases
function Cases(){ const d=DATA; const rows=d.cases.map(cc=>'<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>').join(''); const tools='<div class="right" style="margin-bottom:8px"><button class="btn" data-act="newCase">New Case</button></div>'; return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases'); }
function CasePage(id){ const d=DATA, cs=d.cases.find(c=>c.id===id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases'); const tabs=["Details","Notes","Tasks","Documents","Calendar"]; const tabLinks=tabs.map(t=>'<button class="btn '+(App.state.tab===t?'':'light')+'" data-act="switchTab" data-arg="'+t+'">'+t+'</button>').join(' '); const header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div>'+tabLinks+'<div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="cases">Back</button></div></div>'; const invOpts=d.users.map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join(''); const details='<div class="card"><div class="grid cols-2">'+'<div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div>'+'<div><label>Organisation</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div>'+'<div><label>Status</label><select class="input" id="c-status"><option'+(cs.status==="Planning"?" selected":"")+'>Planning</option><option'+(cs.status==="Investigation"?" selected":"")+'>Investigation</option><option'+(cs.status==="Evidence Review"?" selected":"")+'>Evidence Review</option><option'+(cs.status==="Reporting"?" selected":"")+'>Reporting</option><option'+(cs.status==="Closed"?" selected":"")+'>Closed</option></select></div>'+'<div><label>Priority</label><select class="input" id="c-priority"><option'+(cs.priority==="Low"?" selected":"")+'>Low</option><option'+(cs.priority==="Medium"?" selected":"")+'>Medium</option><option'+(cs.priority==="High"?" selected":"")+'>High</option><option'+(cs.priority==="Critical"?" selected":"")+'>Critical</option></select></div>'+'</div></div>'; let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes</td></tr>'; for(const nn of (cs.notes||[])) notesRows+='<tr><td>'+nn.time+'</td><td>'+nn.by+'</td><td>'+nn.text+'</td></tr>'; const notes='<div class="section"><header><h3 class="section-title">Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add</button></header><textarea class="input" id="note-text" placeholder="Type note…"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+notesRows+'</tbody></table></div>'; let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks</td></tr>'; for(const tt of (cs.tasks||[])) taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>'; const tasks='<div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts.replace(/ value="[^"]+"/g,"")+'</select></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+taskRows+'</tbody></table></div>'; const linked=DATA.events.filter(ev=>ev.caseId===cs.id); const list=linked.map(ev=>'<div class="pill" data-act="openEvent" data-arg="'+ev.id+'"><span class="dot" style="background:#0ea5e9"></span><span>'+ev.title+'</span><span class="mono" style="font-size:11px">'+ev.date+'</span></div>').join('') || '<div class="muted">No linked events</div>'; const calTab='<div class="section"><header><h3 class="section-title">Case Events</h3></header>'+list+'</div>'; let body=details; if(App.state.tab==="Notes") body=notes; else if(App.state.tab==="Tasks") body=tasks; else if(App.state.tab==="Documents") body='<div class="card">Docs stub</div>'; else if(App.state.tab==="Calendar") body=calTab; return Shell(header+body,'cases'); }

// Other sections
function Contacts(){ const d=DATA; const rows=d.contacts.map(c=>'<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+c.companyId+'</td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts'); }
function Companies(){ const d=DATA; const rows=d.companies.map(co=>'<tr><td>'+co.id+'</td><td>'+co.name+'</td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies'); }
function Documents(){ return Shell('<div class="card">Document center stub</div>','documents'); }
function Resources(){ return Shell('<div class="card">Resources stub</div>','resources'); }
function Admin(){ return Shell('<div class="card">Admin stub</div>','admin'); }

// Calendar
function monthStart(y,m){ return new Date(y,m,1); }
function monthEnd(y,m){ return new Date(y,m+1,0); }
function OwnerFilter(){ return ''; }

function renderPill(ev){ const cls=(ev.type||'Appointment').toLowerCase().replace(/\s+/g,' '); const tag=ev.caseId?('<span class="mono" style="font-size:11px">Case '+(DATA.cases.find(c=>c.id===ev.caseId)?.fileNumber||'')+'</span>'):''; return '<div class="pill '+cls+'" data-act="openEvent" data-arg="'+ev.id+'"><span class="dot"></span><span>'+ev.title+'</span>'+tag+' <button class="x" title="Delete" data-act="deleteEvent" data-arg="'+ev.id+'">x</button></div>'; }

function Calendar(){ const [y,m]=App.state.currentMonth.split('-').map(Number); const start=monthStart(y,m-1); const end=monthEnd(y,m-1); const dow=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; let head='<div class="cal-head"><button class="btn light" data-act="prevMonth">◀</button><button class="btn light" data-act="today">Today</button><div style="font-weight:600;margin-left:8px">'+start.toLocaleString(undefined,{month:'long',year:'numeric'})+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="dashboard">Back to dashboard</button></div>'; head+='<div class="cal-grid" style="margin-bottom:6px">'+dow.map(d=>'<div class="cal-dow">'+d+'</div>').join('')+'</div>'; let grid='<div class="cal-grid">'; const firstDow=(start.getDay()+6)%7; for(let i=0;i<firstDow;i++) grid+='<div class="cal-cell"></div>'; const byDay={}; for(const e of DATA.events){ (byDay[e.date]=byDay[e.date]||[]).push(e); } for(let d=1; d<=end.getDate(); d++){ const ds=ymd(new Date(y,m-1,d)); const list=(byDay[ds]||[]); grid+='<div class="cal-cell" data-act="newEventOn" data-arg="'+ds+'"><div class="cal-date">'+d+'</div><div class="cal-evt">'+list.map(renderPill).join('')+'</div></div>'; } grid+='</div>'; const quick=AddEventForm(); return Shell('<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+head+grid+'</div>'+quick,'calendar'); }

function AddEventForm(){ const u=DATA.users; const caseOpts=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'">'+c.fileNumber+'</option>')).join(''); return '<div class="section"><header><h3 class="section-title">Add Event</h3></header><div class="grid cols-4"><input class="input" id="qa-title" placeholder="Appointment or note"><input class="input" id="qa-date" type="date"><input class="input" id="qa-start" type="time" value="09:00"><input class="input" id="qa-end" type="time" value="10:00"><select class="input" id="qa-owner">'+u.map(x=>'<option>'+x.name+'</option>').join('')+'</select><select class="input" id="qa-type"><option>Appointment</option><option>Interview</option><option>Evidence review</option><option>Admin</option><option>Risk</option></select><select class="input" id="qa-case">'+caseOpts+'</select></div><div class="right" style="margin-top:8px"><button class="btn" data-act="createQuickEvent">Create</button></div></div>'; }

// Render
function render(){ const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='calendar') el.innerHTML=Calendar(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='companies') el.innerHTML=Companies(); else if(r==='documents') el.innerHTML=Documents(); else if(r==='resources') el.innerHTML=Resources(); else if(r==='admin') el.innerHTML=Admin(); else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')'; }

// Event modal
let currentEditId=null;
function openModal(ev){ currentEditId=ev?ev.id:null; const m=document.getElementById('modal'); const ownerSel=document.getElementById('md-owner'); ownerSel.innerHTML=DATA.users.map(u=>'<option '+((ev&&ev.owner)===u.name?'selected':'')+'>'+u.name+'</option>').join(''); const caseSel=document.getElementById('md-case'); caseSel.innerHTML=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'" '+((ev&&ev.caseId)===c.id?'selected':'')+'>'+c.fileNumber+'</option>')).join(''); document.getElementById('md-title').value=(ev&&ev.title)||''; document.getElementById('md-date').value=(ev&&ev.date)||ymd(new Date()); document.getElementById('md-start').value=(ev&&ev.start)||'09:00'; document.getElementById('md-end').value=(ev&&ev.end)||'10:00'; document.getElementById('md-type').value=(ev&&ev.type)||'Appointment'; m.classList.remove('hidden'); }
function closeModal(){ document.getElementById('modal').classList.add('hidden'); currentEditId=null; }

// Actions
document.addEventListener('click', (e)=>{
  let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({route:'case', currentCaseId:arg, tab:'Details'}); return; }
  if(act==='switchTab'){ App.set({tab:arg}); return; }

  if(act==='prevMonth'){ const d=parseYMD(App.state.currentMonth+'-01'); d.setMonth(d.getMonth()-1); App.set({currentMonth: d.toISOString().slice(0,7)}); return; }
  if(act==='today'){ const d=new Date(); App.set({currentMonth: d.toISOString().slice(0,7)}); return; }
  if(act==='newCase'){ const seq=('00'+(DATA.cases.length+1)).slice(-3); const inv=DATA.users[1]; const created=(new Date()).toISOString().slice(0,7); const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}}; DATA.cases.unshift(cs); App.set({route:'case', currentCaseId:cs.id}); return; }
  if(act==='saveCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const v=id=>{const el=document.getElementById(id); return el?el.value:null;}; [['title','c-title'],['organisation','c-org'],['status','c-status'],['priority','c-priority']].forEach(([k,i])=>{ const val=v(i); if(val!=null) cs[k]=val; }); alert('Case saved'); return; }
  if(act==='deleteCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; if(confirm('Delete case '+(cs.fileNumber||'')+'?')){ DATA.cases=DATA.cases.filter(x=>x.id!==cs.id); App.set({route:'cases'}); } return; }

  // Quick create
  if(act==='createQuickEvent'){ const ev={ id:uid(), title:(document.getElementById('qa-title').value||'').trim()||'Untitled', date:document.getElementById('qa-date').value||ymd(new Date()), start:document.getElementById('qa-start').value||'09:00', end:document.getElementById('qa-end').value||'10:00', owner:document.getElementById('qa-owner').value||'Admin', type:document.getElementById('qa-type').value||'Appointment', caseId:(document.getElementById('qa-case').value||'')||null }; DATA.events.push(ev); persistEvents(); App.set({}); return; }

  // Open day to prefill modal
  if(act==='newEventOn'){ openModal({date:arg}); return; }

  // Pill click = open modal
  if(act==='openEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(ev) openModal(ev); return; }

  // Delete from pill button
  if(act==='deleteEvent'){ const id=arg; DATA.events = DATA.events.filter(e=>e.id!==id); persistEvents(); App.set({}); return; }

  if(act==='closeModal'){ closeModal(); return; }

  if(act==='saveEvent'){ const payload={ id: currentEditId || uid(), title:(document.getElementById('md-title').value||'').trim()||'Untitled', date:document.getElementById('md-date').value||ymd(new Date()), start:document.getElementById('md-start').value||'09:00', end:document.getElementById('md-end').value||'10:00', owner:document.getElementById('md-owner').value||'Admin', type:document.getElementById('md-type').value||'Appointment', caseId:(document.getElementById('md-case').value||'')||null }; const i=DATA.events.findIndex(e=>e.id===payload.id); if(i>=0) DATA.events[i]=payload; else DATA.events.push(payload); persistEvents(); closeModal(); App.set({}); return; }
});

document.addEventListener('DOMContentLoaded', ()=>{ App.set({route:'calendar'}); });

})();