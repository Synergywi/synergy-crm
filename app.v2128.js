(function(){ "use strict";
const BUILD="baseline-1.0.0"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM PRO "+BUILD+" • "+STAMP);

/* utils */
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function esc(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;","—":"—",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]||m)); }
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

/* seed */
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",
    investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),
    relatedContactIds:[],notes:[],tasks:[],folders:{General:[]}};
  Object.assign(b,p||{}); return b;
}
const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Private",state:"QLD",city:"Brisbane",postcode:"4000",abn:"12 345 678 901",acn:"345 678 901",website:"www.sunrisemining.com",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Public",state:"VIC",city:"Melbourne",postcode:"3000",abn:"98 765 432 100",acn:"—",website:"www.melbourne.vic.gov.au",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Healthcare",type:"Public",state:"QLD",city:"Brisbane",postcode:"4006",abn:"76 543 210 999",acn:"—",website:"www.health.qld.gov.au",folders:{General:[]}},
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",role:"Investigator",phone:"07 345 5678",notes:"Investigator for Sunrise."},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",role:"Investigator",phone:"07 987 1123",notes:"Senior investigator."},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",role:"Reviewer",phone:"03 675 9922",notes:"Reviewer for CoM cases."}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  resources:{
    links:[{title:"Investigation Framework", url:"#"}, {title:"HR Policy", url:"#"}],
    faqs:[{q:"How to open a case?", a:"Go to Cases → New."},{q:"Where are templates?", a:"Documents tab."}],
    guides:["Interview best practices.pdf","Case lifecycle.png"]
  },
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

/* finders */
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

/* app */
const App={state:{route:"dashboard",currentCaseId:null,currentCompanyId:null,currentContactId:null,
  tabs:{dashboard:"overview",cases:"list",contacts:"list",companies:"list",company:"summary",documents:"templates",resources:"links",admin:"users",case:"details",contact:"profile"},
  settings:{emailAlerts:true, darkMode:false}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

/* ui helpers */
function Topbar(){ const me=(DATA.me||{}); const back=(me.role!=="Admin"?'<button class="btn light" data-act="clearImpersonation">Switch to Admin</button>':""); return `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><div class="muted" style="margin-right:10px">You: ${me.name||"Unknown"} (${me.role||"User"})</div>${back}<span class="badge">Soft Stable ${BUILD}</span></div>`; }
function Sidebar(active){
  const items=[["dashboard","Dashboard"],["calendar","Calendar"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">${items.map(([k,v])=>`<li ${active===k?'class="active"':''} data-act="route" data-arg="${k}">${v}</li>`).join("")}</ul></aside>`;
}
function Shell(content,active){ return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`; }
function statusChip(status){
  const key=(status||"").toLowerCase().replace(/\s+/g,'-');
  const cls={"planning":"status-planning","investigation":"status-investigation","evidence-review":"status-evidence-review","reporting":"status-reporting","closed":"status-closed"}[key]||"status-planning";
  return `<span class="chip ${cls}"><i></i>${status||''}</span>`;
}
function Tabs(scope, items){
  const cur=App.state.tabs[scope]||items[0][0];
  const btn=(k,l)=>`<div class="tab ${cur===k?'active':''}" data-act="tab" data-scope="${scope}" data-arg="${k}">${l}</div>`;
  return `<div class="tabs">${items.map(i=>btn(i[0],i[1])).join("")}</div>`;
}

/* pages */
function Dashboard(){
  const tab=App.state.tabs.dashboard;
  const rows=DATA.cases.slice(0,6).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const overview=`<div class="card"><h3>Welcome</h3><div class="muted">${STAMP}</div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const week=`<div class="card"><h3>This Week</h3><div class="muted">New cases: ${DATA.cases.filter(c=>c.created.startsWith(String(YEAR)+"-")).length}</div></div>`;
  return Shell(Tabs('dashboard',[['overview','Overview'],['week','This Week']]) + (tab==='overview'?overview:week), 'dashboard');
}

function Cases(){
  const tab=App.state.tabs.cases, f=App.state.casesFilter||{q:""};
  const list=DATA.cases.filter(c=>{ const q=(f.q||"").toLowerCase(); if(!q) return true; return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q); });
  const rows=list.map(cc=>`<tr><td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td>${statusChip(cc.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td></tr>`).join("");
  const tools=`<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="${f.q||''}"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>`;
  const listView = `<div class="section"><header><h3 class="section-title">Cases</h3></header>${tools}<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const newView = `<div class="card"><h3>Create Case</h3><div class="grid cols-2">
    <div><label>Title</label><input class="input" id="nc-title"></div>
    <div><label>Organisation (display)</label><input class="input" id="nc-org"></div>
    <div><label>Investigator</label><select class="input" id="nc-inv">${DATA.users.map(u=>`<option value="${u.email}">${u.name} (${u.role})</option>`).join("")}</select></div>
    <div><label>Company</label><select class="input" id="nc-company">${DATA.companies.map(co=>`<option value="${co.id}">${co.name}</option>`).join("")}</select></div>
  </div><div class="right" style="margin-top:8px"><button class="btn" data-act="createCase">Create</button></div></div>`;
  return Shell(Tabs('cases',[['list','List'],['new','New Case']]) + (tab==='list'?listView:newView), 'cases');
}

function CasePage(id){
  const cs=findCase(id); if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const tab=App.state.tabs.case||'details';
  const invOpts=()=>DATA.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>`<option ${u.email===cs.investigatorEmail?'selected':''} value="${u.email}">${u.name} (${u.role})</option>`).join("");
  const coOpts=()=>DATA.companies.map(co=>`<option ${co.id===cs.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");

  const details = `<div class="card"><h3 class="section-title">Details</h3><div class="grid cols-2">
    <div><label>Case ID</label><input class="input" id="c-id" value="${cs.fileNumber||''}"></div>
    <div><label>Organisation (display)</label><input class="input" id="c-org" value="${cs.organisation||''}"></div>
    <div><label>Title</label><input class="input" id="c-title" value="${cs.title||''}"></div>
    <div><label>Company</label><select class="input" id="c-company">${coOpts()}</select></div>
    <div><label>Investigator</label><select class="input" id="c-inv">${invOpts()}</select></div>
    <div><label>Status</label><select class="input" id="c-status">
      <option${cs.status==='Planning'?' selected':''}>Planning</option>
      <option${cs.status==='Investigation'?' selected':''}>Investigation</option>
      <option${cs.status==='Evidence Review'?' selected':''}>Evidence Review</option>
      <option${cs.status==='Reporting'?' selected':''}>Reporting</option>
      <option${cs.status==='Closed'?' selected':''}>Closed</option>
    </select></div>
    <div><label>Priority</label><select class="input" id="c-priority">
      <option${cs.priority==='Low'?' selected':''}>Low</option>
      <option${cs.priority==='Medium'?' selected':''}>Medium</option>
      <option${cs.priority==='High'?' selected':''}>High</option>
      <option${cs.priority==='Critical'?' selected':''}>Critical</option>
    </select></div>
  </div><div class="right" style="margin-top:8px"><button class="btn" data-act="saveCase" data-arg="${id}">Save Case</button> <button class="btn danger" data-act="deleteCase" data-arg="${id}">Delete Case</button> <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>`;

  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
  for(const nn of (cs.notes||[])){ notesRows+=`<tr><td>${nn.time||''}</td><td>${nn.by||''}</td><td>${esc(nn.text||'')}</td></tr>`; }
  const notes = `<div class="card"><h3 class="section-title">Notes</h3>
    <textarea class="input" id="note-text" placeholder="Type your note here"></textarea>
    <div class="right" style="margin-top:6px"><button class="btn light" data-act="addNote" data-arg="${id}">Add Note</button></div>
    <table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">${notesRows}</tbody></table>
  </div>`;

  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  for(const tt of (cs.tasks||[])){ taskRows+=`<tr><td>${tt.id}</td><td>${esc(tt.title||'')}</td><td>${tt.assignee||''}</td><td>${tt.due||''}</td><td>${tt.status||''}</td></tr>`; }
  const tasks = `<div class="card"><h3 class="section-title">Tasks</h3>
      <div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">${invOpts()}</select></div>
      <div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="${id}">Add</button> <button class="btn light" data-act="addStdTasks" data-arg="${id}">Add standard tasks</button></div>
      <table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${taskRows}</tbody></table>
  </div>`;

  const people = (()=>{
    const allCoContacts=DATA.contacts.filter(x=>x.companyId===cs.companyId);
    const opts=allCoContacts.map(p=>`<option value="${p.id}">${p.name} — ${p.email}</option>`).join("");
    const rows=(cs.relatedContactIds||[]).map(id=>{ const p=findContact(id)||{}; return `<tr><td>${p.name||''}</td><td>${p.email||''}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${id}">Open</button> <button class="btn light" data-act="viewPortal" data-arg="${id}">View Portal</button> <button class="btn light" data-act="unlinkContact" data-arg="${cs.id}::${id}">Remove</button></td></tr>`; }).join("") || '<tr><td colspan="3" class="muted">No related contacts yet.</td></tr>';
    return `<div class="card"><h3 class="section-title">People</h3>
      <div class="grid cols-3"><select class="input" id="rel-contact">${opts}</select><div></div><div class="right"><button class="btn light" data-act="linkContact" data-arg="${cs.id}">Link to case</button></div></div>
      <table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    </div>`;
  })();

  let docRows='';
  for(const fname in cs.folders){
    if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const documents = '<div class="card"><h3 class="section-title">Documents</h3><div class="right" style="margin-bottom:6px"><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div><input type="file" id="file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';

  const tabs = Tabs('case',[['details','Details'],['notes','Notes'],['tasks','Tasks'],['documents','Documents'],['people','People'],['calendar','Calendar']]);
  
  const caseCal = (()=>{
    const list=(DATA.calendar||[]).filter(e=>e.caseId===id).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    const rows=list.map(e=>`<tr>
        <td>${new Date(e.startISO).toLocaleDateString()}</td>
        <td>${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${new Date(e.endISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
        <td>${esc(e.title)}</td>
        <td>${esc(e.location||'')}</td>
        <td>${esc(e.ownerName||e.ownerEmail||'')}</td>
        <td class="right"><button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button></td>
      </tr>`).join("") || `<tr><td colspan="6" class="muted">No events yet.</td></tr>`;
    const ownerSelect = ((DATA.me||{}).role||'')==='Admin' ? `<div><label>Owner</label><select class="input" id="ce-owner">${(DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===(DATA.me||{}).email?'selected':'')}>${u.name}</option>`).join("")}</select></div>` : "";
    return `<div class="card"><h3 class="section-title">Case Calendar</h3>
      <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <div class="card"><h3 class="section-title">Add case event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="ce-title"></div>
        <div><label>Date</label><input class="input" id="ce-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div><label>Type</label><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="ce-start" type="time" value="10:00"></div>
        <div><label>End</label><input class="input" id="ce-end" type="time" value="11:00"></div>
        <div><label>Location</label><input class="input" id="ce-loc"></div>
        ${ownerSelect}
      </div>
      <div class="right" style="margin-top:8px"><button class="btn" data-act="createCaseEvent" data-arg="${id}">Add</button></div>
    </div>`;
  })();
const body = `<div class="tabpanel ${tab==='details'?'active':''}">${details}</div>
                <div class="tabpanel ${tab==='notes'?'active':''}">${notes}</div>
                <div class="tabpanel ${tab==='tasks'?'active':''}">${tasks}</div>
                <div class="tabpanel ${tab==='documents'?'active':''}">${documents}</div>
                <div class="tabpanel ${tab==='people'?'active':''}">${people}</div>
                <div class="tabpanel ${tab==='calendar'?'active':''}">${caseCal}</div>`;
  return Shell(`<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case ${cs.fileNumber}</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>` + tabs + body, 'cases');
}

function Contacts(){
  const tab=App.state.tabs.contacts;
  const listRows=DATA.contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email}</td><td>${(findCompany(c.companyId)||{}).name||''}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button> <button class="btn light" data-act="viewPortal" data-arg="${c.id}">View Portal</button></td></tr>`).join("");
  const listView = `<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>${listRows}</tbody></table></div>`;
  const newView  = `<div class="card"><h3>Create Contact</h3><div class="grid cols-2">
    <div><label>Name</label><input class="input" id="ncx-name"></div>
    <div><label>Email</label><input class="input" id="ncx-email"></div>
    <div><label>Role</label><input class="input" id="ncx-role" placeholder="Investigator/Reviewer/etc"></div>
    <div><label>Phone</label><input class="input" id="ncx-phone"></div>
    <div><label>Company</label><select class="input" id="ncx-company">${DATA.companies.map(co=>`<option value="${co.id}">${co.name}</option>`).join("")}</select></div>
    <div><label>Notes</label><textarea class="input" id="ncx-notes"></textarea></div>
  </div><div class="right" style="margin-top:8px"><button class="btn" data-act="createContact">Create</button></div></div>`;
  return Shell(Tabs('contacts',[['list','List'],['new','New Contact']]) + (tab==='list'?listView:newView), 'contacts');
}

function ContactPage(id){
  const c=findContact(id)||{id:uid(),name:"",email:"",companyId:"C-001",role:"",phone:"",notes:""};
  const tab=App.state.tabs.contact||'profile';
  const coOpts=()=>DATA.companies.map(co=>`<option ${co.id===c.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");
  const profile = `<div class="card"><h3 class="section-title">Profile</h3><div class="grid cols-2">
    <div><label>Name</label><input class="input" id="ct-name" value="${c.name||''}"></div>
    <div><label>Email</label><input class="input" id="ct-email" value="${c.email||''}"></div>
    <div><label>Company</label><select class="input" id="ct-company">${coOpts()}</select></div>
    <div><label>Role</label><input class="input" id="ct-role" value="${c.role||''}"></div>
    <div><label>Phone</label><input class="input" id="ct-phone" value="${c.phone||''}"></div>
    <div><label>Notes</label><textarea class="input" id="ct-notes">${esc(c.notes||'')}</textarea></div>
  </div><div class="right" style="margin-top:8px"><button class="btn" data-act="saveContact" data-arg="${c.id}">Save Contact</button> <button class="btn light" data-act="route" data-arg="contacts">Back</button></div></div>`;

  const portal = `<div class="card"><h3 class="section-title">Portal</h3><div class="muted">Read-only portal preview for ${esc(c.name||'')}</div>
    <div class="grid cols-2"><div><strong>Email:</strong> ${esc(c.email||'')}</div><div><strong>Company:</strong> ${(findCompany(c.companyId)||{}).name||''}</div><div><strong>Role:</strong> ${esc(c.role||'')}</div><div><strong>Phone:</strong> ${esc(c.phone||'')}</div></div>
  </div>`;

  const relatedCases=DATA.cases.filter(cs=>cs.companyId===c.companyId || (cs.relatedContactIds||[]).includes(c.id));
  const rcRows=relatedCases.map(cs=>`<tr><td>${cs.fileNumber}</td><td>${cs.title}</td><td>${statusChip(cs.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cs.id}">Open</button></td></tr>`).join("") || '<tr><td colspan="4" class="muted">No related cases.</td></tr>';
  const casesTab = `<div class="card"><h3 class="section-title">Related Cases</h3><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${rcRows}</tbody></table></div>`;

  const tabs = Tabs('contact',[['profile','Profile'],['portal','Portal'],['cases','Cases']]);
  const body = `<div class="tabpanel ${tab==='profile'?'active':''}">${profile}</div><div class="tabpanel ${tab==='portal'?'active':''}">${portal}</div><div class="tabpanel ${tab==='cases'?'active':''}">${casesTab}</div>`;
  return Shell(`<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div></div></div>` + tabs + body,'contacts');
}

function Companies(){
  const tab=App.state.tabs.companies;
  const rows=DATA.companies.map(co=>`<tr><td>${co.id}</td><td>${co.name}</td><td>${DATA.contacts.filter(x=>x.companyId===co.id).length}</td><td>${DATA.cases.filter(x=>x.companyId===co.id).length}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`).join("");
  const listView=`<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  const newView = `<div class="card"><h3>Create Company</h3><div class="grid cols-2">
    <div><label>Name</label><input class="input" id="nco-name"></div>
    <div><label>Industry</label><input class="input" id="nco-industry"></div>
    <div><label>Type</label><input class="input" id="nco-type" placeholder="Public/Private"></div>
    <div><label>State</label><input class="input" id="nco-state"></div>
    <div><label>City</label><input class="input" id="nco-city"></div>
    <div><label>Postcode</label><input class="input" id="nco-postcode"></div>
    <div><label>ABN</label><input class="input" id="nco-abn"></div>
    <div><label>ACN</label><input class="input" id="nco-acn"></div>
    <div><label>Website</label><input class="input" id="nco-website"></div>
  </div><div class="right" style="margin-top:8px"><button class="btn" data-act="createCompany">Create</button></div></div>`;
  return Shell(Tabs('companies',[['list','List'],['new','New Company']]) + (tab==='list'?listView:newView), 'companies');
}

function CompanyPage(id){
  const co=findCompany(id); if(!co){ alert('Company not found'); App.set({route:'companies'}); return Shell('<div class="card">Company not found.</div>','companies'); }
  const tab=App.state.tabs.company||'summary';
  const btn=(k,l)=>`<div class="tab ${tab===k?'active':''}" data-act="tab" data-scope="company" data-arg="${k}">${l}</div>`;
  const header = `<div class="card"><div style="display:flex;align-items:center;gap:10px"><div class="avatar">${(co.name||'')[0]||'?'}</div><div style="font-size:18px;font-weight:700">${co.name||''}</div><div class="sp"></div><button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>`;
  const about = `<div class="card"><h3 class="section-title">About this company</h3>
    <div class="grid cols-2" style="margin-top:8px">
      <div class="profile"><div class="kvs" style="display:grid;grid-template-columns:140px 1fr;gap:6px;font-size:13px">
        <div class="k">ID</div><div>${co.id}</div><div class="k">Industry</div><div>${co.industry||'—'}</div>
        <div class="k">Type</div><div>${co.type||'—'}</div><div class="k">State</div><div>${co.state||'—'}</div>
        <div class="k">City</div><div>${co.city||'—'}</div><div class="k">Postcode</div><div>${co.postcode||'—'}</div>
        <div class="k">ABN</div><div>${co.abn||'—'}</div><div class="k">ACN</div><div>${co.acn||'—'}</div><div class="k">Website</div><div>${co.website||'—'}</div>
      </div></div>
    </div></div>`;

  const rcRows=DATA.cases.filter(c=>c.companyId===co.id).slice(0,5).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.title}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const recent = `<div class="card"><h3 class="section-title">Recent Cases</h3><table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${rcRows||'<tr><td colspan="4" class="muted">No cases.</td></tr>'}</tbody></table></div>`;

  const contRows=DATA.contacts.filter(x=>x.companyId===co.id).map(p=>`<tr><td>${p.name}</td><td>${p.email}</td><td>${p.role||''}</td><td>${p.phone||''}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${p.id}">Open</button> <button class="btn light" data-act="viewPortal" data-arg="${p.id}">View Portal</button></td></tr>`).join("") || '<tr><td colspan="5" class="muted">No contacts.</td></tr>';
  const addInline = `<div class="grid cols-3" style="margin-bottom:6px">
      <input class="input" id="cco-name" placeholder="Name">
      <input class="input" id="cco-email" placeholder="Email">
      <input class="input" id="cco-phone" placeholder="Phone">
    </div><div class="right"><button class="btn light" data-act="createContactForCompany" data-arg="${co.id}">Add Contact</button></div>`;
  const contacts = `<div class="card"><h3 class="section-title">Company Contacts</h3>${addInline}<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th></th></tr></thead><tbody>${contRows}</tbody></table></div>`;

  if(!co.folders) co.folders={General:[]};
  let docRows='';
  for(const fname in co.folders){
    if(!Object.prototype.hasOwnProperty.call(co.folders,fname)) continue; const files=co.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteCompanyFolder" data-arg="'+co.id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=co.id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewCompanyDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeCompanyDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const docs = '<div class="card"><h3 class="section-title">Company Documents</h3><div class="right" style="margin-bottom:6px"><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+co.id+'">Add folder</button> <button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::General">Select files</button></div><input type="file" id="company-file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';

  const tabs = `<div class="tabs">${btn('summary','Summary')}${btn('contacts','Company Contacts')}${btn('documents','Company Documents')}</div>`;
  const body = `<div class="tabpanel ${tab==='summary'?'active':''}">${about}${recent}</div><div class="tabpanel ${tab==='contacts'?'active':''}">${contacts}</div><div class="tabpanel ${tab==='documents'?'active':''}">${docs}</div>`;
  return Shell(header+'<div class="section">'+tabs+body+'</div>', 'companies');
}

function Documents(){
  const tab=App.state.tabs.documents;
  const templates=(DATA.resources.templates||["Case intake form.docx","Interview checklist.pdf","Final report.docx"]).map(n=>`<tr><td>${n}</td><td class="right"><button class="btn light" data-act="downloadTemplate" data-arg="${n}">Download</button></td></tr>`).join("");
  const procedures=(DATA.resources.procedures||["Code of conduct.pdf","Incident workflow.png"]).map(n=>`<tr><td>${n}</td><td class="right"><button class="btn light" data-act="downloadTemplate" data-arg="${n}">Download</button></td></tr>`).join("");
  const templatesView=`<div class="card"><h3 class="section-title">Templates</h3><table><thead><tr><th>File</th><th></th></tr></thead><tbody>${templates}</tbody></table></div>`;
  const proceduresView=`<div class="card"><h3 class="section-title">Procedures</h3><table><thead><tr><th>File</th><th></th></tr></thead><tbody>${procedures}</tbody></table></div>`;
  return Shell(Tabs('documents',[['templates','Templates'],['procedures','Procedures']]) + (tab==='templates'?templatesView:proceduresView), 'documents');
}




function Resources(){
  const tab=App.state.tabs.resources;
  const links = '<div class="card"><h3 class="section-title">Links</h3><div class="grid cols-2">'
    + (DATA.resources.links.map(function(l){ return '<div><a href="'+l.url+'">'+esc(l.title)+'</a></div>'; }).join(''))
    + '</div></div>';
  const faqs = '<div class="card"><h3 class="section-title">FAQs</h3>'
    + (DATA.resources.faqs.map(function(f){ return '<div style="margin:6px 0"><strong>'+esc(f.q)+'</strong><div class="muted">'+esc(f.a)+'</div></div>'; }).join(''))
    + '</div>';
  const guidesList = (DATA.resources.guides||[]).map(function(g){ return '<li>'+esc(String(g))+'</li>'; }).join('');
  const guides = '<div class="card"><h3 class="section-title">Guides</h3><ul>'+guidesList+'</ul></div>';
  const body = (tab==='links'?links:(tab==='faqs'?faqs:guides));
  return Shell(Tabs('resources',[['links','Links'],['faqs','FAQs'],['guides','Guides']]) + body, 'resources');
}


function Admin(){
  const tab=App.state.tabs.admin;
  const users=`<div class="card"><h3 class="section-title">Users</h3><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>${DATA.users.map(u=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td class="right"><button class="btn light" data-act="impersonate" data-arg="${u.email}">Impersonate</button></td></tr>`).join("")}</tbody></table><div class="right" style="margin-top:8px">${(DATA.me&&DATA.me.role!=="Admin")?'<button class="btn light" data-act="clearImpersonation">Revert to Admin</button>':""} <button class="btn" data-act="addUser">Add User</button></div></div>`;
  const s=App.state.settings||{emailAlerts:true,darkMode:false};
  const settings=`<div class="card"><h3 class="section-title">Settings</h3>
    <label><input type="checkbox" id="set-email" ${s.emailAlerts?'checked':''}> Email alerts</label>
    <label><input type="checkbox" id="set-dark" ${s.darkMode?'checked':''}> Dark mode (display only)</label>
    <div style="margin-top:8px" class="right"><button class="btn" data-act="saveSettings">Save Settings</button></div>
  </div>`;
  const audit=`<div class="card"><h3 class="section-title">Audit</h3><div class="muted" id="audit-body">${(App.state.audit||[]).map(a=>`<div>${a}</div>`).join("")||'No events yet.'}</div></div>`;
  return Shell(Tabs('admin',[['users','Users'],['settings','Settings'],['audit','Audit']]) + (tab==='users'?users:tab==='settings'?settings:audit), 'admin');
}

/* render */
function render(){
  const r=App.state.route, el=document.getElementById('app');
  document.getElementById('boot').textContent='Rendering '+r+'…';
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId);
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId);
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else if(r==='admin') el.innerHTML=Admin();
  else if(r==='calendar') el.innerHTML=Calendar();
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}

/* events */
document.addEventListener('click', e=>{
  let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='tab'){ const scope=t.getAttribute('data-scope'); const tabs=Object.assign({},App.state.tabs); tabs[scope]=arg; App.set({tabs}); return; }

  if(act==='openCase'){ App.set({currentCaseId:arg,route:'case'}); return; }
  if(act==='newCase'){ App.state.tabs.cases='new'; App.set({}); return; }
  if(act==='createCase'){
    const title=document.getElementById('nc-title').value||'New case';
    const org=document.getElementById('nc-org').value||'';
    const invEmail=document.getElementById('nc-inv').value; const inv=DATA.users.find(u=>u.email===invEmail)||{name:'',email:''};
    const company=document.getElementById('nc-company').value||'C-001';
    const seq=('00'+(DATA.cases.length+1)).slice(-3);
    const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title,organisation:org,companyId:company,investigatorEmail:invEmail,investigatorName:inv.name,status:'Planning',priority:'Medium',created:(new Date()).toISOString().slice(0,7),relatedContactIds:[],notes:[],tasks:[],folders:{General:[]}};
    DATA.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'}); return;
  }
  if(act==='saveCase'){
    const cs=findCase(arg); if(!cs) return;
    const getV=id=>{const el=document.getElementById(id); return el?el.value:null;};
    const setIf=(k,v)=>{ if(v!=null) cs[k]=v; };
    setIf('title',getV('c-title')); setIf('organisation',getV('c-org'));
    const coVal=getV('c-company'); if(coVal!=null) cs.companyId=coVal;
    const invEmail=getV('c-inv'); if(invEmail!=null){ cs.investigatorEmail=invEmail; const u=DATA.users.find(x=>x.email===invEmail)||null; cs.investigatorName=u?u.name:''; }
    setIf('status',getV('c-status')); setIf('priority',getV('c-priority'));
    const idEl=document.getElementById('c-id'); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim();
    alert('Case saved'); return;
  }
  if(act==='deleteCase'){ const cs=findCase(arg); if(!cs){alert('Case not found'); return;} if(confirm('Delete '+(cs.fileNumber||cs.title)+' ?')){ DATA.cases=DATA.cases.filter(x=>x.id!==cs.id); App.set({route:'cases'});} return; }
  if(act==='addNote'){ const cs=findCase(arg); if(!cs) return; const text=document.getElementById('note-text').value; if(!text){alert('Enter a note');return;} const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes.unshift({time:stamp,by:me,text}); App.set({}); return; }
  if(act==='addStdTasks'){ const cs=findCase(arg); if(!cs) return; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(a=>cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'})); App.set({}); return; }
  if(act==='addTask'){ const cs=findCase(arg); if(!cs) return; const sel=document.getElementById('task-assignee'); const who=sel?sel.options[sel.selectedIndex].text:''; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,due:document.getElementById('task-due').value,assignee:who,status:'Open'}); App.set({}); return; }

  if(act==='linkContact'){ const cs=findCase(arg); if(!cs) return; const sel=document.getElementById('rel-contact'); const id=sel?sel.value:null; if(!id) return; cs.relatedContactIds=Array.from(new Set([...(cs.relatedContactIds||[]), id])); App.set({}); return; }
  if(act==='unlinkContact'){ const [cid,pid]=arg.split('::'); const cs=findCase(cid); if(!cs) return; cs.relatedContactIds=(cs.relatedContactIds||[]).filter(x=>x!==pid); App.set({}); return; }
  if(act==='viewPortal'){ App.set({currentContactId:arg,route:'contact'}); App.state.tabs.contact='portal'; App.set({}); return; }

  if(act==='openContact'){ App.set({currentContactId:arg,route:'contact'}); return; }
  if(act==='createContact'){ const c={id:uid(),name:document.getElementById('ncx-name').value||'New',email:document.getElementById('ncx-email').value||'',role:document.getElementById('ncx-role').value||'',phone:document.getElementById('ncx-phone').value||'',companyId:document.getElementById('ncx-company').value||'C-001',notes:document.getElementById('ncx-notes').value||''}; DATA.contacts.push(c); App.set({route:'contacts'}); return; }
  if(act==='saveContact'){ let c=findContact(arg); if(!c){c={id:arg,name:"",email:"",companyId:"C-001",role:"",phone:"",notes:""}; DATA.contacts.push(c);} c.name=document.getElementById('ct-name').value||c.name; c.email=document.getElementById('ct-email').value||c.email; c.companyId=document.getElementById('ct-company').value||c.companyId; c.role=document.getElementById('ct-role').value||c.role; c.phone=document.getElementById('ct-phone').value||c.phone; c.notes=document.getElementById('ct-notes').value||c.notes; alert('Contact saved'); App.set({route:'contacts'}); return; }

  if(act==='openCompany'){ App.set({currentCompanyId:arg,route:'company'}); return; }
  if(act==='createCompany'){ const id='C-'+('00'+(DATA.companies.length+1)).slice(-3); const co={id,name:document.getElementById('nco-name').value||'New Company',industry:document.getElementById('nco-industry').value||'',type:document.getElementById('nco-type').value||'',state:document.getElementById('nco-state').value||'',city:document.getElementById('nco-city').value||'',postcode:document.getElementById('nco-postcode').value||'',abn:document.getElementById('nco-abn').value||'',acn:document.getElementById('nco-acn').value||'',website:document.getElementById('nco-website').value||'',folders:{General:[]}}; DATA.companies.push(co); App.set({route:'companies'}); return; }
  if(act==='createContactForCompany'){ const co=findCompany(arg); if(!co) return; const c={id:uid(),name:document.getElementById('cco-name').value||'New',email:document.getElementById('cco-email').value||'',phone:document.getElementById('cco-phone').value||'',role:'',companyId:co.id,notes:''}; DATA.contacts.push(c); App.set({}); return; }

  if(act==='addCompanyFolderPrompt'){ const id=arg; const co=findCompany(id); if(!co) return; const nm=prompt('New folder name'); if(!nm) return; if(!co.folders) co.folders={General:[]}; if(!co.folders[nm]) co.folders[nm]=[]; App.set({}); return; }
  if(act==='deleteCompanyFolder'){ const [id,folder]=arg.split('::'); const co=findCompany(id); if(!co) return; if(confirm('Delete folder '+folder+' ?')){ delete co.folders[folder]; App.set({}); } return; }
  if(act==='selectCompanyFiles'){ const [id,folder]=arg.split('::'); const inp=document.getElementById('company-file-input'); if(!inp) return;
    inp.onchange=function(ev){ const files=Array.from(ev.target.files||[]); const co=findCompany(id); if(!co) return; if(!co.folders) co.folders={General:[]}; if(!co.folders[folder]) co.folders[folder]=[]; files.forEach(f=>{ const reader=new FileReader(); reader.onload=e=>{ co.folders[folder].push({name:f.name,size:(f.size||0)+' bytes',dataUrl:e.target.result}); App.set({}); }; reader.readAsDataURL(f); }); inp.value=''; };
    inp.click(); return; }
  if(act==='viewCompanyDoc'){ const [id,folder,name]=arg.split('::'); const co=findCompany(id); if(!co) return; const f=(co.folders[folder]||[]).find(x=>x.name===name); if(!f||!f.dataUrl){ alert('No file data.'); return; } const w=window.open(); w.document.write('<iframe src="'+f.dataUrl+'" style="border:0;width:100%;height:100%"></iframe>'); return; }
  if(act==='removeCompanyDoc'){ const [id,folder,name]=arg.split('::'); const co=findCompany(id); if(!co) return; co.folders[folder]=(co.folders[folder]||[]).filter(x=>x.name!==name); App.set({}); return; }

  if(act==='addFolderPrompt'){ const [id]=arg.split('::'); const nm=prompt('New folder name'); if(!nm) return; const cs=findCase(id); if(!cs) return; if(!cs.folders[nm]) cs.folders[nm]=[]; App.set({}); return; }
  if(act==='deleteFolder'){ const [id,folder]=arg.split('::'); const cs=findCase(id); if(!cs) return; if(confirm('Delete folder '+folder+' ?')){ delete cs.folders[folder]; App.set({}); } return; }
  if(act==='selectFiles'){ const [id,folder]=arg.split('::'); const inp=document.getElementById('file-input'); if(!inp) return;
    inp.onchange=function(ev){ const files=Array.from(ev.target.files||[]); const cs=findCase(id); if(!cs) return; if(!cs.folders[folder]) cs.folders[folder]=[]; files.forEach(f=>{ const reader=new FileReader(); reader.onload=e=>{ cs.folders[folder].push({name:f.name,size:(f.size||0)+' bytes',dataUrl:e.target.result}); App.set({}); }; reader.readAsDataURL(f); }); inp.value=''; };
    inp.click(); return; }
  if(act==='viewDoc'){ const [id,folder,name]=arg.split('::'); const cs=findCase(id); if(!cs) return; const f=(cs.folders[folder]||[]).find(x=>x.name===name); if(!f||!f.dataUrl){ alert('No file data.'); return; } const w=window.open(); w.document.write('<iframe src="'+f.dataUrl+'" style="border:0;width:100%;height:100%"></iframe>'); return; }
  if(act==='removeDoc'){ const [id,folder,name]=arg.split('::'); const cs=findCase(id); if(!cs) return; cs.folders[folder]=(cs.folders[folder]||[]).filter(x=>x.name!==name); App.set({}); return; }

  if(act==='downloadTemplate'){ alert('Downloading '+arg+' ... (demo)'); return; }
  if(act==='addUser'){ DATA.users.push({name:'New User',email:'user'+(DATA.users.length+1)+'@synergy.com',role:'Investigator'}); App.state.audit=[...(App.state.audit||[]), 'User added '+(new Date()).toLocaleString()]; App.set({}); return; }
  if(act==='saveSettings'){ App.state.settings={emailAlerts:document.getElementById('set-email').checked,darkMode:document.getElementById('set-dark').checked}; App.state.audit=[...(App.state.audit||[]), 'Settings saved '+(new Date()).toLocaleString()]; App.set({}); return; }
  if(act==='clearImpersonation'){ const admin=DATA.users.find(x=>x.role==='Admin')||{name:'Admin',email:'admin@synergy.com',role:'Admin'}; DATA.me={name:admin.name,email:admin.email,role:admin.role}; try{ localStorage.removeItem('synergy_me'); }catch(_){} alert('Switched back to Admin'); App.set({}); return; }
  if(act==='impersonate'){ let email=arg; if(!email && t && t.dataset){ email=t.dataset.arg||t.dataset.email||""; } const u=DATA.users.find(x=>x.email===email); if(!u){ alert("User not found"); return; } DATA.me={name:u.name,email:u.email,role:u.role}; try{ localStorage.setItem("synergy_me", JSON.stringify(DATA.me)); }catch(_){} alert("Now acting as "+u.name+" ("+u.role+")"); App.set({}); return; }
});

document.addEventListener('change', e=>{
  if(e.target && e.target.id==='flt-q'){ const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({}); }
});
document.addEventListener('DOMContentLoaded', ()=>{ try{ const raw=localStorage.getItem('synergy_me'); if(raw){ const me=JSON.parse(raw); if(me&&me.email){ DATA.me=me; } } }catch(_){ }
  
  // Baseline Integrity Guard
  try{
    const reqVars=["--bg","--ink","--brand","--primary","--accent"];
    const root=getComputedStyle(document.documentElement);
    const miss=reqVars.filter(v=>!root.getPropertyValue(v));
    if(miss.length) console.warn("Theme variables missing:", miss);
  }catch(e){}
  App.set({route:'dashboard'});
});
/* ===== Calendar Feature (Outlook-style) ===== */
const CAL={
  fmtDate(d){ const x=new Date(d); return x.toISOString().slice(0,10); },
  sameDay(a,b){ return CAL.fmtDate(a)===CAL.fmtDate(b); },
  startOfMonth(y,m){ return new Date(y, m, 1); },
  endOfMonth(y,m){ return new Date(y, m+1, 0); },
  addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; },
  monthGrid(year,month){ // returns array of weeks, each week is array of 7 Date objects
    const first=new Date(year,month,1);
    const start=CAL.addDays(first, -((first.getDay()+6)%7)); // Monday-start grid
    const weeks=[];
    let cur=new Date(start);
    for(let w=0; w<6; w++){
      const row=[];
      for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
      weeks.push(row);
    }
    return weeks;
  }
};

// Extend DATA with calendar events (per-user)
if(!DATA.calendar){ DATA.calendar=[]; }
(function seedCalendar(){
  if(DATA.calendar && DATA.calendar.length) return;
  const today=new Date();
  const y=today.getFullYear(), m=today.getMonth();
  const u = DATA.users;
  function ev(day, startH, endH, who, title, loc, type){
    const s=new Date(y,m,day,startH,0,0).toISOString();
    const e=new Date(y,m,day,endH,0,0).toISOString();
    return { id:uid(), title, description:"", startISO:s, endISO:e, ownerEmail:who.email, ownerName:who.name, location:loc||"", type:type||"Appointment" };
  }
  DATA.calendar.push(
    ev(3,  9,10, u[1], "Case intake - Sunrise", "Room 3", "Appointment"),
    ev(5, 14,15, u[2], "Interview planning", "Teams", "Note"),
    ev(12,11,12, u[3], "Evidence review", "Room 2", "Appointment"),
    ev(18,10,11, u[1], "Client check-in", "Phone", "Appointment"),
    ev(21,13,14, u[2], "Draft report sync", "Zoom", "Appointment"),
    ev(26, 9,10, u[0], "Admin all-hands", "Boardroom", "Appointment")
  );
})();

// App state for calendar
if(!App.state.calendar){ App.state.calendar={ view:"month", ym:(new Date()).toISOString().slice(0,7), selectedDate:(new Date()).toISOString().slice(0,10), filterUsers:"ALL" }; }

function Calendar(){
  const me = DATA.me || {email:"",role:""};
  const isAdmin = (me.role==="Admin");
  const calState = App.state.calendar;
  const ym = calState.ym|| (new Date()).toISOString().slice(0,7);
  const [yy,mm] = ym.split("-").map(x=>parseInt(x,10));
  const monthIndex = mm-1;
  const monthName = new Date(yy,monthIndex,1).toLocaleString(undefined,{month:"long", year:"numeric"});
  const weeks = CAL.monthGrid(yy, monthIndex);
  const owners = isAdmin ? DATA.users : [DATA.users.find(u=>u.email===me.email)].filter(Boolean);
  const ownerOptions = owners.map(u=>`<option value="${u.email}">${u.name} (${u.role})</option>`).join("");

  const visibleEvents = (DATA.calendar||[]).filter(ev=>{
    if(!isAdmin && ev.ownerEmail!==me.email) return false;
    if(isAdmin && calState.filterUsers!=="ALL" && ev.ownerEmail!==calState.filterUsers) return false;
    const d = new Date(ev.startISO);
    return (d.getMonth()===monthIndex && d.getFullYear()===yy);
  });

  function eventsForDay(d){
    const dayISO = CAL.fmtDate(d);
    return (DATA.calendar||[]).filter(ev=>{
      if(!isAdmin && ev.ownerEmail!==me.email) return false;
      if(isAdmin && calState.filterUsers!=="ALL" && ev.ownerEmail!==calState.filterUsers) return false;
      return CAL.fmtDate(ev.startISO)===dayISO;
    }).sort((a,b)=>a.startISO.localeCompare(b.startISO));
  }

  const grid = weeks.map(week=>{
    const tds = week.map(d=>{
      const inMonth = (d.getMonth()===monthIndex);
      const today = CAL.sameDay(d, new Date());
      const evs = eventsForDay(d);
      const chips = evs.map(e=>`<div class="cal-ev" title="${e.title} (${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})">
        <span class="cal-ev-dot"></span>
        <span class="cal-ev-title" data-act="openEvent" data-arg="${e.id}">${e.title}</span>
        <button class="cal-ev-del" data-act="deleteEvent" data-arg="${e.id}" title="Delete">×</button>
      </div>`).join("");
      return `<div class="cal-day ${inMonth?'':'cal-other'} ${today?'cal-today':''}" data-act="pickDay" data-arg="${d.toISOString().slice(0,10)}">
          <div class="cal-date">${d.getDate()}</div>
          <div class="cal-evs">${chips||""}</div>
        </div>`;
    }).join("");
    return `<div class="cal-week">${tds}</div>`;
  }).join("");

  const toolbar = `<div class="cal-toolbar">
      <div class="left">
        <button class="btn light" data-act="calPrev">◀</button>
        <button class="btn light" data-act="calToday">Today</button>
        <button class="btn light" data-act="calNext">▶</button>
        <div class="cal-month">${monthName}</div>
      </div>
      <div class="right">
        ${isAdmin ? `<select class="input" id="cal-owner-filter">
          <option value="ALL"${calState.filterUsers==="ALL"?" selected":""}>All users</option>
          ${DATA.users.map(u=>`<option value="${u.email}"${calState.filterUsers===u.email?" selected":""}>${u.name}</option>`).join("")}
        </select>`: ""}
        <div class="cal-viewtabs">
          <div class="tab ${calState.view==='month'?'active':''}" data-act="calView" data-arg="month">Month</div>
          <div class="tab ${calState.view==='agenda'?'active':''}" data-act="calView" data-arg="agenda">Agenda</div>
        </div>
      </div>
    </div>`;

  const agenda = (()=>{
    const list = (DATA.calendar||[]).filter(ev=>{
      if(!isAdmin && ev.ownerEmail!==me.email) return false;
      if(isAdmin && calState.filterUsers!=="ALL" && ev.ownerEmail!==calState.filterUsers) return false;
      const d = new Date(ev.startISO);
      return (d.getMonth()===monthIndex && d.getFullYear()===yy);
    }).sort((a,b)=>a.startISO.localeCompare(b.startISO));

    const rows = list.map(e=>{
      const d=new Date(e.startISO), end=new Date(e.endISO);
      return `<tr>
        <td>${d.toLocaleDateString()}</td>
        <td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
        <td>${e.title}</td>
        <td>${e.location||''}</td>
        <td>${e.ownerName||e.ownerEmail||''}</td>
        <td class="right">
          <button class="btn light" data-act="deleteEvent" data-arg="${e.id}">Delete</button>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="6" class="muted">No events this month.</td></tr>`;
    return `<div class="card"><h3 class="section-title">Agenda — ${monthName}</h3>
      <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th>Owner</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  })();

  const form = (()=>{
    const selDate = calState.selectedDate || new Date().toISOString().slice(0,10);
    const isAdminOwner = isAdmin ? `<div><label>Owner</label><select class="input" id="ev-owner">${DATA.users.map(u=>`<option value="${u.email}" ${u.email===me.email?'selected':''}>${u.name}</option>`).join("")}</select></div>` : "";
    return `<div class="card"><h3 class="section-title">Add ${isAdmin?"Event (any user)":"My Event"}</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
        <div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div>
        <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
        <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
        <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
        <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
        ${(()=>{const me=DATA.me||{};const role=(me.role||"");const isAdmin=(role==="Admin");const my=(DATA.cases||[]).filter(cs=>{const inv=(cs.investigatorEmail||cs.investigator||"")+"";return isAdmin||inv===me.email||inv===me.name;});const opts=my.map(cs=>`<option value="${cs.id}">${cs.fileNumber} — ${esc(cs.title||"")}</option>`).join("");return `<div><label>Case (optional)</label><select class="input" id="ev-case"><option value="">—</option>${opts}</select></div>`;})()}
        ${isAdminOwner}
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn" data-act="createEvent">Add Event</button>
      </div>
    </div>`;
  })();

  const monthGrid = `<div class="card"><div class="cal-wrap">${toolbar}
      <div class="cal-head">
        <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
      </div>
      <div class="cal-grid">${grid}</div>
    </div></div>`;

  const content = (calState.view==='agenda') ? (toolbar + agenda) : (monthGrid + form);
  return Shell(content, 'calendar');
}


/* Event edit modal (role-aware) */
function renderEventModal(ev){
  if(!ev){ document.getElementById('modal-root')?.remove(); return; }
  const me=DATA.me||{}; const role=me.role||''; const isAdmin=(role==='Admin');
  const ownerSelect = isAdmin ? `<div><label>Owner</label><select class="input" id="em-owner">${
    (DATA.users||[]).map(u=>`<option value="${u.email}" ${(u.email===ev.ownerEmail?'selected':'')}>${u.name}</option>`).join("")
  }</select></div>` : "";
  const caseOpts = ((DATA.cases||[]).filter(cs=>{
    const inv=(cs.investigatorEmail||cs.investigator||'')+'';
    return isAdmin || inv===me.email || inv===me.name;
  }).map(cs=>`<option value="${cs.id}" ${(cs.id===(ev.caseId||"")?'selected':'')}>${cs.fileNumber} — ${esc(cs.title||'')}</option>`).join(""));
  const caseSelect = `<div><label>Case (optional)</label><select class="input" id="em-case"><option value="">—</option>${caseOpts}</select></div>`;
  const node=document.createElement('div'); node.id='modal-root'; node.innerHTML=`
    <div class="modal-backdrop" data-act="closeModal"></div>
    <div class="modal">
      <h3 class="section-title">Edit Event</h3>
      <div class="grid cols-3">
        <div><label>Title</label><input class="input" id="em-title" value="${esc(ev.title||'')}"></div>
        <div><label>Date</label><input class="input" id="em-date" type="date" value="${(ev.startISO||'').slice(0,10)}"></div>
        <div><label>Type</label><select class="input" id="em-type"><option${ev.type==='Appointment'?' selected':''}>Appointment</option><option${ev.type==='Note'?' selected':''}>Note</option></select></div>
        <div><label>Start</label><input class="input" id="em-start" type="time" value="${new Date(ev.startISO).toISOString().slice(11,16)}"></div>
        <div><label>End</label><input class="input" id="em-end" type="time" value="${new Date(ev.endISO).toISOString().slice(11,16)}"></div>
        <div><label>Location</label><input class="input" id="em-loc" value="${esc(ev.location||'')}"></div>
        ${caseSelect}
        ${ownerSelect}
      </div>
      <div class="right" style="margin-top:8px">
        <button class="btn" data-act="saveEvent" data-arg="${ev.id}">Save</button>
        <button class="btn danger" data-act="deleteEvent" data-arg="${ev.id}">Delete</button>
        <button class="btn light" data-act="closeModal">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(node);
}
/* Calendar actions */
document.addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg')||"";
  const S=App.state.calendar||{view:"month"};

  if(act==='calView'){ S.view=arg; App.set({calendar:S}); return; }
  if(act==='calToday'){ const today=new Date(); const ym=today.toISOString().slice(0,7); S.ym=ym; S.selectedDate=today.toISOString().slice(0,10); App.set({calendar:S}); return; }
  if(act==='calPrev' || act==='calNext'){
    const [yy,mm]= (S.ym||new Date().toISOString().slice(0,7)).split('-').map(x=>parseInt(x,10));
    let y=yy, m=mm-1;
    if(act==='calPrev'){ m--; } else { m++; }
    if(m<0){m=11;y--;} if(m>11){m=0;y++;}
    S.ym= `${y}-${String(m+1).padStart(2,'0')}`;
    App.set({calendar:S}); return;
  }
  if(act==='pickDay'){ S.selectedDate=arg; App.set({calendar:S}); return; }
  if(act==='createEvent'){
    const me=DATA.me||{email:""};
    const title=(document.getElementById('ev-title')||{}).value||'Untitled';
    const date=(document.getElementById('ev-date')||{}).value||new Date().toISOString().slice(0,10);
    const type=(document.getElementById('ev-type')||{}).value||'Appointment';
    const start=(document.getElementById('ev-start')||{}).value||'09:00';
    const end=(document.getElementById('ev-end')||{}).value||'10:00';
    const loc=(document.getElementById('ev-loc')||{}).value||'';
    const owner = (DATA.me.role==="Admin" ? (document.getElementById('ev-owner')||{}).value||me.email : me.email);
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const caseId=(document.getElementById('ev-case')||{}).value||"";
    const sISO = date+"T"+start+":00";
    const eISO = date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:caseId||null});
    alert('Event added');
    App.set({}); return;
  }
  if(act==='deleteEvent'){
    DATA.calendar = (DATA.calendar||[]).filter(ev=>ev.id!==arg);
    App.set({}); document.getElementById('modal-root')?.remove(); return;
  }
  if(act==='createCaseEvent'){
    const csId=arg; const me=DATA.me||{email:""};
    const title=(document.getElementById('ce-title')||{}).value||'Untitled';
    const date=(document.getElementById('ce-date')||{}).value||new Date().toISOString().slice(0,10);
    const type=(document.getElementById('ce-type')||{}).value||'Appointment';
    const start=(document.getElementById('ce-start')||{}).value||'10:00';
    const end=(document.getElementById('ce-end')||{}).value||'11:00';
    const loc=(document.getElementById('ce-loc')||{}).value||'';
    const owner = ((DATA.me||{}).role||'')==='Admin' ? ((document.getElementById('ce-owner')||{}).value||me.email) : me.email;
    const ownerName = (DATA.users.find(u=>u.email===owner)||{}).name || owner;
    const sISO = date+"T"+start+":00"; const eISO = date+"T"+end+":00";
    DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail:owner, ownerName, location:loc, type, caseId:csId});
    App.set({}); return;
  }
  if(act==='openEvent'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg);
    if(ev) renderEventModal(ev);
    return;
  }
  if(act==='saveEvent'){
    const ev=(DATA.calendar||[]).find(x=>x.id===arg); if(!ev) return;
    const date=(document.getElementById('em-date')||{}).value||ev.startISO.slice(0,10);
    const s=(document.getElementById('em-start')||{}).value||new Date(ev.startISO).toISOString().slice(11,16);
    const e2=(document.getElementById('em-end')||{}).value||new Date(ev.endISO).toISOString().slice(11,16);
    ev.title=(document.getElementById('em-title')||{}).value||ev.title;
    ev.type=(document.getElementById('em-type')||{}).value||ev.type;
    ev.location=(document.getElementById('em-loc')||{}).value||ev.location;
    ev.startISO = date+"T"+s+":00";
    ev.endISO   = date+"T"+e2+":00";
    const csel=(document.getElementById('em-case')||{}).value||''; ev.caseId = csel || null;
    const me=DATA.me||{}; if((me.role||'')==='Admin'){ const owner=(document.getElementById('em-owner')||{}).value||ev.ownerEmail; ev.ownerEmail = owner; ev.ownerName = ((DATA.users||[]).find(u=>u.email===owner)||{}).name || owner; }
    App.set({}); document.getElementById('modal-root')?.remove(); return;
  }
});

document.addEventListener('change', e=>{
  if(e.target && e.target.id==='cal-owner-filter'){
    const S=App.state.calendar||{}; S.filterUsers=e.target.value||"ALL"; App.set({calendar:S});
  }
});
/* ===== End Calendar Feature ===== */

})();