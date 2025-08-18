
(function(){
  "use strict";
  const BUILD="v2.15.0"; const STAMP=(new Date()).toISOString();
  const LS_KEY="synergy_app_state_v2150";
  console.log("Synergy CRM — "+BUILD, STAMP);
  
  // --- utils
  const uid=()=> "id-"+Math.random().toString(36).slice(2,9);
  const todayISO=()=> (new Date()).toISOString().slice(0,10);
  const byId=(id)=>document.getElementById(id);
  const save=()=>localStorage.setItem(LS_KEY, JSON.stringify(DATA));
  const load=()=>{ try{ const o=JSON.parse(localStorage.getItem(LS_KEY)||"{}"); if(o && typeof o==="object") Object.assign(DATA,o); }catch(_){} };
  const asEmail=(x)=> (x||"").toLowerCase().trim();
  
  // --- seed
  const YEAR=(new Date()).getFullYear();
  function mkCase(y,seq,p){
    const base={
      id:uid(), fileNumber:`INV-${y}-${String(seq).padStart(3,"0")}`,
      title:"", organisation:"", companyId:"C-001",
      investigatorEmail:"", investigatorName:"",
      status:"Planning", priority:"Medium", created:`${y}-01`,
      notes:[], tasks:[], folders:{General:[]}
    };
    Object.assign(base,p||{}); return base;
  }
  
  const DATA={
    me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
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
      {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",notes:"Investigator for Sunrise."},
      {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",notes:""},
      {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",notes:""}
    ],
    cases:[
      mkCase(YEAR-1,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:`${YEAR-1}-01`}),
      mkCase(YEAR-1,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:`${YEAR-1}-07`}),
      mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:`${YEAR}-01`}),
      mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:`${YEAR}-06`}),
      mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:`${YEAR}-07`})
    ],
    resources:{templates:[],procedures:[]},
    notifications:[], // {id, whenISO, action, title, eventId, unread:true}
    calendar:{
      view:"month",
      ownerFilter:"all", // email or 'all'
      events:[
        {id:uid(), title:"Case intake - Sunrise", date:`${YEAR}-08-03`, start:"10:00", end:"10:30", type:"Appointment", location:"Zoom", owner:"admin@synergy.com", caseId:null},
        {id:uid(), title:"Interview planning", date:`${YEAR}-08-06`, start:"13:00", end:"14:00", type:"Note", location:"", owner:"alex@synergy.com", caseId: findByFile("INV-"+YEAR+"-001")?.id || null},
        {id:uid(), title:"Evidence review", date:`${YEAR}-08-13`, start:"09:00", end:"10:00", type:"Appointment", location:"HQ", owner:"chris@synergy.com", caseId: findByFile("INV-"+YEAR+"-003")?.id || null},
        {id:uid(), title:"Draft report sync", date:`${YEAR}-08-22`, start:"15:00", end:"15:30", type:"Appointment", location:"", owner:"priya@synergy.com", caseId:null},
      ]
    },
    ui:{ route:"dashboard", currentCaseId:null, currentContactId:null, currentCompanyId:null, asUser:null }
  };
  
  function findByFile(file){ return (DATA.cases||[]).find(c=>c.fileNumber===file); }
  function findCase(id){ return (DATA.cases||[]).find(c=>c.id===id)||null; }
  function findCompany(id){ return (DATA.companies||[]).find(c=>c.id===id)||null; }
  function findUserByEmail(e){ return (DATA.users||[]).find(u=>asEmail(u.email)===asEmail(e))||null; }
  
  // --- load persisted (then re-save to ensure new fields exist)
  load(); save();
  
  // --- UI framework (tiny)
  const App={ set(p){ Object.assign(DATA.ui,p||{}); render(); }, get(){ return DATA; } };
  function routeTo(r){ App.set({route:r}); }
  
  // --- Topbar with bell (Admin only)
  function Bell(){
    if((DATA.me||{}).role!=="Admin") return "";
    const unread=(DATA.notifications||[]).filter(n=>n.unread).length;
    const badge= unread>0 ? `<span class="dot">${unread}</span>` : "";
    return `<div class="bell" data-act="openBell" title="Notifications">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-.6 1.4L4 17h5" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>${badge}</div>`;
  }
  function Topbar(){
    return `<div class="topbar">
      <div class="brand">Synergy CRM</div>
      <div class="top-sp"></div>
      ${Bell()}
      <span class="badge">Soft Stable ${BUILD}</span>
    </div>`;
  }
  function Sidebar(active){
    const base=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
    return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">${
      base.map(([r,l])=>`<li ${active===r?'class="active"':''} data-act="route" data-arg="${r}">${l}</li>`).join("")
    }</ul></aside>`;
  }
  function Shell(content,active){
    return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`;
  }
  
  // --- Dashboard
  function statusChip(s){
    const map={
      "Planning":"st-planning","Investigation":"st-investigation","Evidence Review":"st-evidence","Reporting":"st-reporting","Closed":"st-closed"
    };
    const cls=map[s]||"chip";
    return `<span class="chip ${cls}"><span class="dot" style="background:#ff7a59;width:6px;height:6px;border-radius:9px"></span>${s}</span>`;
  }
  function Dashboard(){
    const d=DATA;
    const rows=d.cases.map(c=>`<tr>
      <td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td>
      <td>${statusChip(c.status)}</td>
      <td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td>
    </tr>`).join("");
    const notifRows=(d.notifications||[]).length? (d.notifications.map(n=>`<tr>
      <td>${n.whenISO.replace("T"," ").slice(0,16)}</td>
      <td>${n.action}</td>
      <td>${n.title}</td>
      <td class="right">
        <button class="btn light" data-act="notifOpen" data-arg="${n.id}">Open</button>
        <button class="btn light" data-act="notifDismiss" data-arg="${n.id}">Dismiss</button>
      </td>
    </tr>`).join("")) : `<tr><td colspan="4" class="muted">No notifications</td></tr>`;
    return Shell(`
      <div class="card"><h3>Welcome</h3><div class="muted">Timestamp: ${STAMP}</div></div>
      <div class="grid cols-2">
        <div class="card">
          <div class="section"><header><h3 class="section-title">Active Cases</h3></header>
          <table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows}</tbody></table></div>
        </div>
        <div class="card">
          <div class="section"><header><h3 class="section-title">Calendar updates (Admin)</h3>
            <div><button class="btn light" data-act="notifShowUnread">Show unread</button>
            <button class="btn light" data-act="notifMarkAll">Mark all read</button></div></header>
            <table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead>
            <tbody>${notifRows}</tbody></table>
          </div>
        </div>
      </div>
    `,'dashboard');
  }
  
  // --- Calendar
  function monthDays(iso){
    const d=new Date(iso); d.setDate(1);
    const year=d.getFullYear(), m=d.getMonth();
    const firstDow=(new Date(year,m,1)).getDay(); // 0 Sun
    const days=new Date(year,m+1,0).getDate();
    const pads=(firstDow+6)%7; // start Monday grid
    const out=[];
    for(let i=0;i<pads;i++) out.push(null);
    for(let i=1;i<=days;i++){ out.push(new Date(year,m,i)); }
    while(out.length%7!==0) out.push(null);
    return out;
  }
  function EventChip(ev){ return `<span class="ev" data-act="editEvent" data-arg="${ev.id}"><span class="dot"></span>${ev.title}</span>`; }
  function Calendar(){
    const cal=DATA.calendar, me=DATA.me;
    const now=todayISO(), monthISO=now.slice(0,7)+"-01";
    const owner=cal.ownerFilter;
    const events=(ev)=> (owner==="all"||asEmail(ev.owner)===asEmail(owner));
    const days=monthDays(monthISO);
    const byDate=(iso)=> (DATA.calendar.events||[]).filter(e=>e.date===iso).filter(events);
    const ownerOptions = ["all"].concat(DATA.users.map(u=>u.email)).map(e=>`<option value="${e}" ${e===owner?'selected':''}>${e==="all"?"All users":e}</option>`).join("");
    const grid = days.map(d=>{
      if(!d) return `<div class="day muted"></div>`;
      const iso=d.toISOString().slice(0,10);
      const chips=byDate(iso).map(EventChip).join(" ");
      return `<div class="day"><h5>${iso.slice(8,10)}</h5>${chips||'<div class="muted">—</div>'}</div>`;
    }).join("");
    // Add event form
    const caseOptions=[""].concat(DATA.cases.map(c=>`${c.id}::${c.fileNumber}`)).map(v=>{
      if(v==="") return `<option value="">(No case)</option>`;
      const [id,fn]=v.split("::"); return `<option value="${id}">${fn}</option>`;
    }).join("");
    const ownerSel= DATA.me.role==="Admin" ? `<select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}">${u.name} (${u.role})</option>`).join("")}</select>`: `<input class="input" id="ev-owner" value="${DATA.me.email}" disabled>`;
    return Shell(`
      <div class="section"><header><h3 class="section-title">Calendar</h3>
        <div class="grid cols-3" style="max-width:520px">
          <div><label>View</label>
            <select class="input" id="cal-view">
              <option ${cal.view==="month"?'selected':''} value="month">Month</option>
              <option ${cal.view==="agenda"?'selected':''} value="agenda">Agenda</option>
            </select>
          </div>
          <div><label>Owner</label><select class="input" id="owner-filter">${ownerOptions}</select></div>
          <div style="display:flex;align-items:flex-end;justify-content:flex-end">
            <button class="btn light" data-act="calApply">Apply</button>
          </div>
        </div>
      </header></div>
      <div class="card">
        ${cal.view==="month" ? `<div class="cal-grid">${grid}</div>` : AgendaView()}
      </div>
      <div class="card">
        <h3>Add Event</h3>
        <div class="grid cols-3">
          <input class="input" id="ev-title" placeholder="Appointment or note">
          <input class="input" type="date" id="ev-date" value="${now}">
          <select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select>
          <input class="input" id="ev-start" placeholder="09:00">
          <input class="input" id="ev-end" placeholder="09:30">
          <input class="input" id="ev-location" placeholder="Location">
          <select class="input" id="ev-case">${caseOptions}</select>
          ${ownerSel}
          <div style="text-align:right"><button class="btn" data-act="addEvent">Add</button></div>
        </div>
      </div>
    `,'calendar');
  }
  function AgendaView(){
    const owner=DATA.calendar.ownerFilter;
    const items=(DATA.calendar.events||[])
      .filter(ev=> owner==="all" || asEmail(ev.owner)===asEmail(owner))
      .sort((a,b)=> a.date.localeCompare(b.date) || (a.start||"").localeCompare(b.start||""));
    const rows = items.map(ev=>`<tr>
      <td>${ev.date}</td><td>${ev.start||""}</td><td>${ev.end||""}</td>
      <td>${ev.title}</td><td>${ev.type}</td><td>${ev.location||""}</td>
      <td>${ev.caseId? (findCase(ev.caseId)||{}).fileNumber : ""}</td>
      <td class="right"><button class="btn light" data-act="editEvent" data-arg="${ev.id}">Open</button></td>
    </tr>`).join("");
    return `<table><thead><tr><th>Date</th><th>Start</th><th>End</th><th>Title</th><th>Type</th><th>Location</th><th>Case</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="8" class="muted">No events</td></tr>'}</tbody></table>`;
  }
  
  // --- Case page (with Calendar tab)
  function CasePage(id){
    const cs=findCase(id);
    if(!cs) return Shell(`<div class="card">Case not found.</div>`,'cases');
    const invOpts = DATA.users.map(u=>`<option ${u.email===cs.investigatorEmail?'selected':''} value="${u.email}">${u.name} (${u.role})</option>`).join("");
    const coOpts = DATA.companies.map(co=>`<option ${co.id===cs.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");
    const notes = (cs.notes||[]).map(n=>`<tr><td>${n.time}</td><td>${n.by}</td><td>${n.text}</td></tr>`).join("") || `<tr><td colspan="3" class="muted">No notes yet.</td></tr>`;
    const tasks = (cs.tasks||[]).map(t=>`<tr><td>${t.id}</td><td>${t.title}</td><td>${t.assignee}</td><td>${t.due||""}</td><td>${t.status||"Open"}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">No tasks yet.</td></tr>`;
    const caseEvents = (DATA.calendar.events||[]).filter(e=>e.caseId===cs.id).sort((a,b)=>a.date.localeCompare(b.date));
    const evRows = caseEvents.map(ev=>`<tr><td>${ev.date}</td><td>${ev.start||""}</td><td>${ev.end||""}</td><td>${ev.title}</td><td>${ev.type}</td><td class="right"><button class="btn light" data-act="editEvent" data-arg="${ev.id}">Open</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">No events for this case.</td></tr>`;
    const ownerSel= DATA.me.role==="Admin" ? `<select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}">${u.name} (${u.role})</option>`).join("")}</select>`: `<input class="input" id="ev-owner" value="${DATA.me.email}" disabled>`;
    return Shell(`
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px">
          <h2>Case ${cs.fileNumber}</h2>
          <div class="top-sp"></div>
          <button class="btn" data-act="saveCase" data-arg="${cs.id}">Save Case</button>
          <button class="btn danger" data-act="deleteCase" data-arg="${cs.id}">Delete Case</button>
          <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button>
        </div>
      </div>
      <div class="card">
        <div class="grid cols-2">
          <div><label>Case ID</label><input class="input" id="c-id" value="${cs.fileNumber}"></div>
          <div><label>Organisation (display)</label><input class="input" id="c-org" value="${cs.organisation}"></div>
          <div><label>Title</label><input class="input" id="c-title" value="${cs.title}"></div>
          <div><label>Company</label><select class="input" id="c-company">${coOpts}</select></div>
          <div><label>Investigator</label><select class="input" id="c-inv">${invOpts}</select></div>
          <div><label>Status</label>
            <select class="input" id="c-status">
              ${["Planning","Investigation","Evidence Review","Reporting","Closed"].map(s=>`<option ${cs.status===s?'selected':''}>${s}</option>`).join("")}
            </select>
          </div>
          <div><label>Priority</label>
            <select class="input" id="c-priority">
              ${["Low","Medium","High","Critical"].map(s=>`<option ${cs.priority===s?'selected':''}>${s}</option>`).join("")}
            </select>
          </div>
        </div>
      </div>
      <div class="grid cols-2">
        <div class="card">
          <div class="section"><header><h3 class="section-title">Notes</h3></header></div>
          <textarea class="input" id="note-text" placeholder="Type your note here"></textarea>
          <div style="text-align:right;margin-top:6px"><button class="btn light" data-act="addNote" data-arg="${cs.id}">Add Note</button></div>
          <table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">${notes}</tbody></table>
        </div>
        <div class="card">
          <div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="${cs.id}">Add standard tasks</button></header></div>
          <div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">${invOpts}</select></div>
          <div style="text-align:right;margin-top:6px"><button class="btn light" data-act="addTask" data-arg="${cs.id}">Add</button></div>
          <table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${tasks}</tbody></table>
        </div>
      </div>
      <div class="card">
        <div class="section"><header><h3 class="section-title">Calendar</h3></header></div>
        <table><thead><tr><th>Date</th><th>Start</th><th>End</th><th>Title</th><th>Type</th><th></th></tr></thead><tbody>${evRows}</tbody></table>
        <div class="section"><header><h3 class="section-title">Add case event</h3></header></div>
        <div class="grid cols-3">
          <input class="input" id="ev-title" placeholder="Appointment or note">
          <input class="input" type="date" id="ev-date" value="${todayISO()}">
          <select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select>
          <input class="input" id="ev-start" placeholder="09:00">
          <input class="input" id="ev-end" placeholder="09:30">
          ${ownerSel}
          <div style="grid-column:span 3;text-align:right"><button class="btn" data-act="addCaseEvent" data-arg="${cs.id}">Add</button></div>
        </div>
      </div>
    `,'cases');
  }
  
  // --- Lists
  function Cases(){
    const list=DATA.cases;
    const rows=list.map(cc=>`<tr>
      <td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td>${statusChip(cc.status)}</td>
      <td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td>
    </tr>`).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Cases</h3><div class="right"><button class="btn" data-act="newCase">New Case</button></div></header>
      <table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'cases');
  }
  function Contacts(){
    const coName=id=> (findCompany(id)||{}).name||"";
    const rows=DATA.contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email||""}</td><td>${coName(c.companyId)}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header>
      <table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>${rows}</tbody></table>`,'contacts');
  }
  function ContactPage(id){
    const c=(DATA.contacts||[]).find(x=>x.id===id);
    if(!c) return Shell(`<div class="card">Contact not found.</div>`,'contacts');
    const coOpts=['<option value="">(No linked company)</option>'].concat(DATA.companies.map(co=>`<option ${co.id===c.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`)).join("");
    return Shell(`<div class="card">
      <div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="top-sp"></div><button class="btn" data-act="saveContact" data-arg="${id}">Save</button><button class="btn danger" data-act="deleteContact" data-arg="${id}">Delete</button><button class="btn light" data-act="route" data-arg="contacts">Back</button></div>
      <div class="grid cols-4" style="margin-top:12px">
        <div><label>Contact Name</label><input class="input" id="ct-name" value="${c.name||""}"></div>
        <div><label>Email</label><input class="input" id="ct-email" value="${c.email||""}"></div>
        <div><label>Phone</label><input class="input" id="ct-phone" value="${c.phone||""}"></div>
        <div><label>Position/Org</label><input class="input" id="ct-org" value="${c.org||""}"></div>
        <div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">${coOpts}</select></div>
        <div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">${c.notes||""}</textarea></div>
      </div>
    </div>`,'contacts');
  }
  function Companies(){
    const countContacts=cid=> (DATA.contacts||[]).filter(c=>c.companyId===cid).length;
    const countCases=cid=> (DATA.cases||[]).filter(c=>c.companyId===cid).length;
    const rows=DATA.companies.map(co=>`<tr><td>${co.id}</td><td>${co.name}</td><td>${countContacts(co.id)}</td><td>${countCases(co.id)}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'companies');
  }
  function CompanyPage(id){
    const co=findCompany(id);
    if(!co) return Shell(`<div class="card">Company not found.</div>`,'companies');
    const contacts=(DATA.contacts||[]).filter(c=>c.companyId===id);
    const crows = contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email||""}</td><td>${c.role||"Investigator"}</td><td>${c.phone||""}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`).join("") || `<tr><td colspan="5" class="muted">No contacts</td></tr>`;
    const cases=(DATA.cases||[]).filter(cs=>cs.companyId===id);
    const krows=cases.map(cs=>`<tr><td>${cs.fileNumber}</td><td>${statusChip(cs.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>`).join("") || `<tr><td colspan="3" class="muted">No cases</td></tr>`;
    return Shell(`<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>${co.name}</h2><div class="top-sp"></div><button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>
      <div class="card"><h3>Company Contacts</h3><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th></th></tr></thead><tbody>${crows}</tbody></table></div>
      <div class="card"><h3>Recent Cases</h3><table><thead><tr><th>Case</th><th>Status</th><th></th></tr></thead><tbody>${krows}</tbody></table></div>
      <div class="card"><h3>Company Documents</h3><div class="muted">Uploads are client-side only in this demo.</div></div>
    `,'companies');
  }
  function Documents(){
    const rows=(DATA.cases||[]).map(c=>{
      let count=0; for(const k in c.folders){ if(Object.prototype.hasOwnProperty.call(c.folders,k)) count+=(c.folders[k]||[]).length; }
      return `<tr><td>${c.fileNumber}</td><td>${count}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open Case</button></td></tr>`;
    }).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'documents');
  }
  function Resources(){
    const rows=(kind)=>{
      const list=(kind==="templates")?DATA.resources.templates:DATA.resources.procedures;
      if(!list.length) return `<tr><td colspan="3" class="muted">No items yet.</td></tr>`;
      return list.map(it=>`<tr><td>${it.name}</td><td>${it.size||""}</td><td class="right"><button class="btn light" data-act="removeResource" data-arg="${kind}::${it.name}">Remove</button></td></tr>`).join("");
    };
    return Shell(`<div class="card"><h3>Templates</h3><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${rows("templates")}</tbody></table></div>
      <div class="card"><h3>Procedures</h3><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${rows("procedures")}</tbody></table></div>`,'resources');
  }
  function Admin(){
    const users=DATA.users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td class="right"><button class="btn light" data-act="impersonate" data-arg="${u.email}">Impersonate</button></td></tr>`).join("");
    return Shell(`<div class="card"><h3>Users</h3>
      <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>${users}</tbody></table>
    </div>
    <div class="card"><h3>Settings</h3><label><input type="checkbox" id="email-alerts" checked> Email alerts</label></div>
    <div class="card"><h3>Audit</h3><div class="muted">No events yet.</div></div>
    `,'admin');
  }
  
  // --- Render router
  function render(){
    const r=DATA.ui.route, el=byId('app');
    if(r==='dashboard') el.innerHTML=Dashboard();
    else if(r==='calendar') el.innerHTML=Calendar();
    else if(r==='cases') el.innerHTML=Cases();
    else if(r==='case') el.innerHTML=CasePage(DATA.ui.currentCaseId);
    else if(r==='contacts') el.innerHTML=Contacts();
    else if(r==='contact') el.innerHTML=ContactPage(DATA.ui.currentContactId);
    else if(r==='companies') el.innerHTML=Companies();
    else if(r==='company') el.innerHTML=CompanyPage(DATA.ui.currentCompanyId);
    else if(r==='documents') el.innerHTML=Documents();
    else if(r==='resources') el.innerHTML=Resources();
    else if(r==='admin') el.innerHTML=Admin();
    else el.innerHTML=Dashboard();
  }
  
  // --- Actions
  document.addEventListener('click', (e)=>{
    let t=e.target;
    while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode;
    if(!t || t===document) return;
    const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
    
    if(act==='route'){ routeTo(arg); return; }
    if(act==='openCase'){ DATA.ui.currentCaseId=arg; routeTo('case'); return; }
    if(act==='openContact'){ DATA.ui.currentContactId=arg; routeTo('contact'); return; }
    if(act==='openCompany'){ DATA.ui.currentCompanyId=arg; routeTo('company'); return; }
    if(act==='newCase'){ const inv=DATA.users.find(u=>u.role!=='Client')||DATA.users[0]; const cs=mkCase(YEAR, DATA.cases.length+1,{investigatorEmail:inv.email,investigatorName:inv.name}); DATA.cases.unshift(cs); save(); DATA.ui.currentCaseId=cs.id; routeTo('case'); return; }
    if(act==='saveCase'){ const cs=findCase(arg); if(!cs) return;
      const v=(id)=> byId(id) ? byId(id).value : null;
      cs.fileNumber=v('c-id')||cs.fileNumber;
      cs.organisation=v('c-org')||cs.organisation;
      cs.title=v('c-title')||cs.title;
      cs.companyId=v('c-company')||cs.companyId;
      const invEmail=v('c-inv'); if(invEmail){ cs.investigatorEmail=invEmail; cs.investigatorName=(findUserByEmail(invEmail)||{}).name||""; }
      cs.status=v('c-status')||cs.status;
      cs.priority=v('c-priority')||cs.priority;
      save(); alert('Case saved'); return;
    }
    if(act==='deleteCase'){ const cs=findCase(arg); if(!cs) return; if(confirm('Delete this case?')){ DATA.cases=DATA.cases.filter(c=>c.id!==cs.id); save(); routeTo('cases'); } return; }
    if(act==='addNote'){ const cs=findCase(arg); if(!cs) return; const text=byId('note-text').value.trim(); if(!text) return alert('Enter a note'); const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=DATA.me.email; cs.notes.unshift({time:stamp,by:me,text}); save(); render(); return; }
    if(act==='addStdTasks'){ const cs=findCase(arg); if(!cs) return; const base=cs.tasks; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(a=>base.push({id:'T-'+(base.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'})); save(); render(); return; }
    if(act==='addTask'){ const cs=findCase(arg); if(!cs) return; const whoSel=byId('task-assignee'); const who=whoSel.options[whoSel.selectedIndex].text; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:byId('task-title').value,assignee:who,due:byId('task-due').value,status:'Open'}); save(); render(); return; }
    if(act==='addCaseEvent'){ const cs=findCase(arg); if(!cs) return;
      const e={ id:uid(), title:byId('ev-title').value, date:byId('ev-date').value, start:byId('ev-start').value, end:byId('ev-end').value, type:byId('ev-type').value, location:byId('ev-location')?byId('ev-location').value:"", owner:byId('ev-owner').value, caseId:cs.id };
      DATA.calendar.events.push(e);
      pushNotif('created', e);
      save(); render(); return;
    }
    if(act==='addEvent'){ const e={ id:uid(), title:byId('ev-title').value, date:byId('ev-date').value, start:byId('ev-start').value, end:byId('ev-end').value, type:byId('ev-type').value, location:byId('ev-location').value, owner:byId('ev-owner').value, caseId:(byId('ev-case').value||null) };
      DATA.calendar.events.push(e); pushNotif('created', e); save(); render(); return;
    }
    if(act==='editEvent'){ openEventModal(arg); return; }
    if(act==='notifOpen'){ const n=(DATA.notifications||[]).find(x=>x.id===arg); if(!n) return; const ev=(DATA.calendar.events||[]).find(e=>e.id===n.eventId); n.unread=false; save(); if(ev){ routeTo('calendar'); setTimeout(()=>openEventModal(ev.id), 50); } else { render(); } return; }
    if(act==='notifDismiss'){ const n=(DATA.notifications||[]).find(x=>x.id===arg); if(!n) return; n.unread=false; save(); render(); return; }
    if(act==='notifShowUnread'){ DATA.notifications=(DATA.notifications||[]).sort((a,b)=> (b.unread?1:0)-(a.unread?1:0)); render(); return; }
    if(act==='notifMarkAll'){ (DATA.notifications||[]).forEach(n=>n.unread=false); save(); render(); return; }
    if(act==='calApply'){ const v=(id)=>byId(id).value; DATA.calendar.view=v('cal-view'); DATA.calendar.ownerFilter=v('owner-filter'); save(); render(); return; }
    if(act==='impersonate'){ const u=findUserByEmail(arg); if(!u) return; DATA.me={name:u.name,email:u.email,role:u.role}; save(); render(); return; }
    if(act==='removeResource'){ const [kind,name]=arg.split("::"); const list=(kind==="templates")?DATA.resources.templates:DATA.resources.procedures; const idx=list.findIndex(x=>x.name===name); if(idx>=0) list.splice(idx,1); save(); render(); return; }
  });
  
  function pushNotif(action, ev){
    const n={ id:uid(), whenISO:(new Date()).toISOString(), action, title:ev.title, eventId:ev.id, unread:true };
    DATA.notifications = DATA.notifications || []; DATA.notifications.unshift(n);
  }
  
  function openEventModal(id){
    const ev=(DATA.calendar.events||[]).find(e=>e.id===id);
    if(!ev) return alert('Event not found');
    const orig=JSON.stringify(ev);
    const newTitle=prompt("Edit title", ev.title); if(newTitle===null) return;
    ev.title=newTitle;
    const newDate=prompt("Edit date (YYYY-MM-DD)", ev.date); if(newDate===null) return; ev.date=newDate;
    const newStart=prompt("Edit start (HH:mm)", ev.start||""); if(newStart===null) return; ev.start=newStart;
    const newEnd=prompt("Edit end (HH:mm)", ev.end||""); if(newEnd===null) return; ev.end=newEnd;
    const newType=prompt("Type (Appointment/Note)", ev.type||"Appointment"); if(newType===null) return; ev.type=newType;
    const linkCase=confirm("Link to current case? (OK = yes)"); 
    if(linkCase && DATA.ui.currentCaseId){ ev.caseId=DATA.ui.currentCaseId; }
    if(orig!==JSON.stringify(ev)) pushNotif('updated', ev);
    save(); render();
    if(confirm("Delete this event?")){ DATA.calendar.events = DATA.calendar.events.filter(x=>x.id!==id); pushNotif('deleted', ev); save(); render(); }
  }
  
  // boot
  document.addEventListener('DOMContentLoaded', ()=>{ routeTo('dashboard'); });
})(); 
