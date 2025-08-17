(()=>{
  "use strict";
  const BUILD="v2.13.0";
  const STAMP=(new Date()).toISOString();

  // ---------- Utilities ----------
  const uid = ()=>"id-"+Math.random().toString(36).slice(2,9);
  const $ = sel=>document.querySelector(sel);

  // ---------- Seed Data (in-memory) ----------
  const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;
  const mkCase=(y,seq,p={})=>Object.assign({
    id:uid(),
    fileNumber:`INV-${y}-${String(seq).padStart(3,"0")}`,
    title:"",
    organisation:"",
    companyId:"C-001",
    investigatorEmail:"",
    investigatorName:"",
    status:"Planning",
    priority:"Medium",
    created:`${y}-${String((seq%12)||1).padStart(2,"0")}`,
    notes:[],
    tasks:[],
    folders:{General:[]}
  }, p);

  const DATA={
    users:[
      {name:"Admin",email:"admin@synergy.com",role:"Admin"},
      {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
      {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
      {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
    ],
    companies:[
      {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Private",phone:"07 345 5678",email:"admin@sunrisemining.com",website:"www.sunrisemining.com",abn:"12 345 678 901",acn:"345 678 901",state:"Queensland",city:"Brisbane",postcode:"4000",folders:{General:[]}},
      {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Public",phone:"03 0000 0000",email:"info@melbourne.gov.au",website:"",abn:"",acn:"",state:"VIC",city:"Melbourne",postcode:"3000",folders:{General:[]}},
      {id:"C-003",name:"Queensland Health (Metro North)",industry:"Health",type:"Government",phone:"07 0000 0000",email:"",website:"",abn:"",acn:"",state:"QLD",city:"Brisbane",postcode:"4000",folders:{General:[]}}
    ],
    contacts:[
      {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",org:"Investigator",phone:"",notes:""},
      {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",org:"Investigator",phone:"",notes:""},
      {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",org:"Reviewer",phone:"",notes:""}
    ],
    cases:[
      mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:`${LAST}-01`}),
      mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:`${LAST}-07`}),
      mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:`${YEAR}-01`}),
      mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:`${YEAR}-06`}),
      mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:`${YEAR}-07`})
    ],
    me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
  };

  // ---------- App State ----------
  const App={
    state:{
      route:"companies",
      currentCaseId:null,
      currentCompanyId:null,
      currentContactId:null,
      companyTab:"summary",
      caseTab:"details",
      contactTab:"details",
      casesFilter:{q:""},
      currentUploadTarget:null,
      currentCompanyUploadTarget:null
    },
    set(p){ Object.assign(this.state,p||{}); render(); },
    get(){ return DATA; }
  };

  // ---------- Layout ----------
  const Topbar=()=> `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable ${BUILD}</span></div>`;
  const Sidebar=(active)=>{
    const items=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["resources","Resources"],["admin","Admin"]];
    return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">`+
      items.map(([k,v])=>`<li ${active===k?'class="active"':''} data-act="route" data-arg="${k}">${v}</li>`).join("")+
      `</ul></aside>`;
  };
  const Shell=(content,active)=> Topbar()+`<div class="shell">`+Sidebar(active)+`<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`;

  // ---------- Helpers ----------
  const coName = id => (DATA.companies.find(c=>c.id===id)||{}).name || "";
  const findCase = id => DATA.cases.find(c=>c.id===id)||null;
  const findContact = id => DATA.contacts.find(c=>c.id===id)||null;
  const findCompany = id => DATA.companies.find(c=>c.id===id)||null;

  // ---------- Dashboard (simple) ----------
  function Dashboard(){
    const rows = DATA.cases.slice(0,6).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td><td>${c.status}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
    return Shell(`<div class="card"><h3>Welcome</h3><div class="mono">${STAMP}</div></div>
      <div class="section"><header><h3 class="section-title">Active Cases</h3></header>
      <table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, "dashboard");
  }

  // ---------- Cases List ----------
  function Cases(){
    const f=App.state.casesFilter||{q:""};
    const list=DATA.cases.filter(c=>{
      if(!f.q) return true;
      const q=f.q.toLowerCase();
      return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q);
    });
    const rows=list.map(cc=>`<tr><td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td>${cc.status}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td></tr>`).join("");
    const tools=`<div class="grid cols-3" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="${f.q||''}"></div>
      <div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>`;
    return Shell(`<div class="section"><header><h3 class="section-title">Cases</h3></header>${tools}
      <table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,"cases");
  }

  // ---------- Case Page (with tabs) ----------
  function CasePage(id){
    const cs=findCase(id);
    if(!cs){ alert("Case not found"); App.set({route:"cases"}); return Shell(`<div class="card">Case not found.</div>`,"cases"); }
    cs.folders = cs.folders || {General:[]};
    const invOpts = ()=> DATA.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role))
      .map(u=>`<option ${(u.email===cs.investigatorEmail)?'selected':''} value="${u.email}">${u.name} (${u.role})</option>`).join("");
    const coOpts = ()=> DATA.companies.map(co=>`<option ${(co.id===cs.companyId)?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");

    const header = `<div class="card"><div style="display:flex;gap:8px;align-items:center">
        <h2>Case ${cs.fileNumber}</h2><div class="sp"></div>
        <button class="btn" data-act="saveCase" data-arg="${id}">Save Case</button>
        <button class="btn danger" data-act="deleteCase" data-arg="${id}">Delete Case</button>
        <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button>
      </div></div>`;

    // Tabs
    const tab = App.state.caseTab || "details";
    const btn = (k,l)=>`<div class="tab ${tab===k?'active':''}" data-act="caseTab" data-arg="${k}">${l}</div>`;

    // Details
    const details = `<div class="tabpanel ${tab==='details'?'active':''}">
      <div class="card">
        <div class="grid cols-2">
          <div><label>Case ID</label><input class="input" id="c-id" value="${cs.fileNumber||''}"></div>
          <div><label>Organisation (display)</label><input class="input" id="c-org" value="${cs.organisation||''}"></div>
          <div><label>Title</label><input class="input" id="c-title" value="${cs.title||''}"></div>
          <div><label>Company</label><select class="input" id="c-company">${coOpts()}</select></div>
          <div><label>Investigator</label><select class="input" id="c-inv">${invOpts()}</select></div>
          <div><label>Status</label><select class="input" id="c-status">
            ${["Planning","Investigation","Evidence Review","Reporting","Closed"].map(s=>`<option${cs.status===s?' selected':''}>${s}</option>`).join("")}
          </select></div>
          <div><label>Priority</label><select class="input" id="c-priority">
            ${["Low","Medium","High","Critical"].map(s=>`<option${cs.priority===s?' selected':''}>${s}</option>`).join("")}
          </select></div>
        </div>
      </div>
    </div>`;

    // Notes
    const notesRows = (cs.notes&&cs.notes.length)? cs.notes.map(nn=>`<tr><td>${nn.time||""}</td><td>${nn.by||""}</td><td>${nn.text||""}</td></tr>`).join("") : `<tr><td colspan="3" class="muted">No notes yet.</td></tr>`;
    const notes = `<div class="tabpanel ${tab==='notes'?'active':''}">
      <div class="section">
        <header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="${id}">Add Note</button></header>
        <textarea class="input" id="note-text" placeholder="Type your note here"></textarea>
        <table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">${notesRows}</tbody></table>
      </div>
    </div>`;

    // Tasks
    const taskRows = (cs.tasks&&cs.tasks.length)? cs.tasks.map(tt=>`<tr><td>${tt.id}</td><td>${tt.title}</td><td>${tt.assignee}</td><td>${tt.due}</td><td>${tt.status}</td></tr>`).join("") : `<tr><td colspan="5" class="muted">No tasks yet.</td></tr>`;
    const tasks = `<div class="tabpanel ${tab==='tasks'?'active':''}">
      <div class="section">
        <header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="${id}">Add standard tasks</button></header>
        <div class="grid cols-3">
          <input class="input" id="task-title" placeholder="Task title">
          <input class="input" id="task-due" type="date">
          <select class="input" id="task-assignee">${invOpts()}</select>
        </div>
        <div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="${id}">Add</button></div>
        <table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${taskRows}</tbody></table>
      </div>
    </div>`;

    // Documents
    let docRows="";
    for(const fname in cs.folders){
      if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue;
      const files=cs.folders[fname];
      docRows+=`<tr><th colspan="3">${fname}</th></tr>`;
      docRows+=`<tr><td colspan="3" class="right">
        <button class="btn light" data-act="selectFiles" data-arg="${id}::${fname}">Upload to ${fname}</button>
        ${fname==='General'?'':`<button class="btn light" data-act="deleteFolder" data-arg="${id}::${fname}">Delete folder</button>`}
      </td></tr>`;
      if(!files.length) docRows+=`<tr><td colspan="3" class="muted">No files</td></tr>`;
      for(const ff of files){
        const a=`${id}::${fname}::${ff.name}`;
        docRows+=`<tr><td>${ff.name}</td><td>${ff.size}</td><td class="right">
          ${ff.dataUrl?`<button class="btn light" data-act="viewDoc" data-arg="${a}">View</button>`:""}
          <button class="btn light" data-act="removeDoc" data-arg="${a}">Remove</button></td></tr>`;
      }
    }
    const docs = `<div class="tabpanel ${tab==='docs'?'active':''}">
      <div class="section">
        <header><h3 class="section-title">Case Documents</h3><div>
          <button class="btn light" data-act="addFolderPrompt" data-arg="${id}">Add folder</button>
          <button class="btn light" data-act="selectFiles" data-arg="${id}::General">Select files</button>
        </div></header>
        <input type="file" id="case-file-any" multiple style="display:none">
        <div style="margin-top:8px">
          <table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${docRows}</tbody></table>
        </div>
      </div>
    </div>`;

    const tabs = `<div class="tabs">${btn("details","Details")}${btn("notes","Notes")}${btn("tasks","Tasks")}${btn("docs","Documents")}</div>`;
    return Shell(header+`<div class="card">${tabs+details+notes+tasks+docs}</div>`,"cases");
  }

  // ---------- Contacts ----------
  function Contacts(){
    const rows = DATA.contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email||''}</td><td>${coName(c.companyId)}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header>
      <table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,"contacts");
  }

  function ContactPage(id){
    const c=findContact(id);
    if(!c) return Shell(`<div class="card">Contact not found.</div>`,"contacts");
    c.portal = c.portal || {enabled:true, role:(c.role||"Investigator")};
    const coOpts=()=>['<option value="">(No linked company)</option>'].concat(DATA.companies.map(co=>`<option ${(co.id===c.companyId)?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`)).join("");

    const header = `<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div>
      <button class="btn" data-act="saveContact" data-arg="${id}">Save</button>
      <button class="btn danger" data-act="deleteContact" data-arg="${id}">Delete</button>
      <button class="btn light" data-act="route" data-arg="contacts">Back to Contacts</button></div></div>`;

    const tab = App.state.contactTab || "details";
    const btn=(k,l)=>`<div class="tab ${tab===k?'active':''}" data-act="contactTab" data-arg="${k}">${l}</div>`;

    const details = `<div class="tabpanel ${tab==='details'?'active':''}">
      <div class="grid cols-4" style="margin-top:12px">
        <div><label>Contact Name</label><input class="input" id="ct-name" value="${c.name||''}"></div>
        <div><label>Email</label><input class="input" id="ct-email" value="${c.email||''}"></div>
        <div><label>Phone</label><input class="input" id="ct-phone" value="${c.phone||''}"></div>
        <div><label>Position/Org</label><input class="input" id="ct-org" value="${c.org||''}"></div>
        <div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">${coOpts()}</select></div>
        <div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">${c.notes||''}</textarea></div>
      </div>
    </div>`;

    const portal = `<div class="tabpanel ${tab==='portal'?'active':''}">
      <div class="card"><div class="grid cols-4">
        <div><label>Status</label><div class="badge" style="background:${c.portal.enabled?'#059669':'#d1d5db'}">${c.portal.enabled?'Enabled':'Disabled'}</div></div>
        <div><label>Role</label><select class="input" id="ct-role">
          ${["Investigator","Reviewer","Admin"].map(r=>`<option${c.portal.role===r?' selected':''}>${r}</option>`).join("")}
        </select></div>
        <div class="right" style="grid-column:span 4;margin-top:8px">
          <button class="btn light" data-act="viewPortal" data-arg="${id}">View portal</button>
          <button class="btn light" data-act="updateRole" data-arg="${id}">Update Role</button>
          <button class="btn light" data-act="revokePortal" data-arg="${id}">Revoke</button>
        </div>
      </div></div>
    </div>`;

    const tabs = `<div class="tabs">${btn("details","Details")}${btn("portal","Portal")}</div>`;
    return Shell(header+`<div class="card">${tabs+details+portal}</div>`,"contacts");
  }

  // ---------- Companies ----------
  function Companies(){
    const rows=DATA.companies.map(co=>{
      const cntContacts=DATA.contacts.filter(c=>c.companyId===co.id).length;
      const cntCases=DATA.cases.filter(c=>c.companyId===co.id).length;
      return `<tr><td>${co.id}</td><td>${co.name}</td><td>${cntContacts}</td><td>${cntCases}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`;
    }).join("");
    return Shell(`<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header>
      <table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,"companies");
  }

  function CompanyPage(id){
    const co=findCompany(id);
    if(!co){ alert("Company not found"); App.set({route:"companies"}); return Shell(`<div class="card">Company not found.</div>`,"companies"); }
    co.folders = co.folders || {General:[]};

    const header = `<div class="card"><div style="display:flex;align-items:center;gap:10px">
      <div class="avatar">${(co.name||'?').slice(0,1)}</div>
      <div><h2 style="margin:0">${co.name||''}</h2><div class="mono">${co.phone||''} · ${co.email||''}</div></div>
      <div class="sp"></div>
      <button class="btn" data-act="editCompany" data-arg="${id}">Edit</button>
      <button class="btn danger" data-act="deleteCompany" data-arg="${id}">Delete</button>
      <button class="btn light" data-act="route" data-arg="companies">Back</button>
    </div></div>`;

    const profile = `<div class="card profile"><h3>About this company</h3>
      <div class="kvs">
        <div class="k">Industry</div><div>${co.industry||''}</div>
        <div class="k">Type</div><div>${co.type||''}</div>
        <div class="k">State</div><div>${co.state||''}</div>
        <div class="k">City</div><div>${co.city||''}</div>
        <div class="k">Postcode</div><div>${co.postcode||''}</div>
        <div class="k">ABN</div><div>${co.abn||''}</div>
        <div class="k">ACN</div><div>${co.acn||''}</div>
        <div class="k">Website</div><div>${co.website||''}</div>
      </div>
    </div>`;

    // Tabs
    const tab=App.state.companyTab||"summary";
    const btn=(k,l)=>`<div class="tab ${tab===k?'active':''}" data-act="companyTab" data-arg="${k}">${l}</div>`;

    // Summary
    const recent=DATA.cases.filter(c=>c.companyId===co.id).slice(0,6);
    const summary = `<div class="tabpanel ${tab==='summary'?'active':''}">
      <div class="card"><h3 class="section-title">Recent Cases</h3>
        ${recent.length?`<table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${recent.map(c=>`<tr><td>${c.fileNumber}</td><td>${c.title}</td><td>${c.status}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("")}</tbody></table>`:`<div class="muted">No cases for this company.</div>`}
      </div>
    </div>`;

    // Company Contacts
    const companyContacts=DATA.contacts.filter(c=>c.companyId===co.id);
    const cRows = companyContacts.length? companyContacts.map(cc=>{
      const mail = cc.email?`<a class="icon-mail" href="mailto:${cc.email}" title="Email ${cc.name}">✉</a>`:"";
      return `<tr><td>${cc.name}</td><td>${cc.email||''}</td><td>${cc.phone||''}</td><td>${cc.org||''}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${cc.id}">Open</button> ${mail}</td></tr>`;
    }).join("") : `<tr><td colspan="5" class="muted">No contacts yet.</td></tr>`;
    const contactTab = `<div class="tabpanel ${tab==='contacts'?'active':''}">
      <div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 class="section-title">Company Contacts</h3><div class="sp"></div><button class="btn" data-act="addCompanyContact" data-arg="${id}">Add contact</button></div>
      <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position/Org</th><th></th></tr></thead><tbody>${cRows}</tbody></table></div>
    </div>`;

    // Company Documents
    let docRows="";
    for(const fname in co.folders){
      if(!Object.prototype.hasOwnProperty.call(co.folders,fname)) continue;
      const files=co.folders[fname];
      docRows+=`<tr><th colspan="3">${fname}</th></tr>`;
      docRows+=`<tr><td colspan="3" class="right">
        <button class="btn light" data-act="coSelectFiles" data-arg="${id}::${fname}">Upload to ${fname}</button>
        ${fname==='General'?'':`<button class="btn light" data-act="coDeleteFolder" data-arg="${id}::${fname}">Delete folder</button>`}
      </td></tr>`;
      if(!files.length) docRows+=`<tr><td colspan="3" class="muted">No files</td></tr>`;
      for(const ff of files){
        const a=`${id}::${fname}::${ff.name}`;
        docRows+=`<tr><td>${ff.name}</td><td>${ff.size}</td><td class="right">
          ${ff.dataUrl?`<button class="btn light" data-act="coViewDoc" data-arg="${a}">View</button>`:""}
          <button class="btn light" data-act="coRemoveDoc" data-arg="${a}">Remove</button></td></tr>`;
      }
    }
    const docsTab = `<div class="tabpanel ${tab==='docs'?'active':''}">
      <div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 class="section-title">Company Documents</h3><div class="sp"></div>
      <button class="btn light" data-act="coAddFolderPrompt" data-arg="${id}">Add folder</button></div>
      <input type="file" id="co-file-input" multiple style="display:none">
      <table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${docRows}</tbody></table></div>
    </div>`;

    const right = `<div><div class="tabs">${btn("summary","Summary")}${btn("contacts","Company Contacts")}${btn("docs","Company Documents")}</div>${summary}${contactTab}${docsTab}</div>`;
    return Shell(header+`<div class="page-wrap">${profile}${right}</div>`,"companies");
  }

  // ---------- Admin/Resources placeholders ----------
  const Admin=()=> Shell(`<div class="card">Admin</div>`,"admin");
  const Resources=()=> Shell(`<div class="card">Resources (coming soon)</div>`,"resources");

  // ---------- Render ----------
  function render(){
    const r=App.state.route;
    const el=$("#app");
    $("#boot").textContent="Rendering "+r+"…";
    if(r==="dashboard") el.innerHTML=Dashboard();
    else if(r==="cases") el.innerHTML=Cases();
    else if(r==="case") el.innerHTML=CasePage(App.state.currentCaseId);
    else if(r==="contacts") el.innerHTML=Contacts();
    else if(r==="contact") el.innerHTML=ContactPage(App.state.currentContactId);
    else if(r==="companies") el.innerHTML=Companies();
    else if(r==="company") el.innerHTML=CompanyPage(App.state.currentCompanyId);
    else if(r==="resources") el.innerHTML=Resources();
    else if(r==="admin") el.innerHTML=Admin();
    else el.innerHTML=Dashboard();
    $("#boot").textContent="Ready ("+BUILD+")";
  }

  // ---------- Actions ----------
  document.addEventListener("click", e=>{
    let t=e.target;
    while(t && t!==document && !t.getAttribute("data-act")) t=t.parentNode;
    if(!t || t===document) return;
    const act=t.getAttribute("data-act");
    const arg=t.getAttribute("data-arg");

    // routing
    if(act==="route"){ App.set({route:arg}); return; }
    if(act==="openCase"){ App.set({currentCaseId:arg,caseTab:"details",route:"case"}); return; }
    if(act==="openContact"){ App.set({currentContactId:arg,contactTab:"details",route:"contact"}); return; }
    if(act==="openCompany"){ App.set({currentCompanyId:arg,companyTab:"summary",route:"company"}); return; }
    if(act==="newCompany"){ const c={id:"C-"+String(DATA.companies.length+1).padStart(3,"0"),name:"New Company",folders:{General:[]}}; DATA.companies.unshift(c); App.set({currentCompanyId:c.id,route:"company"}); return; }
    if(act==="newContact"){ const nc={id:uid(),name:"New Contact",email:"",phone:"",org:"",companyId:"",notes:""}; DATA.contacts.unshift(nc); App.set({currentContactId:nc.id,route:"contact"}); return; }
    if(act==="newCase"){ const seq=String(DATA.cases.length+1).padStart(3,"0"); const inv=DATA.users[0]||{name:"",email:""}; const cs={id:uid(),fileNumber:`INV-${YEAR}-${seq}`,title:"",organisation:"",companyId:"C-001",investigatorEmail:inv.email,investigatorName:inv.name,status:"Planning",priority:"Medium",created:(new Date()).toISOString().slice(0,7),notes:[],tasks:[],folders:{General:[]}}; DATA.cases.unshift(cs); App.set({currentCaseId:cs.id,route:"case"}); return; }

    // tabs
    if(act==="companyTab"){ App.set({companyTab:arg}); return; }
    if(act==="caseTab"){ App.set({caseTab:arg}); return; }
    if(act==="contactTab"){ App.set({contactTab:arg}); return; }

    // company editing
    if(act==="editCompany"){
      const co=findCompany(arg); if(!co) return;
      const f=`<div class="grid cols-2" style="margin-top:8px">
        <div><label>Legal Name</label><input class="input" id="co-name" value="${co.name||''}"></div>
        <div><label>Industry</label><input class="input" id="co-industry" value="${co.industry||''}"></div>
        <div><label>Type</label><input class="input" id="co-type" value="${co.type||''}"></div>
        <div><label>Phone</label><input class="input" id="co-phone" value="${co.phone||''}"></div>
        <div><label>Email</label><input class="input" id="co-email" value="${co.email||''}"></div>
        <div><label>Website</label><input class="input" id="co-website" value="${co.website||''}"></div>
        <div><label>ABN</label><input class="input" id="co-abn" value="${co.abn||''}"></div>
        <div><label>ACN</label><input class="input" id="co-acn" value="${co.acn||''}"></div>
        <div><label>State</label><input class="input" id="co-state" value="${co.state||''}"></div>
        <div><label>City</label><input class="input" id="co-city" value="${co.city||''}"></div>
        <div><label>Postcode</label><input class="input" id="co-postcode" value="${co.postcode||''}"></div>
      </div>`;
      const wrap=document.createElement("div");
      wrap.innerHTML=`<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Edit Company</h3><div class="sp"></div><button class="btn light" data-act="__closeDlg">Close</button></div>${f}<div class="right" style="margin-top:8px"><button class="btn" data-act="saveCompany" data-arg="${arg}">Save</button></div></div>`;
      Object.assign(wrap.style,{position:"fixed",inset:"0",background:"rgba(15,23,42,.45)",display:"grid",placeItems:"center",padding:"20px"});
      wrap.id="dlg"; document.body.appendChild(wrap); return;
    }
    if(act==="__closeDlg"){ const dlg=$("#dlg"); if(dlg) dlg.remove(); return; }
    if(act==="saveCompany"){
      const co=findCompany(arg); if(!co) return;
      const v=id=>{const el=$("#"+id); return el?el.value:"";};
      co.name=v("co-name"); co.industry=v("co-industry"); co.type=v("co-type"); co.phone=v("co-phone"); co.email=v("co-email"); co.website=v("co-website"); co.abn=v("co-abn"); co.acn=v("co-acn"); co.state=v("co-state"); co.city=v("co-city"); co.postcode=v("co-postcode");
      const dlg=$("#dlg"); if(dlg) dlg.remove(); App.set({}); return;
    }
    if(act==="deleteCompany"){ const co=findCompany(arg); if(!co) return; if(confirm("Delete company "+(co.name||co.id)+"?")){ DATA.companies=DATA.companies.filter(x=>x.id!==co.id); App.set({route:"companies"}); } return; }
    if(act==="addCompanyContact"){ const nc={id:uid(),name:"New Contact",email:"",phone:"",org:"",companyId:arg,notes:""}; DATA.contacts.unshift(nc); App.set({currentContactId:nc.id,route:"contact"}); return; }

    // company docs
    if(act==="coAddFolderPrompt"){ const co=findCompany(arg); if(!co) return; const name=prompt("New folder name"); if(!name) return; co.folders[name]=co.folders[name]||[]; App.set({companyTab:"docs"}); return; }
    if(act==="coSelectFiles"){ App.state.currentCompanyUploadTarget = arg || ((App.state.currentCompanyId||'')+"::General"); const fi=$("#co-file-input"); if(fi) fi.click(); return; }
    if(act==="coViewDoc"){ const p=arg.split("::"); const co=findCompany(p[0]); if(!co) return; const list=co.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,"_blank"); return; }
    if(act==="coRemoveDoc"){ const p=arg.split("::"); const co=findCompany(p[0]); if(!co) return; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({companyTab:"docs"}); return; }
    if(act==="coDeleteFolder"){ const p=arg.split("::"); const co=findCompany(p[0]); if(!co) return; const folder=p[1]; if(folder==="General"){ alert("Cannot delete General"); return; } if(confirm(`Delete folder ${folder} and its files?`)){ delete co.folders[folder]; App.set({companyTab:"docs"}); } return; }

    // case save/delete
    if(act==="saveCase"){
      const cs=findCase(arg); if(!cs) return;
      const v=id=>{const el=$("#"+id); return el?el.value:null;};
      const set=(k,val)=>{ if(val!=null) cs[k]=val; };
      set("title",v("c-title"));
      set("organisation",v("c-org"));
      const coVal=v("c-company"); if(coVal!=null) cs.companyId=coVal;
      const invEmail=v("c-inv"); if(invEmail!=null){ cs.investigatorEmail=invEmail; const u=DATA.users.find(x=>x.email===invEmail)||null; cs.investigatorName=u?u.name:"";}
      set("status",v("c-status")); set("priority",v("c-priority"));
      const idEl=$("#c-id"); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim();
      alert("Case saved"); return;
    }
    if(act==="deleteCase"){ const cs=findCase(arg); if(!cs){ alert("Case not found"); return; } if(confirm(`Delete this case (${cs.fileNumber||cs.title||cs.id}) ?`)){ DATA.cases=DATA.cases.filter(c=>c.id!==cs.id); App.set({route:"cases",currentCaseId:null}); } return; }

    // case notes/tasks
    if(act==="addNote"){ const cs=findCase(arg); if(!cs) return; const text=$("#note-text").value; if(!text){ alert("Enter a note"); return; } const stamp=(new Date().toISOString().replace("T"," ").slice(0,16)); const me=(DATA.me&&DATA.me.email)||"admin@synergy.com"; cs.notes.unshift({time:stamp,by:me,text}); App.set({}); return; }
    if(act==="addStdTasks"){ const cs=findCase(arg); if(!cs) return; const base=cs.tasks; ["Gather documents","Interview complainant","Interview respondent","Write report"].forEach(a=>base.push({id:"T-"+(base.length+1),title:a,assignee:cs.investigatorName||"",due:"",status:"Open"})); App.set({}); return; }
    if(act==="addTask"){ const cs=findCase(arg); if(!cs) return; const who=$("#task-assignee").selectedOptions[0].text; cs.tasks.push({id:"T-"+(cs.tasks.length+1),title:$("#task-title").value,assignee:who,due:$("#task-due").value,status:"Open"}); App.set({}); return; }

    // case docs
    if(act==="addFolderPrompt"){ const cs=findCase(arg); if(!cs) return; const name=prompt("New folder name"); if(!name) return; cs.folders[name]=cs.folders[name]||[]; App.set({caseTab:"docs"}); return; }
    if(act==="selectFiles"){ App.state.currentUploadTarget = arg || ((App.state.currentCaseId||'')+"::General"); const fi=$("#case-file-any"); if(fi) fi.click(); return; }
    if(act==="viewDoc"){ const p=arg.split("::"); const cs=findCase(p[0]); if(!cs) return; const list=cs.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,"_blank"); return; }
    if(act==="removeDoc"){ const p=arg.split("::"); const cs=findCase(p[0]); if(!cs) return; cs.folders[p[1]]=(cs.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({caseTab:"docs"}); return; }
    if(act==="deleteFolder"){ const p=arg.split("::"); const cs=findCase(p[0]); if(!cs) return; const folder=p[1]; if(folder==="General"){ alert("Cannot delete General"); return; } if(confirm(`Delete folder ${folder} and its files?`)){ delete cs.folders[folder]; App.set({caseTab:"docs"}); } return; }

    // contacts portal
    if(act==="viewPortal"){ alert("Portal preview not implemented in demo"); return; }
    if(act==="updateRole"){ const c=findContact(arg); if(!c) return; const el=$("#ct-role"); if(el){ c.portal=c.portal||{}; c.portal.role=el.value; alert("Role updated to "+c.portal.role); } return; }
    if(act==="revokePortal"){ const c=findContact(arg); if(!c) return; c.portal=c.portal||{}; c.portal.enabled=false; alert("Portal access revoked"); App.set({}); return; }

    // filters
    if(act==="resetCaseFilters"){ App.state.casesFilter={q:""}; try{localStorage.removeItem("synergy_filters_cases_v2130");}catch(_){ } App.set({}); return; }
  });

  // ---------- Upload handlers ----------
  function readFiles(fileList, pushFn, done){
    const files=Array.from(fileList||[]);
    if(!files.length){ if(done) done(); return; }
    let i=0;
    function next(){
      if(i>=files.length){ if(done) done(); return; }
      const f=files[i++];
      const r=new FileReader();
      r.onload=ev=>{ pushFn({name:f.name,size:f.size,dataUrl:ev.target.result}); next(); };
      r.readAsDataURL(f);
    }
    next();
  }

  document.addEventListener("change", e=>{
    const t=e.target;
    if(!t) return;
    if(t.id==="flt-q"){ const f=App.state.casesFilter||{q:""}; f.q=t.value; App.state.casesFilter=f; try{localStorage.setItem("synergy_filters_cases_v2130", JSON.stringify(f));}catch(_){ } App.set({}); }
    if(t.id==="case-file-any"){ const p=(App.state.currentUploadTarget||"").split("::"); const cs=findCase(p[0]); if(!cs) return; const folder=p[1]||"General"; cs.folders[folder]=cs.folders[folder]||[]; readFiles(t.files,(obj)=>cs.folders[folder].push(obj),()=>App.set({caseTab:"docs"})); t.value=""; }
    if(t.id==="co-file-input"){ const p=(App.state.currentCompanyUploadTarget||"").split("::"); const co=findCompany(p[0]); if(!co) return; const folder=p[1]||"General"; co.folders[folder]=co.folders[folder]||[]; readFiles(t.files,(obj)=>co.folders[folder].push(obj),()=>App.set({companyTab:"docs"})); t.value=""; }
  });

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", ()=>{
    try{
      const f=localStorage.getItem("synergy_filters_cases_v2130");
      if(f) App.state.casesFilter=JSON.parse(f)||App.state.casesFilter;
    }catch(_){}
    App.set({route:"companies"});
  });
})();  
