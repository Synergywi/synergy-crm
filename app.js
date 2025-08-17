// Solid SPA logic with HubSpot visuals preserved
const App = { state:{ route:'dashboard', view:'month', notifications:[], notificationsUnread:0, showUnread:false, filterOwner:'All', tab:null, modal:false, openEventId:null, params:{} } };
const DATA = JSON.parse(localStorage.getItem('SYNERGY_DATA')||'null') || seedData();

function seedData(){
  return {
    me:{ id:'u-admin', name:'Admin', role:'Admin', email:'admin@synergy.com'},
    users:[
      {id:'u-admin', name:'Admin', role:'Admin', email:'admin@synergy.com'},
      {id:'u-1', name:'Investigator', role:'Investigator', email:'inv1@synergy.com'},
      {id:'u-2', name:'Analyst', role:'Investigator', email:'inv2@synergy.com'}
    ],
    cases:[
      {id:'C-1001', title:'Procurement Irregularities', companyId:'CO-1', investigator:'u-1', status:'Investigation', priority:'High', fileNo:'F-2025-01', organisation:'Synergy Gov'},
      {id:'C-1002', title:'Travel Expenses Review', companyId:'CO-2', investigator:'u-2', status:'Planning', priority:'Medium', fileNo:'F-2025-02', organisation:'Synergy Gov'}
    ],
    companies:[
      {id:'CO-1', name:'Acme Pty Ltd', industry:'Manufacturing', city:'Brisbane'},
      {id:'CO-2', name:'Globex Ltd', industry:'Finance', city:'Sydney'}
    ],
    contacts:[
      {id:'P-1', name:'Jessie Shaw', email:'jessie@acme.test', phone:'0412 000 111', companyId:'CO-1'},
      {id:'P-2', name:'Riley Tran', email:'riley@globex.test', phone:'0413 000 222', companyId:'CO-2'}
    ],
    notes:{}, tasks:{}, documents:{}, people:{},
    events:[]
  };
}
function persist(){ localStorage.setItem('SYNERGY_DATA', JSON.stringify(DATA)); }
function userById(id){ return DATA.users.find(u=>u.id===id) || {name:'Unknown'}; }
function today(){ return new Date().toISOString().slice(0,10); }
function statusChip(s){
  const map={Planning:'plan', Investigation:'invest', 'Evidence Review':'review', Reporting:'report', Closed:'closed'};
  const cls=map[s]||'plan';
  return `<span class="status ${cls}">${s}</span>`;
}
function Shell(content,active){
  const me=DATA.me;
  const unread=(me.role==='Admin')?App.state.notificationsUnread:0;
  const nav=[
    ['dashboard','🏠','Dashboard'],
    ['calendar','🗓️','Calendar'],
    ['cases','🧾','Cases'],
    ['companies','🏢','Companies'],
    ['contacts','👤','Contacts'],
    ['documents','📄','Documents'],
    ['resources','🔗','Resources'],
    ['admin','⚙️','Admin']
  ];
  return `<div class="topbar">
    <div class="brand">Synergy CRM</div>
    <div class="sp"></div>
    ${me.role==='Admin' && unread>0? `<span class="notif">${unread}</span>`:''}
    <div class="muted">You: ${me.name} (${me.role})</div>
    ${me.role!=='Admin'?'<button class="btn light" data-act="clearImpersonation">Switch to Admin</button>':''}
    <span class="badge">Soft Stable ${window.BUILD||''}</span>
  </div>
  <div class="shell">
    <aside class="sidebar">
      <h3>Navigation</h3>
      <ul class="nav">
        ${nav.map(([r,ic,label])=>`<li class="${active===r?'active':''}" data-route="${r}"><span class="icon">${ic}</span><span>${label}</span></li>`).join('')}
      </ul>
    </aside>
    <main class="main">${content}</main>
  </div>`;
}

// Dashboard & Notifications
function Dashboard(){
  const me=DATA.me;
  const notifCard = me.role==='Admin' ? CardCalendarUpdates() : '';
  const summary = `<div class="card"><h3>Welcome</h3><div class="muted">Landed on Dashboard.</div></div>`;
  return Shell(`<div class="grid">${notifCard}${summary}</div>`,'dashboard');
}
function CardCalendarUpdates(){
  const unread=App.state.notificationsUnread;
  const showUnread=App.state.showUnread;
  const list=(showUnread? App.state.notifications.filter(n=>!n.read) : App.state.notifications);
  const rows = list.length ? list.map(n=>{
    const e=n.payload||{};
    const who=userById(e.owner||'').name||'-';
    const when=new Date(n.ts).toLocaleString();
    return `<tr><td class="small">${when}</td><td>${e.title||''}</td><td>${who}</td>
      <td><button class="btn" data-act="openNotif" data-id="${n.id}">Open</button></td></tr>`;
  }).join('') : `<tr><td colspan="4" class="muted">No calendar activity</td></tr>`;
  return `<div class="card">
    <div class="section"><header><h3 class="section-title">Calendar updates ${unread>0?`<span class="notif">${unread}</span>`:''}</h3>
      <div class="toolbar">
        <button class="btn light" data-act="toggleShowUnread">${showUnread?'Show all':'Show unread'}</button>
        <button class="btn" data-act="markAllRead">Mark all read</button>
      </div></header></div>
    <table><thead><tr><th>When</th><th>Title</th><th>Owner</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
}

// Calendar
function Calendar(){
  const me=DATA.me;
  const view=App.state.view||'month';
  const ownerFilterUI = (me.role==='Admin') ? `<label class="small">Owner</label>
      <select id="ownerFilter">
        <option>All</option>${DATA.users.map(u=>`<option ${App.state.filterOwner===u.id?'selected':''} value="${u.id}">${u.name}</option>`).join('')}
      </select>` : '';
  const header = `<div class="card">
    <div class="toolbar">
      <button class="btn" data-act="gotoMonth">Month</button>
      <button class="btn" data-act="gotoAgenda">Agenda</button>
      <div class="sp"></div>
      ${ownerFilterUI}
    </div>
    ${view==='month'? MonthGrid() : AgendaTable()}
  </div>
  <div class="card">
    <h3>Add Event</h3>
    ${AddEventForm()}
  </div>`;
  return Shell(header,'calendar');
}
function MonthGrid(){
  const dt=new Date();
  const year=dt.getFullYear(), month=dt.getMonth();
  const first=new Date(year,month,1);
  const start=new Date(first); start.setDate(1 - ((first.getDay()+6)%7)); // Monday
  const cells=[];
  for(let i=0;i<42;i++){
    const d=new Date(start); d.setDate(start.getDate()+i);
    const dstr=d.toISOString().slice(0,10);
    const inMonth=(d.getMonth()===month);
    const events = visibleEvents().filter(e=>e.date===dstr);
    cells.push(`<div class="calendar-cell ${inMonth?'':'muted'}">
      <div class="small">${d.getDate()}</div>
      ${events.map(e=>`<a class="event-chip" data-act="openEvent" data-id="${e.id}">${e.title}</a>`).join('')}
    </div>`);
  }
  return `<div class="calendar-grid">${cells.join('')}</div>`;
}
function AgendaTable(){
  const list = visibleEvents().sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));
  return `<table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Owner</th><th></th></tr></thead><tbody>${
    list.map(e=>`<tr>
      <td>${e.date}</td><td>${e.start||''}–${e.end||''}</td><td>${e.title}</td><td>${userById(e.owner).name}</td>
      <td><button class="btn" data-act="editEvent" data-id="${e.id}">Edit</button>
          <button class="btn" data-act="deleteEvent" data-id="${e.id}">Delete</button></td>
    </tr>`).join('')
  }</tbody></table>`;
}
function visibleEvents(){
  const me=DATA.me, isAdmin=me.role==='Admin';
  let list=DATA.events.slice();
  if(!isAdmin) list=list.filter(e=>e.owner===me.id);
  if(isAdmin && App.state.filterOwner && App.state.filterOwner!=='All'){
    list=list.filter(e=>e.owner===App.state.filterOwner);
  }
  return list;
}
function AddEventForm(){
  const me=DATA.me;
  return `<div class="grid cols-3">
    <div><label>Title</label><input class="input" id="evTitle" placeholder="Title"></div>
    <div><label>Date</label><input class="input" id="evDate" type="date" value="${today()}"></div>
    <div><label>Type</label><select class="select" id="evType"><option>Meeting</option><option>Call</option><option>Site Visit</option></select></div>
    <div><label>Start</label><input class="input" id="evStart" type="time" value="09:00"></div>
    <div><label>End</label><input class="input" id="evEnd" type="time" value="10:00"></div>
    <div><label>Location</label><input class="input" id="evLoc" placeholder="Location"></div>
    <div><label>Case (optional)</label><select class="select" id="evCase"><option value="">—</option>${
      DATA.cases.map(c=>`<option value="${c.id}">${c.id} — ${c.title}</option>`).join('')
    }</select></div>
    <div><label>Owner</label><select class="select" id="evOwner">${
      DATA.users.map(u=>`<option value="${u.id}" ${u.id===me.id?'selected':''}>${u.name}</option>`).join('')
    }</select></div>
    <div style="align-self:end"><button class="btn primary" data-act="addEvent">Add Event</button></div>
  </div>`;
}

// Cases
function Cases(){
  const rows = DATA.cases.map(c=>`<tr>
    <td>${c.id}</td><td>${c.title}</td>
    <td>${(DATA.companies.find(co=>co.id===c.companyId)||{}).name||''}</td>
    <td>${userById(c.investigator).name}</td>
    <td>${statusChip(c.status)}</td>
    <td><button class="btn" data-act="openCase" data-id="${c.id}">Open</button></td>
  </tr>`).join('');
  return Shell(`<div class="card">
    <h3>Cases</h3>
    <table><thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows}</tbody></table></div>`,'cases');
}
function CasePage(id){
  const c = DATA.cases.find(x=>x.id===id);
  const tabs=['Details','Notes','Tasks','Documents','People','Calendar'];
  const active=App.state.tab||'Details';
  function tabBtn(t){ return `<div class="tab ${active===t?'active':''}" data-act="tab" data-tab="${t}">${t}</div>`; }
  let inner='';
  if(active==='Details'){
    inner = `<div class="kv">
      <div class="k">File no.</div><div>${c.fileNo||''}</div>
      <div class="k">Title</div><div>${c.title}</div>
      <div class="k">Organisation</div><div>${c.organisation||''}</div>
      <div class="k">Company</div><div>${(DATA.companies.find(co=>co.id===c.companyId)||{}).name||''}</div>
      <div class="k">Investigator</div><div>${userById(c.investigator).name}</div>
      <div class="k">Status</div><div>${statusChip(c.status)}</div>
      <div class="k">Priority</div><div>${c.priority||''}</div>
    </div>
    <div class="toolbar"><button class="btn primary">Save</button><button class="btn">Delete</button><button class="btn" data-route="cases">Back</button></div>`;
  } else if(active==='Notes'){
    const list=(DATA.notes[id]||[]);
    inner = `<div class="toolbar"><input class="input" id="noteTxt" placeholder="Add a note" style="flex:1"><button class="btn" data-act="addNote" data-id="${id}">Add</button></div>
      <table><tbody>${list.map(n=>`<tr><td class="small">${new Date(n.ts).toLocaleString()}</td><td>${n.text}</td></tr>`).join('')}</tbody></table>`;
  } else if(active==='Tasks'){
    const list=(DATA.tasks[id]||[]);
    inner = `<div class="toolbar"><input class="input" id="taskTxt" placeholder="Add a task" style="flex:1"><button class="btn" data-act="addTask" data-id="${id}">Add</button>
      <button class="btn" data-act="addStdTasks" data-id="${id}">Add standard tasks</button></div>
      <table><tbody>${list.map(t=>`<tr><td>${t.text}</td><td>${t.done?'✓':''}</td></tr>`).join('')}</tbody></table>`;
  } else if(active==='Documents'){
    inner = `<div class="muted">General folder present. (Demo upload/remove placeholder)</div>`;
  } else if(active==='People'){
    const linked=(DATA.people[id]||[]);
    const avail=DATA.contacts.filter(p=>!linked.includes(p.id));
    inner = `<div class="toolbar"><select class="select" id="linkPerson">${avail.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
      <button class="btn" data-act="linkPerson" data-id="${id}">Link</button></div>
      <table><thead><tr><th>Name</th><th></th></tr></thead><tbody>${
        linked.map(pid=>{
          const p=DATA.contacts.find(x=>x.id===pid)||{};
          return `<tr><td>${p.name}</td><td><button class="btn" data-act="openContact" data-id="${pid}">Open contact</button>
          <button class="btn" data-act="unlinkPerson" data-id="${id}" data-p="${pid}">Unlink</button></td></tr>`;
        }).join('')
      }</tbody></table>
      <div class="toolbar"><button class="btn">View Portal</button></div>`;
  } else if(active==='Calendar'){
    const list = DATA.events.filter(e=>e.caseId===id);
    inner = `<div class="muted">${list.length? 'Case events listed below.' : 'No case events yet.'}</div>
      <table><thead><tr><th>Date</th><th>Title</th><th></th></tr></thead><tbody>${
        list.map(e=>`<tr><td>${e.date}</}</td><td>${e.title}</td>
        <td><button class="btn" data-act="openEvent" data-id="${e.id}">Edit/Delete</button></td></tr>`).join('')
      }</tbody></table>`;
  }
  const tabsHtml = `<div class="tabs">${tabs.map(tabBtn).join('')}</div>`;
  return Shell(`<div class="card"><h3>Case ${c.id}</h3>${tabsHtml}${inner}</div>`,'cases');
}

// Companies & Contacts
function Companies(){
  const rows = DATA.companies.map(c=>`<tr><td>${c.id}</td><td>${c.name}</td><td>${c.industry}</td><td>${c.city}</td>
    <td><button class="btn" data-act="openCompany" data-id="${c.id}">Open</button></td></tr>`).join('');
  return Shell(`<div class="card"><h3>Companies</h3>
    <table><thead><tr><th>ID</th><th>Name</th><th>Industry</th><th>City</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'companies');
}
function CompanyPage(id){
  const co = DATA.companies.find(c=>c.id===id);
  const tabs=['Summary','Company Contacts','Company Documents'];
  const active=App.state.tab||'Summary';
  function tabBtn(t){ return `<div class="tab ${active===t?'active':''}" data-act="tab" data-tab="${t}">${t}</div>`; }
  let inner='';
  if(active==='Summary'){
    const recent = DATA.cases.filter(c=>c.companyId===id).slice(0,5);
    inner = `<div class="kv">
      <div class="k">Name</div><div>${co.name}</div>
      <div class="k">Industry</div><div>${co.industry}</div>
      <div class="k">City</div><div>${co.city}</div>
    </div>
    <h4>Recent cases</h4>
    <table><tbody>${
      recent.map(c=>`<tr><td>${c.id}</td><td>${c.title}</td><td>${statusChip(c.status)}</td>
      <td><button class="btn" data-act="openCase" data-id="${c.id}">Open</button></td></tr>`).join('')
    }</tbody></table>`;
  } else if(active==='Company Contacts'){
    const list=DATA.contacts.filter(p=>p.companyId===id);
    inner = `<table><tbody>${list.map(p=>`<tr><td>${p.name}</td><td><button class="btn" data-act="openContact" data-id="${p.id}">Open</button></td></tr>`).join('')}</tbody></table>`;
  } else if(active==='Company Documents'){
    inner = `<div class="muted">Folder/upload parity with Case Documents (demo placeholder)</div>`;
  }
  const tabsHtml = `<div class="tabs">${tabs.map(tabBtn).join('')}</div>`;
  return Shell(`<div class="card"><h3>Company ${co.name}</h3>${tabsHtml}${inner}</div>`,'companies');
}
function Contacts(){
  const rows = DATA.contacts.map(p=>`<tr><td>${p.name}</td><td>${p.email}</td><td>${p.phone}</td>
    <td><button class="btn" data-act="openContact" data-id="${p.id}">Open</button></td></tr>`).join('');
  return Shell(`<div class="card"><h3>Contacts</h3>
    <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'contacts');
}
function ContactPage(id){
  const p = DATA.contacts.find(x=>x.id===id);
  return Shell(`<div class="card">
    <h3>${p.name}</h3>
    <div class="kv">
      <div class="k">Email</div><div>${p.email}</div>
      <div class="k">Phone</div><div>${p.phone}</div>
      <div class="k">Company</div><div>${(DATA.companies.find(c=>c.id===p.companyId)||{}).name||''}</div>
    </div>
    <div class="toolbar"><button class="btn">View Portal</button></div>
  </div>`,'contacts');
}
function Documents(){ return Shell(`<div class="card"><h3>Documents</h3><div class="muted">Upload/remove/preview (demo placeholder)</div></div>`,'documents'); }
function Resources(){ return Shell(`<div class="card"><h3>Resources</h3><div class="muted">Links & Docs (demo placeholder)</div></div>`,'resources'); }

// Admin
function Admin(){
  const rows = DATA.users.map(u=>`<tr><td>${u.name}</td><td>${u.role}</td>
    <td>${u.id===DATA.me.id?'<span class="status plan">You</span>':`<button class="btn" data-act="impersonate" data-id="${u.id}">Impersonate</button>`}</td></tr>`).join('');
  return Shell(`<div class="card"><h3>Users</h3><table><thead><tr><th>Name</th><th>Role</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'admin');
}

// Render & Wire
function render(){
  const r=App.state.route;
  let html='';
  if(r==='dashboard') html=Dashboard();
  else if(r==='calendar') html=Calendar();
  else if(r==='cases') html=Cases();
  else if(r==='companies') html=Companies();
  else if(r==='contacts') html=Contacts();
  else if(r==='documents') html=Documents();
  else if(r==='resources') html=Resources();
  else if(r==='admin') html=Admin();
  else if(r==='case') html=CasePage(App.state.params.id);
  else if(r==='company') html=CompanyPage(App.state.params.id);
  else if(r==='contact') html=ContactPage(App.state.params.id);
  document.getElementById('app').innerHTML = html;
  wire();
}
function wire(){
  document.querySelectorAll('[data-route]').forEach(n=>n.onclick=e=>{ route(n.getAttribute('data-route')); });
  document.querySelectorAll('[data-act]').forEach(n=>n.onclick=ev=>{
    const act = n.getAttribute('data-act');
    const id = n.getAttribute('data-id');
    if(act==='toggleShowUnread'){ App.state.showUnread=!App.state.showUnread; render(); }
    else if(act==='markAllRead'){ App.state.notifications.forEach(n=>n.read=true); App.state.notificationsUnread=0; render(); }
    else if(act==='openNotif'){ const it=App.state.notifications.find(x=>x.id===id); if(it){ it.read=true; App.state.notificationsUnread = App.state.notifications.filter(n=>!n.read).length; route('calendar'); App.state.modal=true; App.state.openEventId = it.payload.id; render(); } }
    else if(act==='gotoMonth'){ App.state.view='month'; render(); }
    else if(act==='gotoAgenda'){ App.state.view='agenda'; render(); }
    else if(act==='addEvent'){
      const title=(document.getElementById('evTitle')||{}).value||'';
      const date=(document.getElementById('evDate')||{}).value||today();
      if(!title) return;
      const e={ id:'E'+Date.now(), title, date, start:(document.getElementById('evStart')||{}).value||'09:00', end:(document.getElementById('evEnd')||{}).value||'10:00',
        type:(document.getElementById('evType')||{}).value||'Meeting', location:(document.getElementById('evLoc')||{}).value||'',
        caseId:(document.getElementById('evCase')||{}).value||null, owner:(document.getElementById('evOwner')||{}).value||DATA.me.id };
      DATA.events.push(e); persist();
      if(DATA.me.role==='Admin' && e.owner!==DATA.me.id){ pushNotification('created', e); }
      render();
    }
    else if(act==='openEvent' || act==='editEvent'){ App.state.modal=true; App.state.openEventId=id; render(); }
    else if(act==='deleteEvent'){
      const ix=DATA.events.findIndex(x=>x.id===id);
      if(ix>-1){ const e=DATA.events[ix]; DATA.events.splice(ix,1); persist(); pushNotification('deleted', e); render(); }
    }
    else if(act==='modalClose'){ App.state.modal=false; App.state.openEventId=null; render(); }
    else if(act==='modalSave'){
      const e=DATA.events.find(x=>x.id===App.state.openEventId); if(!e) return;
      const G=id=>{const el=document.getElementById(id); return el?el.value:null;};
      e.title=G('mTitle')||e.title; e.date=G('mDate')||e.date; e.start=G('mStart')||e.start; e.end=G('mEnd')||e.end; e.location=G('mLoc')||e.location;
      persist(); pushNotification('updated', e); App.state.modal=false; App.state.openEventId=null; render();
    }
    else if(act==='openCase'){ route('case',{id:id}); }
    else if(act==='openCompany'){ route('company',{id:id}); }
    else if(act==='openContact'){ route('contact',{id:id}); }
    else if(act==='tab'){ App.state.tab = n.getAttribute('data-tab'); render(); }
    else if(act==='addNote'){
      const caseId=n.getAttribute('data-id'); const txt=(document.getElementById('noteTxt')||{}).value||''; if(!txt) return;
      DATA.notes[caseId]=DATA.notes[caseId]||[]; DATA.notes[caseId].push({text:txt, ts:Date.now()}); persist(); render();
    }
    else if(act==='addTask'){
      const caseId=n.getAttribute('data-id'); const txt=(document.getElementById('taskTxt')||{}).value||''; if(!txt) return;
      DATA.tasks[caseId]=DATA.tasks[caseId]||[]; DATA.tasks[caseId].push({text:txt, done:false}); persist(); render();
    }
    else if(act==='addStdTasks'){
      const caseId=n.getAttribute('data-id'); DATA.tasks[caseId]=DATA.tasks[caseId]||[];
      ['Initial interview','Collect documents','Draft report'].forEach(t=>DATA.tasks[caseId].push({text:t,done:false}));
      persist(); render();
    }
    else if(act==='linkPerson'){
      const caseId=n.getAttribute('data-id'); const pid=(document.getElementById('linkPerson')||{}).value;
      DATA.people[caseId]=DATA.people[caseId]||[]; if(pid && !DATA.people[caseId].includes(pid)) DATA.people[caseId].push(pid); persist(); render();
    }
    else if(act==='unlinkPerson'){
      const caseId=n.getAttribute('data-id'); const pid=n.getAttribute('data-p');
      DATA.people[caseId]=(DATA.people[caseId]||[]).filter(x=>x!==pid); persist(); render();
    }
    else if(act==='impersonate'){ const who = n.getAttribute('data-id'); const u = DATA.users.find(x=>x.id===who); if(u){ DATA.me=u; persist(); render(); } }
    else if(act==='clearImpersonation'){ DATA.me = DATA.users.find(x=>x.id==='u-admin'); persist(); render(); }
  });
}
function route(r,p){ App.state.route=r; App.state.params=p||{}; render(); }
function pushNotification(type, payload){
  const id='N'+Date.now()+Math.random().toString(36).slice(2,6);
  const n={id, type, payload, read:false, ts:Date.now()};
  App.state.notifications.unshift(n);
  App.state.notificationsUnread = App.state.notifications.filter(n=>!n.read).length;
}
function renderModal(){
  if(!App.state.modal) return '';
  const e = DATA.events.find(x=>x.id===App.state.openEventId);
  if(!e) return '';
  return `<div class="modal-under" style="position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">
    <div class="card" style="width:min(560px,92vw)">
      <h3>Edit Event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="mTitle" value="${e.title}"></div>
        <div><label>Date</label><input class="input" id="mDate" type="date" value="${e.date}"></div>
        <div><label>Start</label><input class="input" id="mStart" type="time" value="${e.start||''}"></div>
        <div><label>End</label><input class="input" id="mEnd" type="time" value="${e.end||''}"></div>
        <div><label>Location</label><input class="input" id="mLoc" value="${e.location||''}"></div>
      </div>
      <div class="toolbar" style="margin-top:10px">
        <button class="btn primary" data-act="modalSave">Save</button>
        <button class="btn" data-act="modalClose">Close</button>
      </div>
    </div>
  </div>`;
}
function render(){ const html=(function(){ const r=App.state.route;
  if(r==='dashboard') return Dashboard();
  if(r==='calendar') return Calendar();
  if(r==='cases') return Cases();
  if(r==='companies') return Companies();
  if(r==='contacts') return Contacts();
  if(r==='documents') return Documents();
  if(r==='resources') return Resources();
  if(r==='admin') return Admin();
  if(r==='case') return CasePage(App.state.params.id);
  if(r==='company') return CompanyPage(App.state.params.id);
  if(r==='contact') return ContactPage(App.state.params.id);
  return '<div class="card">Not found</div>';
})(); document.getElementById('app').innerHTML = renderModal()+html; wire(); }

window.addEventListener('DOMContentLoaded', ()=>{ App.state.route='dashboard'; render(); });