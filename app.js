(function(){ "use strict";
const BUILD="v2.13.2"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM COMPLETE "+BUILD+" • "+STAMP);

/* ---------- utils ---------- */
function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
function htmlEscape(s){ return (s||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

/* ---------- seed data ---------- */
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",
    investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),
    notes:[],tasks:[],folders:{General:[]}};
  Object.assign(b,p||{}); return b;
}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Private",state:"Queensland",city:"Brisbane",postcode:"4000",abn:"12 345 678 901",acn:"345 678 901",website:"www.sunrisemining.com",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Public",state:"Victoria",city:"Melbourne",postcode:"3000",abn:"98 765 432 100",acn:"—",website:"www.melbourne.vic.gov.au",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Healthcare",type:"Public",state:"Queensland",city:"Brisbane",postcode:"4006",abn:"76 543 210 999",acn:"—",website:"www.health.qld.gov.au",folders:{General:[]}},
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",notes:"Investigator for Sunrise."},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",notes:"Senior investigator."},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",notes:"Reviewer for CoM cases."}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  resources:{templates:["Case intake form.docx","Interview checklist.pdf","Final report.docx"],procedures:["Code of conduct.pdf","Incident workflow.png"]},
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

/* ---------- finders ---------- */
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

/* ---------- app shell ---------- */
const App={state:{route:"dashboard",currentCaseId:null,currentCompanyId:null,currentContactId:null,companyTab:"summary",asUser:null,casesFilter:{q:""}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){ let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'; s+='<span class="badge">Soft Stable '+BUILD+'</span></div>'; return s; }
function Sidebar(active){
  const items=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'];
  out.push(items.map(([k,v])=>`<li ${active===k?'class="active"':''} data-act="route" data-arg="${k}">${v}</li>`).join(""));
  out.push('</ul></aside>'); return out.join('');
}
function Shell(content,active){ return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`; }

/* ---------- UI helpers ---------- */
function statusChip(status){
  const key=(status||"").toLowerCase().replace(/\s+/g,'-');
  const cls={
    "planning":"status-planning",
    "investigation":"status-investigation",
    "evidence-review":"status-evidence-review",
    "reporting":"status-reporting",
    "closed":"status-closed"
  }[key] || "status-planning";
  return '<span class="chip '+cls+'"><i></i>'+ (status||'') +'</span>';
}

/* ---------- pages ---------- */
function Dashboard(){
  const d=App.get();
  const rows=d.cases.slice(0,6).map(c=>`<tr><td>${c.fileNumber}</td><td>${c.organisation}</td><td>${c.investigatorName}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const tbl=`<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  const card=`<div class="card"><h3>Welcome</h3><div class="mono">${STAMP}</div></div>`;
  const sec=`<div class="section"><header><h3 class="section-title">Active Cases</h3></header>${tbl}</div>`;
  return Shell(card+sec,'dashboard');
}

function Cases(){
  const d=App.get(), f=App.state.casesFilter||{q:""};
  const list=d.cases.filter(c=>{ const q=(f.q||"").toLowerCase(); if(!q) return true; return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q); });
  const rows=list.map(cc=>`<tr><td>${cc.fileNumber}</td><td>${cc.title}</td><td>${cc.organisation}</td><td>${cc.investigatorName}</td><td>${statusChip(cc.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${cc.id}">Open</button></td></tr>`).join("");
  const tools=`<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="${f.q||''}"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>`;
  return Shell(`<div class="section"><header><h3 class="section-title">Cases</h3></header>${tools}<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'cases');
}

function CasePage(id){
  const d=App.get(), cs=findCase(id);
  if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const invOpts=()=>d.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>`<option ${u.email===cs.investigatorEmail?'selected':''} value="${u.email}">${u.name} (${u.role})</option>`).join("");
  const coOpts=()=>d.companies.map(co=>`<option ${co.id===cs.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");

  const header = `<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case ${cs.fileNumber}</h2><div class="sp"></div><button class="btn" data-act="saveCase" data-arg="${id}">Save Case</button> <button class="btn danger" data-act="deleteCase" data-arg="${id}">Delete Case</button> <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>`;

  const details = `<div class="card"><div class="grid cols-2">
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
  </div></div>`;

  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
  for(const nn of (cs.notes||[])){ notesRows+=`<tr><td>${nn.time||''}</td><td>${nn.by||''}</td><td>${htmlEscape(nn.text||'')}</td></tr>`; }
  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  for(const tt of (cs.tasks||[])){ taskRows+=`<tr><td>${tt.id}</td><td>${htmlEscape(tt.title||'')}</td><td>${tt.assignee||''}</td><td>${tt.due||''}</td><td>${tt.status||''}</td></tr>`; }

  const notesTasks = `<div class="grid cols-2">
    <div class="section"><header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="${id}">Add Note</button></header>
      <textarea class="input" id="note-text" placeholder="Type your note here"></textarea>
      <table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">${notesRows}</tbody></table>
    </div>
    <div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="${id}">Add standard tasks</button></header>
      <div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">${invOpts()}</select></div>
      <div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="${id}">Add</button></div>
      <table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>${taskRows}</tbody></table>
    </div>
  </div>`;

  let docRows='';
  for(const fname in cs.folders){
    if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const docs = '<div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';

  return Shell(header + details + notesTasks + docs, 'cases');
}

function Contacts(){
  const d=App.get();
  const coName=id=>{const co=findCompany(id); return co?co.name:"";};
  const rows=d.contacts.map(c=>`<tr><td>${c.name}</td><td>${c.email}</td><td>${coName(c.companyId)}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${c.id}">Open</button></td></tr>`).join("");
  return Shell(`<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,'contacts');
}

function ContactPage(id){
  const d=App.get(), c=findContact(id)||{id:uid(),name:"",email:"",companyId:"C-001",notes:""};
  const coOpts=()=>d.companies.map(co=>`<option ${co.id===c.companyId?'selected':''} value="${co.id}">${co.name} (${co.id})</option>`).join("");
  const header = `<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="${c.id}">Save Contact</button> <button class="btn light" data-act="route" data-arg="contacts">Back</button></div></div>`;
  const body = `<div class="card"><div class="grid cols-2">
    <div><label>Name</label><input class="input" id="ct-name" value="${c.name||''}"></div>
    <div><label>Email</label><input class="input" id="ct-email" value="${c.email||''}"></div>
    <div><label>Company</label><select class="input" id="ct-company">${coOpts()}</select></div>
    <div><label>Notes</label><textarea class="input" id="ct-notes">${htmlEscape(c.notes||'')}</textarea></div>
  </div></div>`;
  return Shell(header+body,'contacts');
}

function Companies(){
  const d=App.get();
  const countContacts = id => d.contacts.filter(c=>c.companyId===id).length;
  const countCases = id => d.cases.filter(c=>c.companyId===id).length;
  const rows=d.companies.map(co=>`<tr><td>${co.id}</td><td>${co.name}</td><td>${countContacts(co.id)}</td><td>${countCases(co.id)}</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="${co.id}">Open</button></td></tr>`).join("");
  const html = `<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header>
    <table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  return Shell(html,'companies');
}

function CompanyPage(id){
  const d=App.get(), co=findCompany(id);
  if(!co){ alert('Company not found'); App.set({route:'companies'}); return Shell('<div class="card">Company not found.</div>','companies'); }
  const tab = App.state.companyTab || 'summary';
  const btn = (k,l)=>`<div class="tab ${tab===k?'active':''}" data-act="companyTab" data-arg="${k}">${l}</div>`;

  const header = `<div class="card"><div style="display:flex;align-items:center;gap:10px">
      <div class="avatar">${(co.name||'')[0]||'?'}</div>
      <div style="font-size:18px;font-weight:700">${co.name||''}</div>
      <div class="sp"></div>
      <button class="btn light" data-act="route" data-arg="companies">Back</button>
    </div></div>`;

  const about = `<div class="card"><h3 class="section-title">About this company</h3>
    <div class="grid cols-2" style="margin-top:8px">
      <div class="profile">
        <div class="kvs" style="display:grid;grid-template-columns:140px 1fr;gap:6px;font-size:13px">
          <div class="k">ID</div><div>${co.id}</div>
          <div class="k">Industry</div><div>${co.industry||'—'}</div>
          <div class="k">Type</div><div>${co.type||'—'}</div>
          <div class="k">State</div><div>${co.state||'—'}</div>
          <div class="k">City</div><div>${co.city||'—'}</div>
          <div class="k">Postcode</div><div>${co.postcode||'—'}</div>
          <div class="k">ABN</div><div>${co.abn||'—'}</div>
          <div class="k">ACN</div><div>${co.acn||'—'}</div>
          <div class="k">Website</div><div>${co.website||'—'}</div>
        </div>
      </div>
    </div></div>`;

  const rcases = d.cases.filter(c=>c.companyId===co.id).slice(0,5);
  const rcRows = rcases.map(c=>`<tr><td>${c.fileNumber}</td><td>${c.title}</td><td>${statusChip(c.status)}</td><td class="right"><button class="btn light" data-act="openCase" data-arg="${c.id}">Open</button></td></tr>`).join("");
  const recent = `<div class="card"><h3 class="section-title">Recent Cases</h3>
    <table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>${rcRows||'<tr><td colspan="4" class="muted">No cases.</td></tr>'}</tbody></table></div>`;

  const ccs = d.contacts.filter(x=>x.companyId===co.id);
  const ccRows = ccs.map(p=>`<tr><td>${p.name}</td><td>${p.email}</td><td class="right"><button class="btn light" data-act="openContact" data-arg="${p.id}">Open</button></td></tr>`).join("");
  const coContacts = `<div class="card"><h3 class="section-title">Company Contacts</h3><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>${ccRows||'<tr><td colspan="3" class="muted">No contacts.</td></tr>'}</tbody></table></div>`;

  const coDocs = `<div class="card"><h3 class="section-title">Company Documents</h3><div class="muted">Documents area coming soon.</div></div>`;

  const tabs = `<div class="tabs">${btn('summary','Summary')}${btn('contacts','Company Contacts')}${btn('documents','Company Documents')}</div>`;
  const body = `<div class="tabpanel ${tab==='summary'?'active':''}">${about}${recent}</div>
                <div class="tabpanel ${tab==='contacts'?'active':''}">${coContacts}</div>
                <div class="tabpanel ${tab==='documents'?'active':''}">${coDocs}</div>`;
  return Shell(header + '<div class="section">'+tabs+body+'</div>', 'companies');
}

function Documents(){
  const d=App.get();
  const tRows=(d.resources.templates||[]).map(n=>`<tr><td>${n}</td><td class="right"><button class="btn light" data-act="downloadTemplate" data-arg="${n}">Download</button></td></tr>`).join("");
  const pRows=(d.resources.procedures||[]).map(n=>`<tr><td>${n}</td><td class="right"><button class="btn light" data-act="downloadTemplate" data-arg="${n}">Download</button></td></tr>`).join("");
  const html = `<div class="grid cols-2">
    <div class="card"><h3 class="section-title">Templates</h3><table><thead><tr><th>File</th><th></th></tr></thead><tbody>${tRows||'<tr><td colspan="2" class="muted">No templates</td></tr>'}</tbody></table></div>
    <div class="card"><h3 class="section-title">Procedures</h3><table><thead><tr><th>File</th><th></th></tr></thead><tbody>${pRows||'<tr><td colspan="2" class="muted">No procedures</td></tr>'}</tbody></table></div>
  </div>`;
  return Shell(html,'documents');
}

function Resources(){
  const html = `<div class="card"><h3 class="section-title">Resources</h3><div class="muted">Add links, FAQs, and guidance here.</div></div>`;
  return Shell(html,'resources');
}
function Admin(){
  const html = `<div class="card"><h3 class="section-title">Admin</h3><div class="muted">Admin area placeholder.</div></div>`;
  return Shell(html,'admin');
}

/* ---------- render ---------- */
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
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}

/* ---------- events ---------- */
document.addEventListener('click', e=>{
  let t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();

  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({currentCaseId:arg,route:'case'}); return; }
  if(act==='newCase'){
    const seq=('00'+(d.cases.length+1)).slice(-3);
    const inv=d.users[0]||{name:'',email:''};
    const created=(new Date()).toISOString().slice(0,7);
    const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}};
    d.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'}); return;
  }
  if(act==='saveCase'){
    const cs=findCase(arg); if(!cs) return;
    const getV=id=>{const el=document.getElementById(id); return el?el.value:null;};
    const setIf=(key,val)=>{ if(val!=null){ cs[key]=val; } };
    setIf('title', getV('c-title')); setIf('organisation', getV('c-org'));
    const coVal=getV('c-company'); if(coVal!=null) cs.companyId=coVal;
    const invEmail=getV('c-inv'); if(invEmail!=null){ cs.investigatorEmail=invEmail; const u=DATA.users.find(x=>x.email===invEmail)||null; cs.investigatorName=u?u.name:''; }
    setIf('status', getV('c-status')); setIf('priority', getV('c-priority'));
    const idEl=document.getElementById('c-id'); if(idEl && idEl.value){ cs.fileNumber=idEl.value.trim(); }
    alert('Case saved'); return;
  }
  if(act==='deleteCase'){
    const cs=findCase(arg); if(!cs){ alert('Case not found'); return; }
    if(confirm('Delete this case ('+(cs.fileNumber||cs.title||cs.id)+') ?')){ DATA.cases = DATA.cases.filter(c=>c.id!==cs.id); App.set({route:'cases', currentCaseId:null}); }
    return;
  }
  if(act==='addNote'){
    const cs=findCase(arg); if(!cs) return;
    const text=document.getElementById('note-text').value; if(!text){alert('Enter a note');return;}
    const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com';
    cs.notes.unshift({time:stamp,by:me,text}); App.set({}); return;
  }
  if(act==='addStdTasks'){
    const cs=findCase(arg); if(!cs) return;
    const base=cs.tasks, add=['Gather documents','Interview complainant','Interview respondent','Write report'];
    add.forEach(a=>base.push({id:'T-'+(base.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'}));
    App.set({}); return;
  }
  if(act==='addTask'){
    const cs=findCase(arg); if(!cs) return;
    const sel=document.getElementById('task-assignee'); const who=sel.options[sel.selectedIndex].text;
    cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,assignee:who,due:document.getElementById('task-due').value,status:'Open'});
    App.set({}); return;
  }

  // Company routes/actions
  if(act==='openCompany'){ App.set({currentCompanyId:arg,companyTab:'summary',route:'company'}); return; }
  if(act==='newCompany'){ const newid='C-'+('00'+(DATA.companies.length+1)).slice(-3); DATA.companies.push({id:newid,name:'New Company',folders:{General:[]}}); App.set({route:'companies'}); return; }
  if(act==='companyTab'){ App.set({companyTab:arg}); return; }

  // Contacts
  if(act==='openContact'){ App.set({currentContactId:arg,route:'contact'}); return; }
  if(act==='newContact'){ App.set({currentContactId:uid(),route:'contact'}); return; }
  if(act==='saveContact'){
    let c=findContact(arg);
    if(!c){ c={id:arg,name:"",email:"",companyId:"C-001",notes:""}; DATA.contacts.push(c); }
    c.name=document.getElementById('ct-name').value||c.name;
    c.email=document.getElementById('ct-email').value||c.email;
    c.companyId=document.getElementById('ct-company').value||c.companyId;
    c.notes=document.getElementById('ct-notes').value||c.notes;
    alert('Contact saved'); App.set({route:'contacts'}); return;
  }

  // Case documents
  if(act==='addFolderPrompt'){ const parts=arg.split('::'); const id=parts[0]; const nm=prompt('New folder name'); if(!nm) return; const cs=findCase(id); if(!cs) return; if(!cs.folders[nm]) cs.folders[nm]=[]; App.set({}); return; }
  if(act==='deleteFolder'){ const [id,folder]=arg.split('::'); const cs=findCase(id); if(!cs) return; if(confirm('Delete folder '+folder+' ?')){ delete cs.folders[folder]; App.set({}); } return; }
  if(act==='selectFiles'){
    const [id,folder]=arg.split('::'); const inp=document.getElementById('file-input'); if(!inp) return;
    inp.onchange=function(ev){ const files=Array.from(ev.target.files||[]); const cs=findCase(id); if(!cs) return;
      if(!cs.folders[folder]) cs.folders[folder]=[];
      files.forEach(f=>{ const reader=new FileReader(); reader.onload=function(e){ cs.folders[folder].push({name:f.name,size:(f.size||0)+' bytes',dataUrl:e.target.result}); App.set({}); }; reader.readAsDataURL(f); });
      inp.value='';
    };
    inp.click(); return;
  }
  if(act==='viewDoc'){ const [id,folder,name]=arg.split('::'); const cs=findCase(id); if(!cs) return; const f=(cs.folders[folder]||[]).find(x=>x.name===name); if(!f||!f.dataUrl){ alert('No file data.'); return; } const w=window.open(); w.document.write('<iframe src="'+f.dataUrl+'" style="border:0;width:100%;height:100%"></iframe>'); return; }
  if(act==='removeDoc'){ const [id,folder,name]=arg.split('::'); const cs=findCase(id); if(!cs) return; cs.folders[folder]=(cs.folders[folder]||[]).filter(x=>x.name!==name); App.set({}); return; }

  // Resources/templates download simulation
  if(act==='downloadTemplate'){ alert('Downloading '+arg+' ... (demo)'); return; }
});

document.addEventListener('change', e=>{
  if(e.target && e.target.id==='flt-q'){ const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({}); }
});

document.addEventListener('DOMContentLoaded', ()=>{ App.set({route:'dashboard'}); });
})();