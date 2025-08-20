(function(){
"use strict";
const BUILD="v2.17.3"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);

function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const Y=(new Date()).getFullYear(), M=(new Date()).getMonth()+1;

function mkCase(y,seq,p){let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b;}

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
    mkCase(Y-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:(Y-1)+"-01"}),
    mkCase(Y-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:(Y-1)+"-07"}),
    mkCase(Y,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:Y+"-01"}),
    mkCase(Y,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:Y+"-06"}),
    mkCase(Y,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:Y+"-07"})
  ],
  events:[
    // Month seeds near current month
    {id:uid(), title:"Interview planning", date:`${Y}-08-06`, start:"09:00", end:"10:00", owner:"Admin", type:"Interview", caseId:null},
    {id:uid(), title:"Evidence review", date:`${Y}-08-13`, start:"10:00", end:"12:00", owner:"Admin", type:"Evidence review", caseId:null},
    {id:uid(), title:"Client check-in", date:`${Y}-08-19`, start:"11:00", end:"11:30", owner:"Admin", type:"Appointment", caseId:null},
    {id:uid(), title:"Admin all-hands", date:`${Y}-08-26`, start:"09:00", end:"09:30", owner:"Admin", type:"Admin", caseId:null},
    {id:uid(), title:"Case intake - Sunrise", date:`${Y}-08-03`, start:"13:00", end:"14:00", owner:"Admin", type:"Risk", caseId:null}
  ],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const App={state:{route:"calendar", month:new Date().toISOString().slice(0,7), editingEventId:null, casesFilter:{q:""}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
function Sidebar(active){const base=[["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');} out.push('</ul></aside>'); return out.join('');}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

/* Utilities */
function fmt(d){ return d.toISOString().slice(0,10); }
function addDays(date, n){ const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function startOfMonth(date){ const d=new Date(date); d.setDate(1); return d; }
function endOfMonth(date){ const d=new Date(date); d.setMonth(d.getMonth()+1); d.setDate(0); return d; }
function dayOfWeek(date){ return (new Date(date)).getDay(); } // 0..6 (Sun..Sat)
function ymd(date){ const d=new Date(date); const m=("0"+(d.getMonth()+1)).slice(-2); const dy=("0"+d.getDate()).slice(-2); return `${d.getFullYear()}-${m}-${dy}`; }

/* Calendar views */
function CalendarPage(){
  const d=App.get();
  const [yy,mm]=App.state.month.split("-").map(x=>parseInt(x,10));
  const visible=new Date(yy,mm-1,1);
  const first=startOfMonth(visible), last=endOfMonth(visible);
  const lead=((first.getDay()+6)%7)+1; // convert to Mon=1..Sun=7 to match UI columns starting Mon
  const start=addDays(first, -(lead-1));
  const cells=[]; for(let i=0;i<42;i++){ cells.push(addDays(start,i)); }
  const label=visible.toLocaleString(undefined,{month:'long',year:'numeric'});

  // Filter events in the 6-week window
  const eByDay={};
  for(const ev of d.events){
    const dk=ev.date;
    eByDay[dk]=eByDay[dk]||[];
    eByDay[dk].push(ev);
  }

  // header
  let head='<div class="cal-head">'
    + '<button class="btn light" data-act="prevMonth">‹</button>'
    + '<button class="btn light" data-act="today">Today</button>'
    + '<h3 style="margin:0 8px 0 8px">'+label+'</h3>'
    + '<button class="btn light" data-act="nextMonth">›</button>'
    + '<div class="sp"></div>'
    + '</div>';

  // weekday labels
  head += '<div class="cal-grid" style="margin-bottom:6px">'
    + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(w=>'<div class="muted" style="padding:0 6px">'+w+'</div>').join('')
    +'</div>';

  // grid
  let grid='<div class="cal-grid">';
  for(const dt of cells){
    const key=ymd(dt);
    const inMonth=(dt.getMonth()===visible.getMonth());
    grid+='<div class="cal-cell" '+(inMonth?'':'style="opacity:.55"')+' data-act="newEventOn" data-arg="'+key+'">'
      + '<div class="day">'+dt.getDate()+'</div>'
      + '<div class="cal-events">'
      + (eByDay[key]? eByDay[key].map(renderPill).join('') : '')
      + '</div>'
      + '</div>';
  }
  grid+='</div>';

  // quick-add
  const caseOpts=['<option value="">(optional)</option>'].concat(d.cases.map(c=>`<option value="${c.id}">${c.fileNumber}</option>`)).join('');
  const ownerOpts=d.users.map(u=>`<option>${u.name}</option>`).join('');
  const quick='<div class="section"><header><h3 class="section-title">Add Event</h3></header>'
   + '<div class="grid cols-4">'
   + '<input class="input" id="qa-title" placeholder="Appointment or note">'
   + '<input class="input" id="qa-date" type="date">'
   + '<input class="input" id="qa-start" type="time" value="09:00">'
   + '<input class="input" id="qa-end" type="time" value="10:00">'
   + '<select class="input" id="qa-owner">'+ownerOpts+'</select>'
   + '<select class="input" id="qa-type"><option>Appointment</option><option>Interview</option><option>Evidence review</option><option>Admin</option><option>Risk</option></select>'
   + '<select class="input" id="qa-case">'+caseOpts+'</select>'
   + '</div><div class="right" style="margin-top:8px"><button class="btn" data-act="createQuickEvent">Create</button></div></div>';

  return Shell('<div class="section"><header><h3 class="section-title">Calendar</h3></header>'+ head + grid +'</div>'+ quick,'calendar');
}

function renderPill(ev){
  const cls = (ev.type||'Appointment').toLowerCase().replace(' ','-');
  const map = { "appointment":"appointment", "interview":"interview", "evidence review":"review", "admin":"admin", "risk":"risk" };
  const key = map[cls] || "appointment";
  const tag = ev.caseId ? ` <span class="muted" style="font-size:11px">Case: ${findCase(ev.caseId)?.fileNumber||''}</span>` : '';
  return `<div class="pill ${key}" data-act="openEvent" data-arg="${ev.id}"><span class="dot"></span><span>${ev.title}</span>${tag}<span style="margin-left:6px" class="muted">×</span></div>`;
}

/* Other pages (minimal to keep size reasonable) */
function Cases(){const d=App.get(); let rows=''; for(const cc of d.cases){rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header><table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');}
function Contacts(){const d=App.get(); let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+c.companyId+'</td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}
function Companies(){const d=App.get(); let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}
function Documents(){return Shell('<div class="card">Coming soon</div>','documents');}
function Resources(){return Shell('<div class="card">Coming soon</div>','resources');}

/* Render */
function render(){
  const r=App.state.route, el=document.getElementById('app');
  document.getElementById('boot').textContent='Rendering '+r+'…';
  if(r==='calendar') el.innerHTML=CalendarPage();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else el.innerHTML=CalendarPage();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
  wireModalClose();
}

/* Modal helpers */
function openModal(evId){
  const m=document.getElementById('modal'); m.classList.remove('hidden');
  App.state.editingEventId=evId;
  const ev=DATA.events.find(e=>e.id===evId)||{id:null};
  const ownerSel=document.getElementById('ev-owner');
  ownerSel.innerHTML=DATA.users.map(u=>`<option ${ev.owner===u.name?'selected':''}>${u.name}</option>`).join('');
  const caseSel=document.getElementById('ev-case');
  caseSel.innerHTML=['<option value="">(optional)</option>'].concat(DATA.cases.map(c=>`<option value="${c.id}" ${ev.caseId===c.id?'selected':''}>${c.fileNumber}</option>`)).join('');

  document.getElementById('ev-title').value=ev.title||'';
  document.getElementById('ev-date').value=ev.date||new Date().toISOString().slice(0,10);
  document.getElementById('ev-start').value=ev.start||'09:00';
  document.getElementById('ev-end').value=ev.end||'10:00';
  document.getElementById('ev-type').value=ev.type||'Appointment';
  document.getElementById('ev-delete').style.display = ev.id ? 'inline-block' : 'none';
}
function closeModal(){ const m=document.getElementById('modal'); m.classList.add('hidden'); App.state.editingEventId=null; }
function wireModalClose(){ const x=document.getElementById('modal-close'); if(x){ x.onclick=()=>closeModal(); } }

/* Actions */
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode;
  if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route'){App.set({route:arg}); return;}
  if(act==='prevMonth'){ const [yy,mm]=App.state.month.split('-').map(n=>parseInt(n,10)); const d=new Date(yy,mm-2,1); App.set({month:d.toISOString().slice(0,7)}); return; }
  if(act==='nextMonth'){ const [yy,mm]=App.state.month.split('-').map(n=>parseInt(n,10)); const d=new Date(yy,mm,1); App.set({month:d.toISOString().slice(0,7)}); return; }
  if(act==='today'){ const d=new Date(); App.set({month:d.toISOString().slice(0,7)}); return; }

  if(act==='createQuickEvent'){
    const title=document.getElementById('qa-title').value||'Untitled';
    const date=document.getElementById('qa-date').value||new Date().toISOString().slice(0,10);
    const start=document.getElementById('qa-start').value||'09:00';
    const end=document.getElementById('qa-end').value||'10:00';
    const owner=document.getElementById('qa-owner').value||'Admin';
    const type=document.getElementById('qa-type').value||'Appointment';
    const caseId=document.getElementById('qa-case').value||null;
    DATA.events.push({id:uid(),title,date,start,end,owner,type,caseId});
    App.set({});
    return;
  }

  if(act==='openEvent'){ openModal(arg); return; }
  if(act==='newEventOn'){ // click in a day cell
    openModal(null);
    document.getElementById('ev-date').value = arg;
    return;
  }
  if(act==='saveEvent'){
    const id=App.state.editingEventId || uid();
    const payload={
      id,
      title:document.getElementById('ev-title').value||'Untitled',
      date:document.getElementById('ev-date').value||new Date().toISOString().slice(0,10),
      start:document.getElementById('ev-start').value||'09:00',
      end:document.getElementById('ev-end').value||'10:00',
      owner:document.getElementById('ev-owner').value||'Admin',
      type:document.getElementById('ev-type').value||'Appointment',
      caseId:(document.getElementById('ev-case').value||'')||null
    };
    const i=DATA.events.findIndex(e=>e.id===id);
    if(i>=0) DATA.events[i]=payload; else DATA.events.push(payload);
    closeModal();
    App.set({});
    return;
  }
  if(act==='deleteEvent'){
    const id=App.state.editingEventId;
    if(!id){ closeModal(); return; }
    DATA.events = DATA.events.filter(e=>e.id!==id);
    closeModal();
    App.set({});
    return;
  }
  if(act==='closeModal'){ closeModal(); return; }
});

document.addEventListener('DOMContentLoaded',()=>{ App.set({}); });
})();