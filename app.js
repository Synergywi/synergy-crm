(function(){
"use strict";
const BUILD="v2.18.1-hs";
const STAMP = window.__STAMP__ || (new Date()).toISOString();

/* Local date helpers (no UTC conversion!) */
const pad=n=>(""+n).padStart(2,"0");
const ymdLocal=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const ymLocal=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const parseYMD=s=>{ const [Y,M,D]=s.split("-").map(Number); return new Date(Y,M-1,D); };

/* Simple uid */
const uid=()=>"id-"+Math.random().toString(36).slice(2,9);
const YEAR=(new Date()).getFullYear();

/* Seed */
function mkCase(y,seq,p){ let b={id:uid(),fileNumber:`INV-${y}-${pad(seq)}`,title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:`${y}-${pad(((seq%12)||1))}`,notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b; }
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
    mkCase(YEAR-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:`${YEAR-1}-01`}),
    mkCase(YEAR-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:`${YEAR-1}-07`}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:`${YEAR}-01`}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:`${YEAR}-06`}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:`${YEAR}-07`})
  ],
  documents:[
    {id:"D-1",title:"Investigation plan template",type:"doc",size:"52 KB",companyId:"",caseId:"",owner:"Admin",created:ymdLocal(new Date(YEAR,6,1)),content:"Template body..."},
    {id:"D-2",title:"Interview guide (Sunrise)",type:"pdf",size:"128 KB",companyId:"C-001",caseId:"",owner:"Admin",created:ymdLocal(new Date(YEAR,6,3)),content:""},
    {id:"D-3",title:"Evidence snapshot",type:"image",size:"420 KB",companyId:"",caseId:"",owner:"Admin",created:ymdLocal(new Date(YEAR,6,10)),content:""}
  ],
  events:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

const EV_KEY="synergy_events_v5";
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

/* App */
const App={ state:{
  route:"calendar",
  currentMonth: ymLocal(new Date()),
  currentCaseId:null, caseTab:"Details",
  currentCompanyId:null, companyTab:"Overview",
  currentContactId:null, contactTab:"Details",
  currentDocId:null, docTab:"Details"
}, set(p){ Object.assign(App.state,p||{}); render(); } };

/* UI shell */
function Topbar(){ return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; }
function Sidebar(active){ const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let html='<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'; for(const it of items) html+='<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>'; html+='</ul></aside>'; return html; }
function Shell(content,active){ return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

/* Calendar */
function monthStart(y,m){ return new Date(y,m,1); }
function monthEnd(y,m){ return new Date(y,m+1,0); }
function renderPill(ev){ const cls=(ev.type||'Appointment').toLowerCase().replace(/\s+/g,' '); const tag=ev.caseId?('<span class="mono" style="font-size:11px">Case '+ev.caseId+'</span>'):''; return '<div class="pill '+cls+'" data-act="openEvent" data-arg="'+ev.id+'"><span class="dot"></span><span>'+ev.title+'</span>'+tag+' <button class="x" title="Delete" data-act="deleteEvent" data-arg="'+ev.id+'">x</button></div>'; }
function Calendar(){ const [Y,M]=App.state.currentMonth.split('-').map(Number); const start=monthStart(Y,M-1); const end=monthEnd(Y,M-1); const dow=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; let head='<div class="cal-head"><button class="btn light" data-act="prevMonth">◀</button><button class="btn light" data-act="today">Today</button><div style="font-weight:600;margin-left:8px">'+start.toLocaleString(undefined,{month:"long",year:"numeric"})+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="dashboard">Back to dashboard</button></div>'; head+='<div class="cal-grid" style="margin-bottom:6px">'+dow.map(d=>'<div class="cal-dow">'+d+'</div>').join('')+'</div>'; let grid='<div class="cal-grid">'; const firstDow=(start.getDay()+6)%7; for(let i=0;i<firstDow;i++) grid+='<div class="cal-cell"></div>'; const byDay={}; for(const e of DATA.events){ (byDay[e.date]=byDay[e.date]||[]).push(e); } for(let d=1; d<=end.getDate(); d++){ const ds=ymdLocal(new Date(Y,M-1,d)); const list=(byDay[ds]||[]); grid+='<div class="cal-cell" data-act="newEventOn" data-arg="'+ds+'"><div class="cal-date">'+d+'</div><div class="cal-evt">'+list.map(renderPill).join('')+'</div></div>'; } grid+='</div>'; const quick=AddEventForm(); return Shell('<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+head+grid+'</div>'+quick,'calendar'); }
function AddEventForm(){ const caseOpts='<option value="">(optional)</option>'; return '<div class="section"><header><h3 class="section-title">Add Event</h3></header><div class="grid cols-4"><input class="input" id="qa-title" placeholder="Appointment or note"><input class="input" id="qa-date" type="date" value="'+ymdLocal(new Date())+'"><input class="input" id="qa-start" type="time" value="09:00"><input class="input" id="qa-end" type="time" value="10:00"><select class="input" id="qa-owner"><option>Admin</option><option>Alex Ng</option><option>Priya Menon</option><option>Chris Rice</option></select><select class="input" id="qa-type"><option>Appointment</option><option>Interview</option><option>Evidence review</option><option>Admin</option><option>Risk</option></select><select class="input" id="qa-case">'+caseOpts+'</select></div><div class="right" style="margin-top:8px"><button class="btn" data-act="createQuickEvent">Create</button></div></div>'; }

/* Render router */
function render(){ const r=App.state.route, el=document.getElementById('app'); if(r==='calendar') el.innerHTML=Calendar(); else el.innerHTML=Calendar(); }

/* Modal control */
let currentEditId=null;
function openModal(ev){ currentEditId=ev&&ev.id?ev.id:null; const m=document.getElementById('modal'); document.getElementById('md-title').value=(ev&&ev.title)||''; document.getElementById('md-date').value=(ev&&ev.date)||ymdLocal(new Date()); document.getElementById('md-start').value=(ev&&ev.start)||'09:00'; document.getElementById('md-end').value=(ev&&ev.end)||'10:00'; document.getElementById('md-owner').innerHTML=['Admin','Alex Ng','Priya Menon','Chris Rice'].map(n=>'<option '+((ev&&ev.owner)===n?'selected':'')+'>'+n+'</option>').join(''); document.getElementById('md-type').value=(ev&&ev.type)||'Appointment'; m.classList.remove('hidden'); }
function closeModal(){ document.getElementById('modal').classList.add('hidden'); currentEditId=null; }

/* Actions */
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='prevMonth'){ const d=parseYMD(App.state.currentMonth+'-01'); d.setMonth(d.getMonth()-1); App.set({currentMonth: ymLocal(d)}); return; }
  if(act==='today'){ const d=new Date(); App.set({currentMonth: ymLocal(d)}); return; }
  if(act==='createQuickEvent'){ const ev={ id:uid(), title:(document.getElementById('qa-title').value||'Untitled').trim(), date:document.getElementById('qa-date').value||ymdLocal(new Date()), start:document.getElementById('qa-start').value||'09:00', end:document.getElementById('qa-end').value||'10:00', owner:document.getElementById('qa-owner').value||'Admin', type:document.getElementById('qa-type').value||'Appointment', caseId:(document.getElementById('qa-case').value||'')||null }; DATA.events.push(ev); persistEvents(); App.set({}); return; }
  if(act==='newEventOn'){ openModal({date:arg}); return; }
  if(act==='openEvent'){ const ev=DATA.events.find(e=>e.id===arg); if(ev) openModal(ev); return; }
  if(act==='deleteEvent'){ DATA.events=DATA.events.filter(e=>e.id!==arg); persistEvents(); App.set({}); return; }
  if(act==='closeModal'){ closeModal(); return; }
  if(act==='saveEvent'){ const payload={ id: currentEditId || uid(), title:(document.getElementById('md-title').value||'Untitled').trim(), date:document.getElementById('md-date').value||ymdLocal(new Date()), start:document.getElementById('md-start').value||'09:00', end:document.getElementById('md-end').value||'10:00', owner:document.getElementById('md-owner').value||'Admin', type:document.getElementById('md-type').value||'Appointment', caseId:(document.getElementById('md-case')?.value||'')||null }; const i=DATA.events.findIndex(e=>e.id===payload.id); if(i>=0) DATA.events[i]=payload; else DATA.events.push(payload); persistEvents(); closeModal(); App.set({}); return; }
});

document.addEventListener('DOMContentLoaded', ()=>{ App.set({route:'calendar'}); });
})();