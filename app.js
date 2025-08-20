(function(){
"use strict";
const BUILD="v2.17.6-hs";
const STAMP=window.__STAMP__||(new Date()).toISOString();
const EV_KEY="synergy_events_v8";

const pad=n=>(""+n).padStart(2,"0");
const ymdLocal=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const uid=()=>"id-"+Math.random().toString(36).slice(2,9);
const YEAR=(new Date()).getFullYear();

// --- Demo data ---
function mkCase(y,seq,p){let b={id:uid(),fileNumber:`INV-${y}-${pad(seq)}`,title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:`${y}-${pad(((seq%12)||1))}`,notes:[],tasks:[],folders:{General:[]}};Object.assign(b,p||{});return b;}
const DATA={
  users:[{name:"Admin",email:"admin@synergy.com",role:"Admin"},{name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},{name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},{name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}],
  companies:[{id:"C-001",name:"Sunrise Mining Pty Ltd",city:"Perth",state:"WA",industry:"Mining"},
             {id:"C-002",name:"City of Melbourne",city:"Melbourne",state:"VIC",industry:"Public"},
             {id:"C-003",name:"Queensland Health (Metro North)",city:"Brisbane",state:"QLD",industry:"Health"}],
  contacts:[{id:"P-1",name:"Alex Ng",email:"alex@synergy.com",phone:"0400 111 333",companyId:"C-001"},
            {id:"P-2",name:"Priya Menon",email:"priya@synergy.com",phone:"0400 222 444",companyId:"C-003"},
            {id:"P-3",name:"Chris Rice",email:"chris@synergy.com",phone:"0400 333 555",companyId:"C-002"}],
  cases:[
    mkCase(YEAR-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:`${YEAR-1}-01`}),
    mkCase(YEAR-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:`${YEAR-1}-07`}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:`${YEAR}-01`}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:`${YEAR}-06`}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:`${YEAR}-07`})
  ],
  documents:[
    {id:"D-1",title:"Investigation plan template",type:"doc",size:"52 KB",owner:"Admin",created:ymdLocal(new Date(YEAR,6,1))},
    {id:"D-2",title:"Interview guide (Sunrise)",type:"pdf",size:"128 KB",owner:"Admin",created:ymdLocal(new Date(YEAR,6,3))},
    {id:"D-3",title:"Evidence snapshot",type:"image",size:"420 KB",owner:"Admin",created:ymdLocal(new Date(YEAR,6,10))}
  ],
  resources:[
    {id:"R-1",name:"Policy — Bullying & Harassment",version:"v3.2",owner:"Admin"},
    {id:"R-2",name:"Template — Interview Notes",version:"v1.8",owner:"Admin"},
    {id:"R-3",name:"Checklist — Evidence Capture",version:"v2.0",owner:"Admin"}
  ],
  events:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

(function restoreEvents(){
  try{const raw=localStorage.getItem(EV_KEY); if(raw) DATA.events=JSON.parse(raw)||[];}catch(_){}
  if(!Array.isArray(DATA.events)) DATA.events=[];
  if(!DATA.events.length){
    DATA.events=[
      {id:uid(), title:"Interview planning", date:`${YEAR}-08-06`, start:"09:00", end:"10:00", owner:"Admin", type:"Appointment", location:"", caseId:null},
      {id:uid(), title:"Evidence review",   date:`${YEAR}-08-13`, start:"10:00", end:"12:00", owner:"Admin", type:"Evidence review", location:"", caseId:null},
      {id:uid(), title:"Client check-in",    date:`${YEAR}-08-19`, start:"11:00", end:"11:30", owner:"Admin", type:"Appointment", location:"", caseId:null},
      {id:uid(), title:"Admin all-hands",    date:`${YEAR}-08-26`, start:"15:00", end:"16:00", owner:"Admin", type:"Admin", location:"", caseId:null}
    ];
    persistEvents();
  }
})();
function persistEvents(){ try{localStorage.setItem(EV_KEY, JSON.stringify(DATA.events));}catch(_){ } }

// --- App state / layout ---
const App={ state:{route:"dashboard", currentCaseId:null, caseTab:"Details", currentContactId:null, currentCompanyId:null}, set(p){ Object.assign(this.state,p||{}); render(); } };

function Topbar(){ return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="muted">Build '+STAMP+'</span><span class="badge">Soft Stable '+BUILD+'</span></div>'; }
function Sidebar(active){ const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let html='<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'; for(const it of items) html+='<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>'; html+='</ul></aside>'; return html; }
function Shell(content,active){ return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// --- Pages ---
function Dashboard(){ const rows=DATA.cases.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join(''); return Shell('<div class="card"><div style="display:flex;gap:8px;align-items:center"><h3>Welcome</h3></div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case</th><th>Org</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','dashboard'); }

function Calendar(){ const items=DATA.events.slice().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start)).map(e=>'<div class="ev-row" data-act="editEvent" data-arg="'+e.id+'"><div class="ev-date">'+e.date+'</div><div class="ev-title">'+e.title+'</div><div class="muted">'+(e.start||'')+'–'+(e.end||'')+'</div><div class="ev-type"><span class="pill">'+e.type+'</span></div><div class="right"><button class="btn light">Edit</button></div></div>').join(''); const add=AddEventCard(); return Shell('<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+items+'</div>'+add,'calendar'); }

function AddEventCard(){ const u=DATA.users.map(x=>'<option>'+x.name+'</option>').join(''); const caseOpts=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'">'+c.fileNumber+'</option>')).join(''); return '<div class="section"><header><h3 class="section-title">Add Event</h3></header><div class="grid cols-4"><input class="input" id="qa-title" placeholder="Appointment or note"><input class="input" id="qa-date" type="date" value="'+ymdLocal(new Date())+'"><input class="input" id="qa-start" type="time" value="09:00"><input class="input" id="qa-end" type="time" value="10:00"><select class="input" id="qa-owner">'+u+'</select><select class="input" id="qa-type"><option>Appointment</option><option>Interview</option><option>Evidence review</option><option>Admin</option></select><input class="input" id="qa-loc" placeholder="Room or link"><select class="input" id="qa-case">'+caseOpts+'</select></div><div style="margin-top:8px"><button class="btn" data-act="createQuickEvent">Create</button></div></div>'; }

function Cases(){ const rows=DATA.cases.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header><table><thead><tr><th>Case</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases'); }
function CasePage(id){ const cs=DATA.cases.find(x=>x.id===id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases'); const tabs=["Details","Notes","Tasks","Documents"]; const t=tabs.map(n=>'<button class="btn '+(App.state.caseTab===n?'':'light')+'" data-act="caseTab" data-arg="'+n+'">'+n+'</button>').join(' '); let header='<div class="card"><div style="display:flex;gap:8px;align-items:center"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div><div class="tabbar">'+t+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="cases">Back</button></div></div>'; let body=''; if(App.state.caseTab==="Details"){ body='<div class="card"><div class="grid cols-2"><div><label>Title</label><input id="c-title" class="input" value="'+(cs.title||'')+'"></div><div><label>Organisation</label><input id="c-org" class="input" value="'+(cs.organisation||'')+'"></div><div><label>Status</label><select id="c-status" class="input"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div><div><label>Priority</label><select id="c-priority" class="input"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div></div></div>'; } else if(App.state.caseTab==="Notes"){ const rows=(cs.notes||[]).map(n=>'<tr><td>'+n.time+'</td><td>'+n.by+'</td><td>'+n.text+'</td></tr>').join('')||'<tr><td colspan="3" class="muted">No notes</td></tr>'; body='<div class="section"><header><h3 class="section-title">Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add</button></header><textarea id="note-text" class="input" placeholder="Type note…"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; } else if(App.state.caseTab==="Tasks"){ body='<div class="card"><div class="muted">Tasks stub (demo)</div></div>'; } else if(App.state.caseTab==="Documents"){ body='<div class="card"><div class="muted">Documents stub (demo)</div></div>'; } return Shell(header+body,'cases'); }

function Contacts(){ const rows=DATA.contacts.map(p=>'<tr><td>'+p.name+'</td><td>'+p.email+'</td><td>'+p.companyId+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+p.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts'); }
function ContactPage(id){ const p=DATA.contacts.find(x=>x.id===id); if(!p) return Shell('<div class="card">Contact not found.</div>','contacts'); const co=DATA.companies.find(c=>c.id===p.companyId); const card='<div class="card"><div style="display:flex;gap:12px;align-items:center"><h2>'+p.name+'</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="contacts">Back</button></div><div class="grid cols-2" style="margin-top:10px"><div><label>Email</label><input class="input" value="'+p.email+'"></div><div><label>Company</label><input class="input" value="'+(co?co.name:p.companyId)+'"></div></div></div>'; return Shell(card,'contacts'); }

function Companies(){ const rows=DATA.companies.map(co=>'<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+co.city+'</td><td>'+co.state+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th><th>City</th><th>State</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies'); }
function CompanyPage(id){ const co=DATA.companies.find(c=>c.id===id); if(!co) return Shell('<div class="card">Company not found.</div>','companies'); const card='<div class="card"><div style="display:flex;gap:12px;align-items:center"><h2>'+co.name+'</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="companies">Back</button></div><div class="grid cols-3" style="margin-top:10px"><div><label>ID</label><input class="input" value="'+co.id+'"></div><div><label>City</label><input class="input" value="'+co.city+'"></div><div><label>State</label><input class="input" value="'+co.state+'"></div></div></div>'; return Shell(card,'companies'); }

function Documents(){ const rows=DATA.documents.map(d=>'<tr><td>'+d.id+'</td><td>'+d.title+'</td><td>'+d.type+'</td><td>'+d.size+'</td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Size</th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents'); }
function Resources(){ const rows=DATA.resources.map(r=>'<tr><td>'+r.id+'</td><td>'+r.name+'</td><td>'+r.version+'</td><td>'+r.owner+'</td></tr>').join(''); return Shell('<div class="section"><header><h3 class="section-title">Resources</h3></header><table><thead><tr><th>ID</th><th>Name</th><th>Version</th><th>Owner</th></tr></thead><tbody>'+rows+'</tbody></table></div>','resources'); }
function Admin(){ const card='<div class="card"><div style="display:flex;gap:12px;align-items:center"><h2>Admin</h2></div><div class="grid cols-3" style="margin-top:10px"><div><label>Theme</label><input class="input" value="HubSpot" disabled></div><div><label>Actions</label><button class="btn light" data-act="resetDemo">Reset demo data</button></div></div></div>'; return Shell(card,'admin'); }

// --- Modal ---
let currentEditId=null;
function openModal(ev){
  currentEditId=ev&&ev.id?ev.id:null;
  const m=document.getElementById('modal');
  const ownerSel=document.getElementById('md-owner');
  ownerSel.innerHTML=DATA.users.map(u=>'<option '+((ev&&ev.owner)===u.name?'selected':'')+'>'+u.name+'</option>').join('');
  const caseSel=document.getElementById('md-case');
  caseSel.innerHTML=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>'<option value="'+c.id+'" '+((ev&&ev.caseId)===c.id?'selected':'')+'>'+c.fileNumber+'</option>')).join('');
  document.getElementById('md-title').value=(ev&&ev.title)||'';
  document.getElementById('md-date').value=(ev&&ev.date)||ymdLocal(new Date());
  document.getElementById('md-start').value=(ev&&ev.start)||'09:00';
  document.getElementById('md-end').value=(ev&&ev.end)||'10:00';
  document.getElementById('md-type').value=(ev&&ev.type)||'Appointment';
  document.getElementById('md-loc').value=(ev&&ev.location)||'';
  m.classList.remove('hidden');
}
function closeModal(){ document.getElementById('modal').classList.add('hidden'); currentEditId=null; }

// --- Render ---
function render(){
  const r=App.state.route, el=document.getElementById('app');
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='calendar') el.innerHTML=Calendar();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId);
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId);
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else if(r==='admin') el.innerHTML=Admin();
  else el.innerHTML=Dashboard();
}

// --- Events ---
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode;
  if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({route:'case', currentCaseId:arg, caseTab:'Details'}); return; }
  if(act==='caseTab'){ App.set({caseTab:arg}); return; }
  if(act==='openContact'){ App.set({route:'contact', currentContactId:arg}); return; }
  if(act==='openCompany'){ App.set({route:'company', currentCompanyId:arg}); return; }
  if(act==='editEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(ev) openModal(ev); return; }
  if(act==='closeModal'){ closeModal(); return; }
  if(act==='deleteEvent'){ if(currentEditId){ DATA.events=DATA.events.filter(e=>e.id!==currentEditId); persistEvents(); closeModal(); App.set({}); } return; }
  if(act==='saveEvent'){
    const payload={
      id: currentEditId || uid(),
      title:(document.getElementById('md-title').value||'Untitled').trim(),
      date:document.getElementById('md-date').value||ymdLocal(new Date()),
      start:document.getElementById('md-start').value||'09:00',
      end:document.getElementById('md-end').value||'10:00',
      owner:document.getElementById('md-owner').value||'Admin',
      type:document.getElementById('md-type').value||'Appointment',
      location:document.getElementById('md-loc').value||'',
      caseId:(document.getElementById('md-case').value||'')||null
    };
    const i=DATA.events.findIndex(e=>e.id===payload.id);
    if(i>=0) DATA.events[i]=payload; else DATA.events.push(payload);
    persistEvents(); closeModal(); App.set({}); return;
  }
  if(act==='createQuickEvent'){
    const ev={
      id:uid(),
      title:(document.getElementById('qa-title').value||'Untitled').trim(),
      date:document.getElementById('qa-date').value||ymdLocal(new Date()),
      start:document.getElementById('qa-start').value||'09:00',
      end:document.getElementById('qa-end').value||'10:00',
      owner:document.getElementById('qa-owner').value||'Admin',
      type:document.getElementById('qa-type').value||'Appointment',
      location:document.getElementById('qa-loc').value||'',
      caseId:(document.getElementById('qa-case').value||'')||null
    };
    DATA.events.push(ev); persistEvents(); App.set({}); return;
  }
  if(act==='resetDemo'){
    localStorage.removeItem(EV_KEY);
    location.reload();
  }
});

document.addEventListener('DOMContentLoaded',()=>{ App.set({route:'calendar'}); });
})();