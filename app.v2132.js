/* Clean minimal app v2132 — calendar linked to cases, case tab with add/edit/delete. */
(function(){
  // ---------- Utilities
  const $ = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]);
  const uid = () => Math.random().toString(36).slice(2,10);
  const ymd = d => new Date(d).toISOString().slice(0,10);
  const hhmm = d => new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

  // ---------- Data (seed + persistence)
  const store = {
    load(){
      try{
        const j = JSON.parse(localStorage.getItem('SYNERGY_DATA')||'{}');
        Object.assign(DATA, j);
      }catch(e){}
    },
    save(){
      try{ localStorage.setItem('SYNERGY_DATA', JSON.stringify(DATA)); }catch(e){}
    }
  };

  const DATA = {
    users: [
      {id:'u1', name:'Admin User', email:'admin@example.com', role:'Admin'},
      {id:'u2', name:'Ivy Investigator', email:'ivy@example.com', role:'Investigator'},
      {id:'u3', name:'Ivan Investigator', email:'ivan@example.com', role:'Investigator'}
    ],
    me: {id:'u1', name:'Admin User', email:'admin@example.com', role:'Admin'},
    companies: [{id:'co1', name:'Acme Pty Ltd'}, {id:'co2', name:'Globex Pty Ltd'}],
    contacts: [{id:'p1', name:'Mary Manager', companyId:'co1', email:'mary@acme.com'}],
    cases: [
      {id:'c1', fileNumber:'F-001', title:'Payroll Irregularities', companyId:'co1', investigatorEmail:'ivy@example.com', priority:'High', status:'Investigation'},
      {id:'c2', fileNumber:'F-002', title:'Supplier Collusion', companyId:'co2', investigatorEmail:'ivan@example.com', priority:'Medium', status:'Planning'}
    ],
    calendar: [
      {id:'e1', title:'Interview payroll staff', description:'', startISO:'2025-08-19T09:30:00', endISO:'2025-08-19T10:30:00', ownerEmail:'ivy@example.com', ownerName:'Ivy Investigator', location:'Room 2', type:'Appointment', caseId:'c1'},
      {id:'e2', title:'Evidence review', description:'', startISO:'2025-08-20T11:00:00', endISO:'2025-08-20T12:00:00', ownerEmail:'ivan@example.com', ownerName:'Ivan Investigator', location:'Office', type:'Note', caseId:'c2'}
    ],
    notifications: []
  };
  store.load();

  // ---------- App shell + routing
  const App = {
    state: { route:'dashboard', tabs:{}, currentCaseId:null, view:'month' },
    set(patch){ Object.assign(App.state, patch); render(); },
  };

  const routes = ['dashboard','calendar','cases','companies','contacts','resources','admin'];

  function renderNav(){
    const nav = $('#nav'); if(!nav) return;
    nav.innerHTML = routes.map(r=>{
      const lbl = r[0].toUpperCase()+r.slice(1);
      const active = (App.state.route===r)?'active':'';
      return `<div class="item ${active}" data-act="nav" data-arg="${r}">${lbl} <span>›</span></div>`;
    }).join('');
  }

  function headerUser(){
    const me = DATA.me||{};
    $('#userbox').innerHTML = `You: ${esc(me.name)} (${esc(me.role)})`;
  }

  // ---------- Dashboard
  function Dashboard(){
    const me = DATA.me||{}; const isAdmin = (me.role==='Admin');
    const unread = (DATA.notifications||[]).filter(n=>!n.read);
    const notifRows = (unread.length?unread:DATA.notifications).slice(0,20).map(n=>`
      <tr><td>${new Date(n.when).toLocaleString()}</td>
          <td>${esc(n.action)}</td>
          <td>${esc(n.title)}</td>
          <td class="right"><button class="btn" data-act="notifOpen" data-arg="${n.id}">Open</button>
            <button class="btn" data-act="notifDismiss" data-arg="${n.id}">Dismiss</button></td></tr>
    `).join('') || `<tr><td colspan="4" class="muted">No notifications</td></tr>`;

    return `
      <div class="grid cols-2">
        <div class="card">
          <h3 class="section-title">Welcome</h3>
          <div>Timestamp: ${new Date().toLocaleString()}</div>
        </div>
        <div class="card">
          <h3 class="section-title">Calendar updates ${isAdmin? '(Admin)': ''}</h3>
          <table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>${notifRows}</tbody></table>
          <div class="right" style="margin-top:6px">
            <button class="btn" data-act="notifMarkAll">Mark all read</button>
          </div>
        </div>
        <div class="card">
          <h3 class="section-title">Active Cases</h3>
          <table><thead><tr><th>ID</th><th>Title</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${DATA.cases.map(cs=>`<tr>
              <td>${esc(cs.fileNumber)}</td>
              <td>${esc(cs.title)}</td>
              <td>${esc((DATA.companies.find(c=>c.id===cs.companyId)||{}).name||'')}</td>
              <td>${esc(cs.investigatorEmail)}</td>
              <td>${esc(cs.status)}</td>
              <td class="right"><button class="btn" data-act="openCase" data-arg="${cs.id}">Open</button></td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>`;
  }

  // ---------- Calendar (global)
  function Calendar(){
    const me = DATA.me||{}; const isAdmin = (me.role==='Admin');
    const ownerCtl = isAdmin ? `<div><label>Owner</label><select class="input" id="ev-owner">
      ${DATA.users.map(u=>`<option value="${u.email}" ${(u.email===me.email?'selected':'')}>${u.name}</option>`).join('')}
    </select></div>` : '';
    const myCases = (DATA.cases||[]).filter(cs=> isAdmin || cs.investigatorEmail===me.email || cs.investigator===me.name);
    const caseCtl = `<div><label>Case (optional)</label><select class="input" id="ev-case"><option value="">—</option>${
      myCases.map(cs=>`<option value="${cs.id}">${esc(cs.fileNumber)} — ${esc(cs.title)}</option>`).join('')
    }</select></div>`;

    const rows = (DATA.calendar||[]).filter(ev=> isAdmin || ev.ownerEmail===me.email).sort((a,b)=>a.startISO.localeCompare(b.startISO)).map(ev=>`
      <tr><td>${new Date(ev.startISO).toLocaleDateString()}</td>
          <td>${hhmm(ev.startISO)}–${hhmm(ev.endISO)}</td>
          <td>${esc(ev.title)}</td>
          <td>${esc(ev.location||'')}</td>
          <td>${esc(ev.ownerName||ev.ownerEmail||'')}</td>
          <td>${esc((DATA.cases.find(c=>c.id===ev.caseId)||{}).fileNumber||'')}</td>
          <td class="right"><button class="btn" data-act="openEvent" data-arg="${ev.id}">Open</button></td></tr>
    `).join('') || `<tr><td colspan="7" class="muted">No events</td></tr>`;

    return `
      <div class="card">
        <h3 class="section-title">Calendar</h3>
        <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th>Case</th><th></th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="card">
        <h3 class="section-title">Add Event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="ev-title" placeholder="Title"></div>
          <div><label>Date</label><input class="input" id="ev-date" type="date" value="${ymd(new Date())}"></div>
          <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
          <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
          <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
          <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
          ${caseCtl}
          ${ownerCtl}
        </div>
        <div class="right" style="margin-top:8px">
          <button class="btn primary" data-act="createEvent">Add</button>
        </div>
      </div>`;
  }

  // ---------- Case Page
  function CasePage(id){
    const cs = DATA.cases.find(c=>c.id===id);
    if(!cs) return `<div class="card">Case not found.</div>`;
    const tab = (App.state.tabs.case||'details');

    const details = `<div class="card">
      <h3 class="section-title">Details</h3>
      <div><strong>${esc(cs.fileNumber)}</strong> — ${esc(cs.title)}</div>
      <div class="muted">${esc((DATA.companies.find(c=>c.id===cs.companyId)||{}).name||'')}</div>
    </div>`;

    const notes = `<div class="card"><h3 class="section-title">Notes</h3><div class="muted">Notes list (demo)</div></div>`;
    const tasks = `<div class="card"><h3 class="section-title">Tasks</h3><div class="muted">Tasks list (demo)</div></div>`;
    const documents = `<div class="card"><h3 class="section-title">Documents</h3><div class="muted">Documents (demo)</div></div>`;
    const people = `<div class="card"><h3 class="section-title">People</h3><div class="muted">Company contacts (demo)</div></div>`;

    // Calendar tab for this case
    const me = DATA.me||{}; const isAdmin = (me.role==='Admin');
    const list = (DATA.calendar||[]).filter(e=>e.caseId===id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows = list.map(e=>`
      <tr>
        <td>${new Date(e.startISO).toLocaleDateString()}</td>
        <td>${hhmm(e.startISO)}–${hhmm(e.endISO)}</td>
        <td>${esc(e.title)}</td>
        <td>${esc(e.location||'')}</td>
        <td>${esc(e.ownerName||e.ownerEmail||'')}</td>
        <td class="right"><button class="btn" data-act="openEvent" data-arg="${e.id}">Open</button></td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;

    const ownerCtl = isAdmin ? `<div><label>Owner</label><select class="input" id="ce-owner">${
      DATA.users.map(u=>`<option value="${u.email}" ${(u.email===me.email?'selected':'')}>${u.name}</option>`).join('')
    }</select></div>` : "";

    const caseCal = `<div class="card">
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
      <div class="right" style="margin-top:8px">
        <button class="btn primary" data-act="createCaseEvent" data-arg="${id}">Add</button>
      </div>
    </div>`;

    const tabs = `<div class="tabs">
      ${['details','notes','tasks','documents','people','calendar'].map(k=>`
        <div class="tab ${tab===k?'active':''}" data-act="tab" data-scope="case" data-arg="${k}">${k[0].toUpperCase()+k.slice(1)}</div>`).join('')}
    </div>`;

    const body = `<div class="tabpanel ${tab==='details'?'active':''}">${details}</div>
                  <div class="tabpanel ${tab==='notes'?'active':''}">${notes}</div>
                  <div class="tabpanel ${tab==='tasks'?'active':''}">${tasks}</div>
                  <div class="tabpanel ${tab==='documents'?'active':''}">${documents}</div>
                  <div class="tabpanel ${tab==='people'?'active':''}">${people}</div>
                  <div class="tabpanel ${tab==='calendar'?'active':''}">${caseCal}</div>`;

    return `<div class="card"><button class="btn" data-act="nav" data-arg="cases">← Back</button>
              <h3 class="section-title">Case: ${esc(cs.fileNumber)} — ${esc(cs.title)}</h3></div>${tabs}${body}`;
  }

  // ---------- Other pages (minimal for nav completeness)
  const Companies = () => `<div class="card"><h3 class="section-title">Companies</h3>${
    DATA.companies.map(c=>`<div>${esc(c.name)}</div>`).join('')
  }</div>`;
  const Cases = () => `<div class="card"><h3 class="section-title">Cases</h3>
    <table><thead><tr><th>File #</th><th>Title</th><th>Investigator</th><th></th></tr></thead><tbody>${
      DATA.cases.map(cs=>`<tr><td>${esc(cs.fileNumber)}</td><td>${esc(cs.title)}</td><td>${esc(cs.investigatorEmail)}</td><td class="right"><button class="btn" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>`).join('')
    }</tbody></table></div>`;
  const Contacts = () => `<div class="card"><h3 class="section-title">Contacts</h3><div class="muted">Demo</div></div>`;
  const Resources = () => `<div class="card"><h3 class="section-title">Resources</h3><div class="muted">Links/FAQs</div></div>`;
  const Admin = () => `<div class="card"><h3 class="section-title">Admin</h3><div class="muted">Users & roles (demo)</div></div>`;

  // ---------- Event Modal
  function renderEventModal(ev){
    if(!ev){ $('#modal-root')?.remove(); return; }
    const me = DATA.me||{}; const isAdmin = (me.role==='Admin');
    const ownerCtl = isAdmin ? `<div><label>Owner</label><select class="input" id="em-owner">${
      DATA.users.map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join('')
    }</select></div>` : '';
    const myCases = (DATA.cases||[]).filter(cs=> isAdmin || cs.investigatorEmail===me.email || cs.investigator===me.name);
    const caseCtl = `<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${
      myCases.map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||'')?'selected':'')}>${esc(cs.fileNumber)} — ${esc(cs.title)}</option>`).join('')
    }</select></div>`;
    const node = document.createElement('div'); node.id='modal-root';
    node.innerHTML = `<div class="modal-backdrop" data-act="closeModal"></div>
      <div class="modal">
        <h3 class="section-title">Edit Event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
          <div><label>Date</label><input class="input" id="em-date" type="date" value="${(ev.startISO||'').slice(0,10)}"></div>
          <div><label>Type</label><select class="input" id="em-type"><option${ev.type==='Appointment'?' selected':''}>Appointment</option><option${ev.type==='Note'?' selected':''}>Note</option></select></div>
          <div><label>Start</label><input class="input" id="em-start" type="time" value="${new Date(ev.startISO).toISOString().slice(11,16)}"></div>
          <div><label>End</label><input class="input" id="em-end" type="time" value="${new Date(ev.endISO).toISOString().slice(11,16)}"></div>
          <div><label>Location</label><input class="input" id="em-loc" value="${esc(ev.location||'')}"></div>
          ${caseCtl}
          ${ownerCtl}
        </div>
        <div class="right" style="margin-top:8px">
          <button class="btn primary" data-act="saveEvent" data-arg="${ev.id}">Save</button>
          <button class="btn danger" data-act="deleteEvent" data-arg="${ev.id}">Delete</button>
          <button class="btn" data-act="closeModal">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(node);
  }

  function notify(action, ev){
    DATA.notifications.unshift({id:uid(), action, title:ev.title, evId:ev.id, when:new Date().toISOString(), read:false});
  }

  // ---------- Global click handler
  document.addEventListener('click', (e)=>{
    let t = e.target; while(t && t!==document && !t.dataset.act) t=t.parentNode;
    if(!t||t===document) return;
    const act = t.dataset.act; const arg = t.dataset.arg||'';
    const me = DATA.me||{}; const isAdmin = (me.role==='Admin');

    if(act==='nav'){ App.set({route:arg}); return; }
    if(act==='openCase'){ App.set({route:'case', currentCaseId:arg, tabs:{...App.state.tabs, case:'details'}}); return; }
    if(act==='tab' && t.dataset.scope==='case'){ App.set({tabs:{...App.state.tabs, case:arg}}); return; }

    if(act==='createEvent'){
      const title = $('#ev-title')?.value?.trim()||'Untitled';
      const date = $('#ev-date')?.value||ymd(new Date());
      const start = $('#ev-start')?.value||'09:00';
      const end = $('#ev-end')?.value||'10:00';
      const type = $('#ev-type')?.value||'Appointment';
      const loc = $('#ev-loc')?.value||'';
      const owner = isAdmin ? ($('#ev-owner')?.value||me.email) : me.email;
      const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
      const caseId = $('#ev-case')?.value||'';
      const sISO = `${date}T${start}:00`, eISO = `${date}T${end}:00`;
      const ev = {id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||null};
      DATA.calendar.push(ev); notify('created', ev); store.save(); render(); return;
    }
    if(act==='openEvent'){ const ev = DATA.calendar.find(x=>x.id===arg); if(ev) renderEventModal(ev); return; }
    if(act==='saveEvent'){
      const ev = DATA.calendar.find(x=>x.id===arg); if(!ev) return;
      const date = $('#em-date')?.value || ev.startISO.slice(0,10);
      const start = $('#em-start')?.value || ev.startISO.slice(11,16);
      const end = $('#em-end')?.value || ev.endISO.slice(11,16);
      ev.title = $('#em-title')?.value || ev.title;
      ev.type = $('#em-type')?.value || ev.type;
      ev.location = $('#em-loc')?.value || ev.location;
      ev.startISO = `${date}T${start}:00`; ev.endISO = `${date}T${end}:00`;
      const caseId = $('#em-case')?.value||''; ev.caseId = caseId||null;
      if(isAdmin){ const owner=$('#em-owner')?.value||ev.ownerEmail; ev.ownerEmail=owner; ev.ownerName=(DATA.users.find(u=>u.email===owner)||{}).name||owner; }
      notify('updated', ev); store.save(); $('#modal-root')?.remove(); render(); return;
    }
    if(act==='deleteEvent'){ const ev=DATA.calendar.find(x=>x.id===arg); if(ev) notify('deleted', ev); DATA.calendar = DATA.calendar.filter(x=>x.id!==arg); store.save(); $('#modal-root')?.remove(); render(); return; }

    if(act==='createCaseEvent'){
      const csId = arg;
      const title = $('#ce-title')?.value?.trim()||'Untitled';
      const date = $('#ce-date')?.value||ymd(new Date());
      const start = $('#ce-start')?.value||'10:00';
      const end = $('#ce-end')?.value||'11:00';
      const type = $('#ce-type')?.value||'Appointment';
      const loc = $('#ce-loc')?.value||'';
      const owner = isAdmin ? ($('#ce-owner')?.value||me.email) : me.email;
      const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
      const sISO = `${date}T${start}:00`, eISO = `${date}T${end}:00`;
      const ev = {id:uid(), title, description:'', startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:csId};
      DATA.calendar.push(ev); notify('created', ev); store.save(); render(); return;
    }

    if(act==='notifOpen'){
      const n=(DATA.notifications||[]).find(n=>n.id===arg); if(n) n.read=true;
      const ev = DATA.calendar.find(e=>e.id=== (n?n.evId:null)); if(ev) renderEventModal(ev);
      store.save(); render(); return;
    }
    if(act==='notifDismiss'){ const n=(DATA.notifications||[]).find(n=>n.id===arg); if(n) n.read=true; store.save(); render(); return; }
    if(act==='notifMarkAll'){ (DATA.notifications||[]).forEach(n=>n.read=true); store.save(); render(); return; }
  });

  // ---------- Render
  function render(){
    headerUser(); renderNav();
    const main = $('#main'); if(!main) return;
    let html = '';
    if(App.state.route==='dashboard') html = Dashboard();
    else if(App.state.route==='calendar') html = Calendar();
    else if(App.state.route==='cases') html = Cases();
    else if(App.state.route==='companies') html = Companies();
    else if(App.state.route==='contacts') html = Contacts();
    else if(App.state.route==='resources') html = Resources();
    else if(App.state.route==='admin') html = Admin();
    else if(App.state.route==='case') html = CasePage(App.state.currentCaseId);
    main.innerHTML = html;
  }

  // ---------- Boot
  window.addEventListener('DOMContentLoaded', ()=>{ render(); });
})();