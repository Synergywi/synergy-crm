/* Synergy CRM v2142 — Calendar + Case linkage + Notifications + Bell */
(function(){
  "use strict";
  const BUILD="v2.14.2"; const STAMP=(new Date()).toISOString();
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>(s==null?'':String(s)).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const uid=()=>Math.random().toString(36).slice(2,10);
  const ymd=d=>new Date(d).toISOString().slice(0,10);
  const hhmm=d=>new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

  const STORE="SYNERGY_APP_V2142";
  const DATA = JSON.parse(localStorage.getItem(STORE)||"null") || {
    users:[
      {id:'u1', name:'Admin', email:'admin@example.com', role:'Admin'},
      {id:'u2', name:'Alex Ng', email:'alex@synergy.com', role:'Investigator'},
      {id:'u3', name:'Priya Menon', email:'priya@synergy.com', role:'Investigator'},
      {id:'u4', name:'Chris Rice', email:'chris@synergy.com', role:'Reviewer'}
    ],
    me:{id:'u1', name:'Admin', email:'admin@example.com', role:'Admin'},
    companies:[{id:'co1', name:'Sunrise Mining Pty Ltd'},{id:'co2', name:'City of Melbourne'}],
    contacts:[{id:'p1', name:'Alex Ng', companyId:'co1', email:'alex@synergy.com'}],
    cases:[
      {id:'c3', fileNumber:'INV-2025-001', title:'Bullying complaint in Finance', organisation:'Sunrise Mining Pty Ltd', companyId:'co1', investigatorEmail:'alex@synergy.com', status:'Investigation', priority:'High', notes:[], tasks:[], folders:{General:[]}},
      {id:'c4', fileNumber:'INV-2025-002', title:'Sexual harassment allegation at Brisbane site', organisation:'Queensland Health (Metro North)', companyId:'co2', investigatorEmail:'priya@synergy.com', status:'Planning', priority:'Medium', notes:[], tasks:[], folders:{General:[]}},
      {id:'c5', fileNumber:'INV-2025-003', title:'Misconduct – data exfiltration', organisation:'City of Melbourne', companyId:'co2', investigatorEmail:'chris@synergy.com', status:'Evidence Review', priority:'High', notes:[], tasks:[], folders:{General:[]}},
    ],
    calendar:[
      {id:'e1', title:'Interview planning', description:'', startISO:'2025-08-19T09:30:00', endISO:'2025-08-19T10:30:00', ownerEmail:'alex@synergy.com', ownerName:'Alex Ng', location:'Room 2', type:'Appointment', caseId:'c3'}
    ],
    notifications:[],
    resources:{templates:[{name:'Case intake form.docx'},{name:'Interview checklist.pdf'},{name:'Final report.docx'}],
               procedures:[{name:'Code of conduct.pdf'},{name:'Incident workflow.png'}]}
  };
  const save=()=>{ try{ localStorage.setItem(STORE, JSON.stringify(DATA)); }catch(e){} };

  // Notifications
  const NOTI_KEY='SYNERGY_NOTIS_V2142';
  function loadNotis(){ try{ DATA.notifications = JSON.parse(localStorage.getItem(NOTI_KEY)||'[]')||[]; }catch(_){ DATA.notifications=[]; } }
  function saveNotis(){ try{ localStorage.setItem(NOTI_KEY, JSON.stringify(DATA.notifications||[])); }catch(_){} }
  function pushNoti(kind, title, payload){ (DATA.notifications=DATA.notifications||[]).unshift({id:uid(), kind, title, when:new Date().toISOString(), read:false, payload:payload||null}); saveNotis(); }
  function unreadCount(){ return (DATA.notifications||[]).filter(n=>!n.read).length; }

  // App state
  const App = { state:{ route:'dashboard', currentCaseId:null, tabs:{}, ownerFilter:'all', showNoti:false, notiOnlyUnread:false, asUser:null }, set(p){ Object.assign(App.state,p||{}); render(); } };

  // Shell
  function renderNav(){
    const items=['dashboard','calendar','cases','companies','contacts','documents','resources','admin'];
    $('#nav').innerHTML = items.map(r=>`<div class="item ${App.state.route===r?'active':''}" data-act="nav" data-arg="${r}">${r[0].toUpperCase()+r.slice(1)} <span>›</span></div>`).join('');
  }
  function Topbar(){
    const me=DATA.me||{}; const isAdmin=(me.role==='Admin'); const u=unreadCount();
    let s='<div class="brand">Synergy CRM</div><div class="sp"></div>';
    if(App.state.asUser){ s+='<span class="version">You: '+esc(App.state.asUser.name)+' ('+esc(App.state.asUser.role)+')</span> '; s+='<button class="btn" data-act="exitPortal">Switch to Admin</button> '; }
    if(isAdmin){ s+=`<div class="bell" data-act="toggleNotiPanel" title="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M9 17a3 3 0 0 0 6 0"/></svg>
        ${u>0?'<span class="badge-dot">'+u+'</span>':''}
      </div>`; }
    s+='<span class="version">Soft Stable '+BUILD+'</span>';
    $('#topbar').innerHTML = s + (App.state.showNoti && isAdmin ? NotiPanel() : '');
  }
  function NotiPanel(){
    const list=(DATA.notifications||[]);
    const showUnread=!!App.state.notiOnlyUnread;
    const filtered = showUnread ? list.filter(n=>!n.read) : list;
    const rows = filtered.length? filtered.map(n=>{
      const when=(n.when||'').replace('T',' ').slice(0,16);
      return `<div class="nrow">
        <div class="muted">${when}<br>${esc(n.kind)}</div>
        <div>${esc(n.title)}</div>
        <div class="right">
          <button class="btn light" data-act="openNoti" data-arg="${n.id}">Open</button>
          <button class="btn light" data-act="dismissNoti" data-arg="${n.id}">Dismiss</button>
        </div>
      </div>`;
    }).join('') : '<div class="nrow"><div class="muted">No notifications</div></div>';
    return `<div class="npanel">
      <header><strong>Calendar updates (Admin)</strong>
        <div class="tools">
          <button class="btn light" data-act="toggleNotiFilter">${showUnread?'Show all':'Show unread'}</button>
          <button class="btn light" data-act="markAllRead">Mark all read</button>
        </div>
      </header>
      <div class="nbody">${rows}</div>
    </div>`;
  }
  function Shell(content){ return content; }

  // Dashboard
  function Dashboard(){
    const rows = DATA.cases.map(cs=>`
      <tr><td>${esc(cs.fileNumber)}</td><td>${esc(cs.title)}</td><td>${esc(cs.organisation||'')}</td><td>${esc(cs.status)}</td>
      <td class="right"><button class="btn light" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>
    `).join('');
    const notifTable = (DATA.notifications||[]).slice(0,10).map(n=>`
      <tr><td>${(n.when||'').replace('T',' ').slice(0,16)}</td><td>${esc(n.kind)}</td><td>${esc(n.title)}</td>
      <td class="right"><button class="btn light" data-act="openNoti" data-arg="${n.id}">Open</button>
      <button class="btn light" data-act="dismissNoti" data-arg="${n.id}">Dismiss</button></td></tr>`).join('') || `<tr><td colspan="4" class="muted">No notifications</td></tr>`;
    return Shell(`
      <div class="grid cols-2">
        <div class="card">
          <h3 class="section-title">Welcome</h3>
          <div>Timestamp: ${new Date().toLocaleString()}</div>
        </div>
        <div class="card">
          <h3 class="section-title">Calendar updates (Admin)</h3>
          <table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>${notifTable}</tbody></table>
          <div class="right" style="margin-top:6px">
            <button class="btn light" data-act="toggleNotiFilter">${App.state.notiOnlyUnread?'Show all':'Show unread'}</button>
            <button class="btn light" data-act="markAllRead">Mark all read</button>
          </div>
        </div>
        <div class="card">
          <h3 class="section-title">Active Cases</h3>
          <table><thead><tr><th>ID</th><th>Title</th><th>Organisation</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>
        </div>
      </div>
    `);
  }

  // Calendar (agenda + add)
  function Calendar(){
    const me=DATA.me||{}; const isAdmin=(me.role==='Admin');
    const ownerFilter = isAdmin ? (App.state.ownerFilter||'all') : me.email;
    const events=(DATA.calendar||[]).filter(e=> ownerFilter==='all' || e.ownerEmail===ownerFilter).sort((a,b)=>String(a.startISO).localeCompare(String(b.startISO)));
    const rows = events.map(ev=>`
      <tr><td>${new Date(ev.startISO).toLocaleDateString()}</td>
          <td>${hhmm(ev.startISO)}–${hhmm(ev.endISO)}</td>
          <td>${esc(ev.title)}</td>
          <td>${esc(ev.location||'')}</td>
          <td>${esc(ev.ownerName||ev.ownerEmail||'')}</td>
          <td>${esc((DATA.cases.find(c=>c.id===ev.caseId)||{}).fileNumber||'')}</td>
          <td class="right"><button class="btn light" data-act="openEvent" data-arg="${ev.id}">Open</button></td></tr>
    `).join('') || `<tr><td colspan="7" class="muted">No events</td></tr>`;

    const owners = isAdmin ? (`<div><label>Owner filter</label><select class="input" id="owner-filter">
      <option value="all" ${ownerFilter==='all'?'selected':''}>All</option>
      ${DATA.users.map(u=>`<option value="${u.email}" ${ownerFilter===u.email?'selected':''}>${u.name}</option>`).join('')}
    </select></div>`) : '';

    const myCases=(DATA.cases||[]).filter(cs=> isAdmin || cs.investigatorEmail===me.email);
    const caseCtl = `<div><label>Case (optional)</label><select class="input" id="ev-case"><option value="">—</option>${
      myCases.map(cs=>`<option value="${cs.id}">${esc(cs.fileNumber)} — ${esc(cs.title)}</option>`).join('')
    }</select></div>`;

    const ownerCtl = isAdmin ? `<div><label>Owner</label><select class="input" id="ev-owner">
      ${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===me.email?'selected':'')}>${u.name}</option>`).join('')}
    </select></div>` : '';

    return Shell(`
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px">
          <h3 class="section-title">Calendar</h3>
          <div class="sp"></div>${owners}
        </div>
        <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th>Case</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="card">
        <h3 class="section-title">Add Event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="ev-title"></div>
          <div><label>Date</label><input class="input" id="ev-date" type="date" value="${ymd(new Date())}"></div>
          <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
          <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
          <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
          <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
          ${caseCtl}${ownerCtl}
        </div>
        <div class="right" style="margin-top:8px"><button class="btn primary" data-act="createEvent">Add</button></div>
      </div>
    `);
  }

  // Case page with Calendar tab
  function CasePage(id){
    const cs=(DATA.cases||[]).find(c=>c.id===id);
    if(!cs) return `<div class="card">Case not found.</div>`;
    const tabs=['details','notes','tasks','documents','people','calendar'];
    const tab=App.state.tabs.case||'details';

    const details=`<div class="card"><h3 class="section-title">Details</h3>
      <div><strong>${esc(cs.fileNumber)}</strong> — ${esc(cs.title)}</div>
      <div class="muted">${esc(cs.organisation||'')}</div></div>`;
    const notes=`<div class="card"><h3 class="section-title">Notes</h3><div class="muted">Notes (demo)</div></div>`;
    const tasks=`<div class="card"><h3 class="section-title">Tasks</h3><div class="muted">Tasks (demo)</div></div>`;
    const documents=`<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Documents (demo)</div></div>`;
    const people=`<div class="card"><h3 class="section-title">People</h3><div class="muted">People (demo)</div></div>`;

    const me=DATA.me||{}; const isAdmin=(me.role==='Admin');
    const list=(DATA.calendar||[]).filter(e=>e.caseId===id).sort((a,b)=>String(a.startISO).localeCompare(String(b.startISO)));
    const rows=list.map(e=>`
      <tr>
        <td>${new Date(e.startISO).toLocaleDateString()}</td>
        <td>${hhmm(e.startISO)}–${hhmm(e.endISO)}</td>
        <td>${esc(e.title)}</td>
        <td>${esc(e.location||'')}</td>
        <td>${esc(e.ownerName||e.ownerEmail||'')}</td>
        <td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;

    const ownerCtl=isAdmin?`<div><label>Owner</label><select class="input" id="ce-owner">
      ${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===me.email?'selected':'')}>${u.name}</option>`).join('')}
    </select></div>`:'';

    const caseCal=`<div class="card">
      <h3 class="section-title">Case Calendar</h3>
      <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="card">
      <h3 class="section-title">Add case event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="ce-title"></div>
        <div><label>Date</label><input class="input" id="ce-date" type="date" value="${ymd(new Date())}"></div>
        <div><label>Type</label><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="ce-start" type="time" value="10:00"></div>
        <div><label>End</label><input class="input" id="ce-end" type="time" value="11:00"></div>
        <div><label>Location</label><input class="input" id="ce-loc"></div>
        ${ownerCtl}
      </div>
      <div class="right" style="margin-top:8px"><button class="btn primary" data-act="createCaseEvent" data-arg="${id}">Add</button></div>
    </div>`;

    const tabsHtml=`<div class="tabs">${tabs.map(k=>`<div class="tab ${tab===k?'active':''}" data-act="tab" data-scope="case" data-arg="${k}">${k[0].toUpperCase()+k.slice(1)}</div>`).join('')}</div>`;

    const body=`
      <div class="tabpanel ${tab==='details'?'active':''}">${details}</div>
      <div class="tabpanel ${tab==='notes'?'active':''}">${notes}</div>
      <div class="tabpanel ${tab==='tasks'?'active':''}">${tasks}</div>
      <div class="tabpanel ${tab==='documents'?'active':''}">${documents}</div>
      <div class="tabpanel ${tab==='people'?'active':''}">${people}</div>
      <div class="tabpanel ${tab==='calendar'?'active':''}">${caseCal}</div>`;

    const header=`<div class="card" style="display:flex;align-items:center;gap:8px">
      <button class="btn light" data-act="nav" data-arg="cases">← Back</button>
      <h3 class="section-title">Case: ${esc(cs.fileNumber)} — ${esc(cs.title)}</h3>
    </div>`;

    return Shell(header + tabsHtml + body);
  }

  // Other pages
  const Cases=()=>`<div class="card"><h3 class="section-title">Cases</h3>
    <table><thead><tr><th>File #</th><th>Title</th><th>Investigator</th><th></th></tr></thead><tbody>${
      DATA.cases.map(cs=>`<tr><td>${esc(cs.fileNumber)}</td><td>${esc(cs.title)}</td><td>${esc(cs.investigatorEmail)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>`).join('')
    }</tbody></table></div>`;
  const Companies=()=>`<div class="card"><h3 class="section-title">Companies</h3>${DATA.companies.map(c=>`<div>${esc(c.name)}</div>`).join('')}</div>`;
  const Contacts=()=>`<div class="card"><h3 class="section-title">Contacts</h3>${DATA.contacts.map(c=>`<div>${esc(c.name)} — ${esc(c.email)}</div>`).join('')}</div>`;
  const Documents=()=>`<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Templates & Procedures (demo)</div></div>`;
  const Resources=()=>`<div class="card"><h3 class="section-title">Resources</h3><div class="muted">Links / FAQs / Guides (demo)</div></div>`;
  const Admin=()=>`<div class="card"><h3 class="section-title">Admin</h3><div class="muted">Users / Settings / Audit (demo)</div></div>`;

  // Modal helpers
  function closeModal(){ const m=$('#modal-root'); if(!m) return; m.style.display='none'; m.innerHTML=''; }
  function renderEventModal(ev){
    const me=DATA.me||{}; const isAdmin=(me.role==='Admin');
    const ownerCtl=isAdmin?`<div><label>Owner</label><select class="input" id="em-owner">
      ${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join('')}
    </select></div>`:'';
    const myCases=(DATA.cases||[]).filter(cs=> isAdmin || cs.investigatorEmail===me.email);
    const caseCtl=`<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${
      myCases.map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||''))?'selected':''}>${esc(cs.fileNumber)} — ${esc(cs.title)}</option>`).join('')
    }</select></div>`;
    const node=$('#modal-root');
    node.innerHTML=`<div class="modal">
      <h3 class="section-title">Edit Event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
        <div><label>Date</label><input class="input" id="em-date" type="date" value="${(ev.startISO||'').slice(0,10)}"></div>
        <div><label>Type</label><select class="input" id="em-type"><option${ev.type==='Appointment'?' selected':''}>Appointment</option><option${ev.type==='Note'?' selected':''}>Note</option></select></div>
        <div><label>Start</label><input class="input" id="em-start" type="time" value="${new Date(ev.startISO).toISOString().slice(11,16)}"></div>
        <div><label>End</label><input class="input" id="em-end" type="time" value="${new Date(ev.endISO).toISOString().slice(11,16)}"></div>
        <div><label>Location</label><input class="input" id="em-loc" value="${esc(ev.location||'')}"></div>
        ${caseCtl}${ownerCtl}
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn" data-act="saveEvent" data-arg="${ev.id}">Save</button>
        <button class="btn danger" data-act="deleteEvent" data-arg="${ev.id}">Delete</button>
        <button class="btn light" data-act="closeModal">Cancel</button>
      </div>
    </div>`;
    node.style.display='flex';
  }

  // Click handlers
  document.addEventListener('click',(e)=>{
    let t=e.target; while(t&&t!==document&&!t.dataset.act) t=t.parentNode; if(!t||t===document) return;
    const act=t.dataset.act, arg=t.dataset.arg||'';
    const me=DATA.me||{}; const isAdmin=(me.role==='Admin');

    if(act==='nav'){ App.set({route:arg}); return; }
    if(act==='openCase'){ App.set({route:'case', currentCaseId:arg, tabs:{...App.state.tabs, case:'details'}}); return; }
    if(act==='tab' && t.dataset.scope==='case'){ App.set({tabs:{...App.state.tabs, case:arg}}); return; }

    // notifications
    if(act==='toggleNotiPanel'){ App.set({showNoti:!App.state.showNoti}); return; }
    if(act==='toggleNotiFilter'){ App.set({notiOnlyUnread:!App.state.notiOnlyUnread}); return; }
    if(act==='markAllRead'){ (DATA.notifications||[]).forEach(n=>n.read=true); saveNotis(); App.set({}); return; }
    if(act==='dismissNoti'){ DATA.notifications=(DATA.notifications||[]).filter(n=>n.id!==arg); saveNotis(); App.set({}); return; }
    if(act==='openNoti'){ const n=(DATA.notifications||[]).find(x=>x.id===arg); if(n){ n.read=true; saveNotis(); if(n.payload&&n.payload.type==='event'){ App.set({route:'calendar'}); const ev=DATA.calendar.find(e=>e.id===n.payload.id); if(ev) renderEventModal(ev);} else { App.set({route:'calendar'}); } } return; }

    // calendar create / edit
    if(act==='createEvent'){
      const title=$('#ev-title')?.value?.trim()||'Untitled';
      const date=$('#ev-date')?.value||ymd(new Date());
      const start=$('#ev-start')?.value||'09:00';
      const end=$('#ev-end')?.value||'10:00';
      const type=$('#ev-type')?.value||'Appointment';
      const loc=$('#ev-loc')?.value||'';
      const owner=isAdmin?($('#ev-owner')?.value||me.email):me.email;
      const ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner;
      const caseId=$('#ev-case')?.value||'';
      const sISO=`${date}T${start}:00`, eISO=`${date}T${end}:00`;
      const ev={id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||null};
      (DATA.calendar=DATA.calendar||[]).push(ev); pushNoti('created', title, {type:'event', id:ev.id}); save(); App.set({}); return;
    }
    if(act==='openEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) renderEventModal(ev); return; }
    if(act==='saveEvent'){
      const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
      const date=$('#em-date')?.value||ev.startISO.slice(0,10);
      const s=$('#em-start')?.value||ev.startISO.slice(11,16);
      const e2=$('#em-end')?.value||ev.endISO.slice(11,16);
      ev.title=$('#em-title')?.value||ev.title;
      ev.type=$('#em-type')?.value||ev.type;
      ev.location=$('#em-loc')?.value||ev.location;
      const caseVal=$('#em-case')?.value||''; ev.caseId=caseVal||null;
      if(isAdmin){ const owner=$('#em-owner')?.value||ev.ownerEmail; ev.ownerEmail=owner; ev.ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner; }
      ev.startISO=`${date}T${s}:00`; ev.endISO=`${date}T${e2}:00`;
      pushNoti('updated', ev.title, {type:'event', id:ev.id}); save(); closeModal(); App.set({}); return;
    }
    if(act==='deleteEvent'){ const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(ev) pushNoti('deleted', ev.title, {type:'event', id:ev.id}); DATA.calendar=(DATA.calendar||[]).filter(x=>x.id!==arg); save(); closeModal(); App.set({}); return; }
    if(act==='closeModal'){ closeModal(); return; }

    // case event create
    if(act==='createCaseEvent'){
      const csId=arg;
      const title=$('#ce-title')?.value?.trim()||'Untitled';
      const date=$('#ce-date')?.value||ymd(new Date());
      const start=$('#ce-start')?.value||'10:00';
      const end=$('#ce-end')?.value||'11:00';
      const type=$('#ce-type')?.value||'Appointment';
      const loc=$('#ce-loc')?.value||'';
      const owner=isAdmin?($('#ce-owner')?.value||me.email):me.email;
      const ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner;
      const sISO=`${date}T${start}:00`, eISO=`${date}T${end}:00`;
      const ev={id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:csId};
      (DATA.calendar=DATA.calendar||[]).push(ev); pushNoti('created', title, {type:'event', id:ev.id}); save(); App.set({}); return;
    }
  }, true);

  document.addEventListener('change',(e)=>{ if(e.target && e.target.id==='owner-filter'){ App.set({ownerFilter:e.target.value}); }});

  function render(){
    Topbar(); renderNav();
    const main=$('#main'); let html='';
    if(App.state.route==='dashboard') html=Dashboard();
    else if(App.state.route==='calendar') html=Calendar();
    else if(App.state.route==='cases') html=Cases();
    else if(App.state.route==='companies') html=Companies();
    else if(App.state.route==='contacts') html=Contacts();
    else if(App.state.route==='documents') html=Documents();
    else if(App.state.route==='resources') html=Resources();
    else if(App.state.route==='admin') html=Admin();
    else if(App.state.route==='case') html=CasePage(App.state.currentCaseId);
    main.innerHTML=html;
  }

  document.addEventListener('DOMContentLoaded',()=>{ try{ loadNotis(); }catch(_){ } render(); });
})();