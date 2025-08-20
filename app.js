(function(){"use strict";
const BUILD="v2.17.3-hs";
const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);

function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear();

const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  cases:[
    {id:uid(),fileNumber:"INV-2025-101",title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:"2025-01",notes:[],tasks:[],folders:{General:[]}},
    {id:uid(),fileNumber:"INV-2025-102",title:"Bullying allegation – IT",organisation:"City of Melbourne",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Investigation",priority:"High",created:"2025-02",notes:[],tasks:[],folders:{General:[]}}
  ],
  events: loadEvents() || [
    ev("Interview planning","2025-08-06","09:00","10:00","Admin","Appointment"),
    ev("Evidence review","2025-08-13","10:00","11:30","Admin","Appointment"),
    ev("Client check-in","2025-08-19","14:00","14:30","Admin","Call"),
    ev("Admin all-hands","2025-08-26","10:00","11:00","Admin","Meeting"),
    ev("Draft report sync","2025-08-22","16:00","16:30","Admin","Meeting"),
    ev("Case intake - Sunrise","2025-08-03","09:30","10:00","Admin","Case")
  ],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

function ev(title,date,start,end,owner,type){return {id:uid(),title,date,start,end,owner,type,caseId:""}; }
function saveEvents(){ try{localStorage.setItem('synergy_events_v2', JSON.stringify(DATA.events||[]));}catch(_){} }
function loadEvents(){ try{return JSON.parse(localStorage.getItem('synergy_events_v2')||"null");}catch(_ ){return null;} }

const App={state:{route:"dashboard",asUser:null, currentCaseId:null, caseTab:"details", calYM:[2025,8],
  draftEvent:null}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;} };

function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'; 
s+='<span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
function Sidebar(active){const base=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');} out.push('</ul></aside>'); return out.join('');}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// Dashboard
function Dashboard(){ const d=App.get(); let rows=''; for(const c of d.cases.slice(0,6)) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';
const tbl='<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div><button class="btn" data-act="route" data-arg="calendar">Open Calendar</button></div><div class="mono">Build: '+STAMP+'</div></div>'
+ '<div class="section"><header><h3 class="section-title">Active Cases</h3></header>'+tbl+'</div>';
return Shell(html,'dashboard'); }

// Cases (simple list)
function Cases(){ const d=App.get(); let rows=''; for(const c of d.cases) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';
return Shell('<div class="section"><header><h3 class="section-title">Cases</h3><button class="btn" data-act="newCase">New Case</button></header><table><thead><tr><th>Case</th><th>Title</th><th>Org</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases'); }

function CasePage(id){ const d=App.get(); const cs=d.cases.find(x=>x.id===id); if(!cs) return Shell('<div class="card">Case not found</div>','cases');
const tabs=[["details","Details"],["notes","Notes"],["tasks","Tasks"],["docs","Documents"]];
let tabBar=tabs.map(t=>'<button class="btn '+(App.state.caseTab===t[0]?'':'light')+'" data-act="caseTab" data-arg="'+t[0]+'">'+t[1]+'</button>').join(' ');
let header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div>'+tabBar+'<div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="cases">Back</button></div></div>';
let body='';
if(App.state.caseTab==='details'){ body='<div class="card"><div class="grid cols-2"><div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div><div><label>Organisation</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div><div><label>Status</label><select class="input" id="c-status"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div><div><label>Priority</label><select class="input" id="c-priority"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div></div></div>'; }
if(App.state.caseTab==='notes'){ let rows=(cs.notes||[]).map(n=>'<tr><td>'+n.time+'</td><td>'+n.by+'</td><td>'+n.text+'</td></tr>').join(''); if(!rows) rows='<tr><td colspan="3" class="muted">No notes</td></tr>'; body='<div class="section"><header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add note</button></header><textarea id="note-text" class="input" placeholder="Type note…"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; }
if(App.state.caseTab==='tasks'){ let rows=(cs.tasks||[]).map(t=>'<tr><td>'+t.id+'</td><td>'+t.title+'</td><td>'+t.assignee+'</td><td>'+t.due+'</td><td>'+t.status+'</td></tr>').join(''); if(!rows) rows='<tr><td colspan="5" class="muted">No tasks</td></tr>'; body='<div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input id="task-title" class="input" placeholder="Task title"><input id="task-due" class="input" type="date"><select class="input" id="task-assignee">'+d.users.map(u=>'<option>'+u.name+'</option>').join('')+'</select></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; }
if(App.state.caseTab==='docs'){ body='<div class="card"><div class="muted">Document manager stub</div></div>'; }
return Shell(header+body,'cases'); }

// Calendar
function CalendarView(){ const [y,m]=App.state.calYM; const first=new Date(y,m-1,1); const startDow=(first.getDay()+6)%7; // Mon=0
const days=new Date(y,m,0).getDate();
let html='<div class="section"><header class="cal-head"><button class="btn light" data-act="calPrev">‹</button><button class="btn light" data-act="calToday">Today</button><div style="font-weight:600;margin-left:8px">'+first.toLocaleString(undefined,{month:"long",year:"numeric"})+'</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="dashboard">Back to dashboard</button></header>';
html+='<div class="cal-grid">';
const blanks=startDow;
for(let i=0;i<blanks;i++) html+='<div class="cal-day" aria-hidden="true"></div>';
for(let d=1; d<=days; d++){ const date=fmtDate(new Date(y,m-1,d)); html+='<div class="cal-day"><div class="d">'+d+'</div>'+dayEvents(date)+'</div>'; }
html+='</div></div>';
html+=AddEventForm();
return Shell(html,'calendar'); }

function dayEvents(dateStr){ const list=(DATA.events||[]).filter(e=>e.date===dateStr); if(!list.length) return ''; return list.map(e=>'<span class="ev"><span class="dot"></span>'+esc(e.title)+' <button class="x" title="Delete" data-act="delEvent" data-arg="'+e.id+'">x</button><button class="x" title="Edit" data-act="editEvent" data-arg="'+e.id+'">•</button></span>').join(''); }

function AddEventForm(){ const ev=App.state.draftEvent||{title:"",date:"",start:"09:00",end:"10:00",owner:"Admin",type:"Appointment",caseId:""};
return '<div class="section"><header><h3 class="section-title">'+(ev.id?'Edit Event':'Add Event')+'</h3><div>'+(ev.id?'<button class="btn light" data-act="cancelEdit">Cancel</button>':'')+'</div></header>'
+'<div class="grid cols-4"><div><label>Title</label><input id="ev-title" class="input" value="'+(ev.title||'')+'" placeholder="Appointment or note"></div>'
+'<div><label>Date</label><input id="ev-date" class="input" type="date" value="'+(ev.date||'')+'"></div>'
+'<div><label>Start</label><input id="ev-start" class="input" type="time" value="'+(ev.start||'')+'"></div>'
+'<div><label>End</label><input id="ev-end" class="input" type="time" value="'+(ev.end||'')+'"></div>'
+'<div><label>Owner</label><select id="ev-owner" class="input">'+DATA.users.map(u=>'<option '+(u.name===ev.owner?'selected':'')+'>'+u.name+'</option>').join('')+'</select></div>'
+'<div><label>Type</label><select id="ev-type" class="input"><option '+(ev.type==='Appointment'?'selected':'')+'>Appointment</option><option '+(ev.type==='Meeting'?'selected':'')+'>Meeting</option><option '+(ev.type==='Call'?'selected':'')+'>Call</option><option '+(ev.type==='Case'?'selected':'')+'>Case</option></select></div>'
+'<div><label>Case (optional)</label><select id="ev-case" class="input"><option value="">(optional)</option>'+DATA.cases.map(c=>'<option '+((ev.caseId||'')===c.id?'selected':'')+' value="'+c.id+'">'+c.fileNumber+'</option>').join('')+'</select></div>'
+'<div class="right" style="align-self:end"><button class="btn" data-act="'+(ev.id?'updateEvent':'createEvent')+'">'+(ev.id?'Update':'Create')+'</button></div></div></div>'; }

// Helpers
function fmtDate(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const day=('0'+d.getDate()).slice(-2); return y+'-'+m+'-'+day; }
function esc(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// Render
function render(){ const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…';
if(r==='dashboard') el.innerHTML=Dashboard();
else if(r==='calendar') el.innerHTML=CalendarView();
else if(r==='cases') el.innerHTML=Cases();
else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
else el.innerHTML=Dashboard();
document.getElementById('boot').textContent='Ready ('+BUILD+')'; }

// Actions
document.addEventListener('click',e=>{ let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg')||'';
if(act==='route'){ App.set({route:arg}); return; }
if(act==='calPrev'){ let [y,m]=App.state.calYM; m--; if(m<1){m=12;y--;} App.set({calYM:[y,m]}); return; }
if(act==='calToday'){ const d=new Date(); App.set({calYM:[d.getFullYear(), d.getMonth()+1]}); return; }
if(act==='openCase'){ App.set({route:'case', currentCaseId:arg}); return; }
if(act==='newCase'){ const c={id:uid(),fileNumber:'INV-'+YEAR+'-'+('00'+(DATA.cases.length+1)).slice(-3),title:'New case',organisation:'',investigatorEmail:'',investigatorName:'',status:'Planning',priority:'Medium',created:fmtDate(new Date()),notes:[],tasks:[],folders:{General:[]}}; DATA.cases.unshift(c); App.set({route:'case', currentCaseId:c.id}); return; }
if(act==='saveCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const gv=id=>{const el=document.getElementById(id); return el?el.value:null;}; const s={title:gv('c-title'), organisation:gv('c-org'), status:gv('c-status'), priority:gv('c-priority')}; Object.assign(cs,s); alert('Case saved'); return; }
if(act==='deleteCase'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; if(confirm('Delete '+(cs.fileNumber||cs.title)+'?')){ DATA.cases=DATA.cases.filter(x=>x.id!==cs.id); App.set({route:'cases'}); } return; }
if(act==='caseTab'){ App.set({caseTab:arg}); return; }
if(act==='addStdTasks'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const base=cs.tasks; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(a=>base.push({id:'T-'+(base.length+1),title:a,assignee:'',due:'',status:'Open'})); App.set({}); return; }
if(act==='addTask'){ const cs=DATA.cases.find(c=>c.id===arg); if(!cs) return; const who=document.getElementById('task-assignee').value; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,assignee:who,due:document.getElementById('task-due').value,status:'Open'}); App.set({}); return; }

// events
if(act==='createEvent' || act==='updateEvent'){ const ev={id:(App.state.draftEvent&&App.state.draftEvent.id)||uid(), title:document.getElementById('ev-title').value, date:document.getElementById('ev-date').value, start:document.getElementById('ev-start').value, end:document.getElementById('ev-end').value, owner:document.getElementById('ev-owner').value, type:document.getElementById('ev-type').value, caseId:document.getElementById('ev-case').value};
if(!ev.title||!ev.date){ alert('Title and date are required'); return; }
DATA.events = (DATA.events||[]).filter(e=>e.id!==ev.id); DATA.events.push(ev); saveEvents(); App.set({draftEvent:null}); return; }
if(act==='delEvent'){ const id=arg; DATA.events=(DATA.events||[]).filter(e=>e.id!==id); saveEvents(); App.set({}); return; }
if(act==='editEvent'){ const id=arg; const e2=(DATA.events||[]).find(e=>e.id===id); App.set({draftEvent:e2}); return; }
if(act==='cancelEdit'){ App.set({draftEvent:null}); return; }
});

document.addEventListener('DOMContentLoaded',()=>{ const d=new Date(); App.set({route:'dashboard', calYM:[d.getFullYear(), d.getMonth()+1]}); });

})();
