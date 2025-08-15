(function(){ "use strict";
const BUILD="v2.11.4"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);

function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

// Seed
function mkCase(y,seq,p){let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b;}
const DATA={
  users:[
    {name:"Admin",email:"admin@synergy.com",role:"Admin"},
    {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
    {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
    {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
  ],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Client",phone:"07 345 5678",email:"admin@sunrisemining.com",website:"www.sunrisemining.com",state:"Queensland",city:"Brisbane",postcode:"4000",abn:"12 345 678 901",acn:"345 678 901",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",type:"Government",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",type:"Government",folders:{General:[]}}
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",phone:"",org:"Investigator",notes:""},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",companyId:"C-003",org:"Investigator",notes:""},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",companyId:"C-002",org:"Reviewer",notes:""}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  resources:{templates:[],procedures:[]},
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

const App={state:{route:"dashboard",currentCaseId:null,currentContactId:null,currentCompanyId:null,currentUploadTarget:null,currentCompanyUploadTarget:null,companyEdit:false,casesFilter:{q:""}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
function Sidebar(active){const base=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');} out.push('</ul></aside>'); return out.join('');}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// Dashboard
function Dashboard(){const d=App.get(); let rows=''; for(const c of d.cases.slice(0,6)) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>'; const tbl='<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>'; const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div></div><div class="mono">Build: '+STAMP+'</div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header>'+tbl+'</div>'; return Shell(html,'dashboard');}

// Cases
function Cases(){const d=App.get(), f=App.state.casesFilter||{q:""}; const list=d.cases.filter(c=>{if(!f.q) return true; const q=f.q.toLowerCase(); return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q);}); let rows=''; for(const cc of list){rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>';} const tools='<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="'+(f.q||'')+'"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>'; return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');}

function CasePage(id){
  const d=App.get(), cs=findCase(id); 
  if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const invOpts=()=>d.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join('');
  const coOpts=()=>d.companies.map(co=>'<option '+(co.id===cs.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>').join('');
  if(!cs.folders) cs.folders={General:[]};

  const header = '<div class="card">'
   + '<div style="display:flex;align-items:center;gap:8px">'
   +   '<h2>Case '+cs.fileNumber+'</h2>'
   +   '<div class="sp"></div>'
   +   '<button class="btn" data-act="saveCase" data-arg="'+id+'">Save Case</button> '
   +   '<button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete Case</button> '
   +   '<button class="btn light" data-act="route" data-arg="cases">Back to Cases</button>'
   + '</div>'
   + '</div>';

  const leftDetails = '<div class="card">'
   + '<div class="grid cols-2" style="margin-top:4px">'
   +   '<div><label>Case ID</label><input class="input" id="c-id" value="'+(cs.fileNumber||'')+'"></div>'
   +   '<div><label>Organisation (display)</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div>'
   +   '<div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div>'
   +   '<div><label>Company</label><select class="input" id="c-company">'+coOpts()+'</select></div>'
   +   '<div><label>Investigator</label><select class="input" id="c-inv">'+invOpts()+'</select></div>'
   +   '<div><label>Status</label><select class="input" id="c-status">'
   +     '<option'+(cs.status==='Planning'?' selected':'')+'>Planning</option>'
   +     '<option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option>'
   +     '<option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option>'
   +     '<option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option>'
   +     '<option'+(cs.status==='Closed'?' selected':'')+'>Closed</option>'
   +   '</select></div>'
   +   '<div><label>Priority</label><select class="input" id="c-priority">'
   +     '<option'+(cs.priority==='Low'?' selected':'')+'>Low</option>'
   +     '<option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option>'
   +     '<option'+(cs.priority==='High'?' selected':'')+'>High</option>'
   +     '<option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option>'
   +   '</select></div>'
   + '</div>'
   + '</div>';

  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
  for(const nn of (cs.notes||[])){notesRows+='<tr><td>'+ (nn.time||'') +'</td><td>'+ (nn.by||'') +'</td><td>'+ (nn.text||'') +'</td></tr>';}
  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  for(const tt of (cs.tasks||[])){taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>';}

  const blocks='<div class="grid cols-2">'
    + '<div class="section"><header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add Note</button></header>'
    + '<textarea class="input" id="note-text" placeholder="Type your note here"></textarea>'
    + '<table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">'+notesRows+'</tbody></table></div>'
    + '<div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header>'
    + '<div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts()+'</select></div>'
    + '<div style="text-align:right;margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div>'
    + '<table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+taskRows+'</tbody></table></div>'
    + '</div>';

  let docRows='';
  for(const fname in cs.folders){ if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const docs = '<div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';

  return Shell(header + leftDetails + blocks + docs, 'cases');
}

// Contacts
function Contacts(){const d=App.get(); const coName=id=>{const co=findCompany(id); return co?co.name:"";}; let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}

function ContactPage(id){const d=App.get(), c=findContact(id); if(!c) return Shell('<div class="card">Contact not found.</div>','contacts'); const coOpts=()=>['<option value="">(No linked company)</option>'].concat(d.companies.map(co=>'<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>')).join(''); let html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteContact" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="contacts">Back to Contacts</button></div><div class="grid cols-4" style="margin-top:12px"><div><label>Contact Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Phone</label><input class="input" id="ct-phone" value="'+(c.phone||'')+'"></div><div><label>Position/Org</label><input class="input" id="ct-org" value="'+(c.org||'')+'"></div><div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">'+coOpts()+'</select></div><div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">'+(c.notes||'')+'</textarea></div></div></div>' + '<div class="section"><header><h3 class="section-title">Portal Access</h3></header><div class="grid cols-3"><div><label>Status</label><div class="chip">'+(c.email?'Enabled':'Add email')+'</div></div><div><label>Role</label><select class="input" id="cp-role"><option>Client</option><option>Investigator</option><option>Reviewer</option><option>Admin</option></select></div></div>'; return Shell(html,'contacts');}

// Companies list + page
function Companies(){const d=App.get(); const countContacts=cid=>d.contacts.filter(c=>c.companyId===cid).length; const countCases=cid=>d.cases.filter(c=>c.companyId===cid).length; let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}

function coVal(co, key){ return (co && co[key]) ? co[key] : ""; }

function CompanyProfile(co){
  const header = '<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Company</h2><div class="sp"></div><button class="btn" data-act="editCompany" data-arg="'+co.id+'">Edit</button><button class="btn danger" data-act="deleteCompany" data-arg="'+co.id+'">Delete</button><button class="btn light" data-act="route" data-arg="companies">Back</button></div>'
    + '<div style="margin-top:8px;display:flex;align-items:center;gap:12px"><div class="chip">'+(co.name||"")+'</div><div class="sp"></div><div>'+ (co.phone||"") +'</div><div>'+ (co.email||"") +'</div></div></div>';
  const about = '<div class="section"><header><h3 class="section-title">About this company</h3></header>'
    + '<div class="grid cols-2" style="padding:12px">'
    +   '<div><label>Domain</label><div>'+coVal(co,"website")+'</div></div>'
    +   '<div><label>Industry</label><div>'+coVal(co,"industry")+'</div></div>'
    +   '<div><label>Type</label><div>'+coVal(co,"type")+'</div></div>'
    +   '<div><label>City</label><div>'+coVal(co,"city")+'</div></div>'
    +   '<div><label>State</label><div>'+coVal(co,"state")+'</div></div>'
    +   '<div><label>Postcode</label><div>'+coVal(co,"postcode")+'</div></div>'
    +   '<div><label>ABN</label><div>'+coVal(co,"abn")+'</div></div>'
    +   '<div><label>ACN</label><div>'+coVal(co,"acn")+'</div></div>'
    + '</div></div>';
  // Contacts
  const contacts = (App.get().contacts||[]).filter(c=>c.companyId===co.id);
  let rows=''; if(!contacts.length){ rows='<tr><td colspan="5" class="muted">No contacts yet.</td></tr>'; }
  for(const c of contacts){
    rows += '<tr><td>'+ (c.name||'') +'</td><td>'+ (c.email||'') +'</td><td>'+ (c.phone||'') +'</td><td>'+ (c.org||'') +'</td>'
      + '<td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button> '
      + (c.email?'<button class="btn light" data-act="emailContact" data-arg="'+c.id+'">Email</button>':'')
      +'</td></tr>';
  }
  const contactPanel = '<div class="section"><header><h3 class="section-title">Company Contacts</h3><button class="btn light" data-act="newContactForCompany" data-arg="'+co.id+'">Add contact</button></header>'
    + '<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position/Org</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  // Documents
  if(!co.folders) co.folders={General:[]};
  let docRows='';
  for(const fname in co.folders){ if(!Object.prototype.hasOwnProperty.call(co.folders,fname)) continue; const files=co.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteCompanyFolder" data-arg="'+co.id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=co.id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewCompanyDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeCompanyDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const docs = '<div class="section"><header><h3 class="section-title">Company Documents</h3><div><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+co.id+'">Add folder</button> <button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::General">Select files</button></div></header><input type="file" id="co-file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';
  return header + about + contactPanel + docs;
}

function CompanyEditForm(co){
  const header = '<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Edit Company</h2><div class="sp"></div><button class="btn" data-act="saveCompany" data-arg="'+co.id+'">Save</button><button class="btn light" data-act="cancelCompanyEdit">Cancel</button></div></div>';
  const form = '<div class="card"><div class="grid cols-2"><div><label>ID</label><input class="input" id="co-id" value="'+(co.id||'')+'" disabled></div><div><label>Legal Name</label><input class="input" id="co-name" value="'+(co.name||'')+'"></div><div><label>Trading Name</label><input class="input" id="co-trading" value="'+(co.tradingName||'')+'"></div><div><label>ABN</label><input class="input" id="co-abn" value="'+(co.abn||'')+'"></div><div><label>ACN</label><input class="input" id="co-acn" value="'+(co.acn||'')+'"></div><div><label>Phone</label><input class="input" id="co-phone" value="'+(co.phone||'')+'"></div><div><label>Email</label><input class="input" id="co-email" value="'+(co.email||'')+'"></div><div><label>Website</label><input class="input" id="co-website" value="'+(co.website||'')+'"></div><div><label>Industry</label><input class="input" id="co-industry" value="'+(co.industry||'')+'"></div><div><label>Type</label><input class="input" id="co-type" value="'+(co.type||'')+'"></div><div><label>City</label><input class="input" id="co-city" value="'+(co.city||'')+'"></div><div><label>State</label><input class="input" id="co-state" value="'+(co.state||'')+'"></div><div><label>Postcode</label><input class="input" id="co-postcode" value="'+(co.postcode||'')+'"></div><div style="grid-column:span 2"><label>Notes</label><textarea class="input" id="co-notes">'+(co.notes||'')+'</textarea></div></div></div>';
  return header + form;
}

function CompanyPage(id){
  const co=findCompany(id);
  if(!co){ alert("Company not found"); App.set({route:'companies'}); return Shell('<div class="card">Company not found.</div>','companies'); }
  const body = App.state.companyEdit ? CompanyEditForm(co) : CompanyProfile(co);
  return Shell(body,'companies');
}

// Documents
function Documents(){const d=App.get(); let rows=''; for(const c of d.cases){let count=0; for(const k in c.folders){if(Object.prototype.hasOwnProperty.call(c.folders,k)) count+=c.folders[k].length;} rows+='<tr><td>'+c.fileNumber+'</td><td>'+count+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>'; } return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents');}

function Resources(){const d=App.get(); if(!d.resources) d.resources={templates:[],procedures:[]}; const rows=kind=>{const list=(kind==='templates')?d.resources.templates:d.resources.procedures; if(!list.length) return '<tr><td colspan="3" class="muted">No items yet.</td></tr>'; return list.map(it=>{const arg=kind+'::'+it.name; return '<tr><td>'+it.name+'</td><td>'+it.size+'</td><td class="right">'+(it.dataUrl?('<button class="btn light" data-act="viewResource" data-arg="'+arg+'">View</button> '):'')+'<button class="btn light" data-act="removeResource" data-arg="'+arg+'">Remove</button></td></tr>';}).join(''); }; const html='<div class="section"><header><h3 class="section-title">Investigation Templates</h3><div><button class="btn light" data-act="selectResTemplates">Select files</button></div></header><input type="file" id="rs-file-templates" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('templates')+'</tbody></table></div><div class="section"><header><h3 class="section-title">Procedures</h3><div><button class="btn light" data-act="selectResProcedures">Select files</button></div></header><input type="file" id="rs-file-procedures" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('procedures')+'</tbody></table></div>'; return Shell(html,'resources');}

// Render
function render(){const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='documents') el.innerHTML=Documents(); else if(r==='resources') el.innerHTML=Resources(); else if(r==='admin') el.innerHTML='<div class="card">Admin not available</div>'; else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')';}

// Actions
document.addEventListener('click',e=>{let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return; const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
// nav
if(act==='route'){App.set({route:arg});return;}
if(act==='openCase'){App.set({currentCaseId:arg,route:'case'});return;}
if(act==='openContact'){App.set({currentContactId:arg,route:'contact'});return;}
if(act==='openCompany'){App.set({currentCompanyId:arg,companyEdit:false,route:'company'});return;}

// cases
if(act==='newCase'){const seq=('00'+(d.cases.length+1)).slice(-3); const inv=d.users[0]||{name:'',email:''}; const created=(new Date()).toISOString().slice(0,7); const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}}; d.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'});return;}
if(act==='saveCase'){const cs=findCase(arg); if(!cs) return; const getV=id=>{const el=document.getElementById(id); return el?el.value:null;}; const setIf=(key,val)=>{ if(val!=null){ cs[key]=val; } }; setIf('title', getV('c-title')); setIf('organisation', getV('c-org')); const coVal=getV('c-company'); if(coVal!=null) cs.companyId=coVal; const invEmail=getV('c-inv'); if(invEmail!=null){ cs.investigatorEmail=invEmail; const u=DATA.users.find(x=>x.email===invEmail)||null; cs.investigatorName=u?u.name:''; } setIf('status', getV('c-status')); setIf('priority', getV('c-priority')); const idEl=document.getElementById('c-id'); if(idEl && idEl.value){ cs.fileNumber=idEl.value.trim(); } alert('Case saved'); return;}
if(act==='deleteCase'){ const cs=findCase(arg); if(!cs){ alert('Case not found'); return; } if(confirm('Delete this case ('+(cs.fileNumber||cs.title||cs.id)+') ?')){ DATA.cases = DATA.cases.filter(c=>c.id!==cs.id); App.set({route:'cases', currentCaseId:null}); } return; }
if(act==='addNote'){const cs=findCase(arg); if(!cs) return; const text=document.getElementById('note-text').value; if(!text){alert('Enter a note');return;} const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes.unshift({time:stamp,by:me,text}); App.set({}); return;}
if(act==='addStdTasks'){const cs=findCase(arg); if(!cs) return; const base=cs.tasks, add=['Gather documents','Interview complainant','Interview respondent','Write report']; add.forEach(a=>base.push({id:'T-'+(base.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'})); App.set({}); return;}
if(act==='addTask'){const cs=findCase(arg); if(!cs) return; const sel=document.getElementById('task-assignee'); const who=sel.options[sel.selectedIndex].text; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,assignee:who,due:document.getElementById('task-due').value,status:'Open'}); App.set({}); return;}

// case docs
if(act==='addFolderPrompt'){const cs=findCase(arg); if(!cs) return; const name=prompt('New folder name'); if(!name) return; cs.folders[name]=cs.folders[name]||[]; App.set({}); return;}
if(act==='selectFiles'){App.state.currentUploadTarget=arg||((App.state.currentCaseId||'')+'::General'); const fi=document.getElementById('file-input'); if(fi) fi.click(); return;}
if(act==='viewDoc'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; const list=cs.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeDoc'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; cs.folders[p[1]]=(cs.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({}); return;}
if(act==='deleteFolder'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General');return;} if(confirm('Delete folder '+folder+' and its files?')){delete cs.folders[folder]; App.set({});} return;}

// contacts
if(act==='newContact'){const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:'',notes:''}; DATA.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
if(act==='newContactForCompany'){const coId=arg; const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:coId,notes:''}; DATA.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
if(act==='saveContact'){const c=findContact(arg); if(!c) return; c.name=document.getElementById('ct-name').value; c.email=document.getElementById('ct-email').value; c.phone=document.getElementById('ct-phone').value; c.org=document.getElementById('ct-org').value; c.companyId=document.getElementById('ct-company').value; c.notes=document.getElementById('ct-notes').value; alert('Contact saved'); return;}
if(act==='deleteContact'){ const c=findContact(arg); if(!c){ alert('Contact not found'); return; } if(confirm('Delete this contact ('+(c.name||c.email||c.id)+') ?')){ DATA.contacts = DATA.contacts.filter(x=>x.id!==c.id); App.set({route:'contacts', currentContactId:null}); } return; }
if(act==='emailContact'){const c=findContact(arg); if(c && c.email){ window.location='mailto:'+c.email; } return;}

// companies
if(act==='newCompany'){const co={id:'C-'+('00'+(d.companies.length+1)).slice(-3),name:'New Company',folders:{General:[]}}; d.companies.unshift(co); App.set({currentCompanyId:co.id,companyEdit:true,route:'company'}); return;}
if(act==='editCompany'){App.set({companyEdit:true}); return;}
if(act==='cancelCompanyEdit'){App.set({companyEdit:false}); return;}
if(act==='saveCompany'){const co=findCompany(arg); if(!co) return; const g=id=>{const el=document.getElementById(id); return el?el.value:'';}; co.name=g('co-name'); co.tradingName=g('co-trading'); co.abn=g('co-abn'); co.acn=g('co-acn'); co.phone=g('co-phone'); co.email=g('co-email'); co.website=g('co-website'); co.industry=g('co-industry'); co.type=g('co-type'); co.city=g('co-city'); co.state=g('co-state'); co.postcode=g('co-postcode'); co.notes=g('co-notes'); alert('Company saved'); App.set({companyEdit:false}); return;}
if(act==='deleteCompany'){const co=findCompany(arg); if(!co) return; if(confirm('Delete '+(co.name||co.id)+'?')){ DATA.companies = DATA.companies.filter(x=>x.id!==co.id); App.set({route:'companies', currentCompanyId:null}); } return;}

// company docs
if(act==='addCompanyFolderPrompt'){const co=findCompany(arg); if(!co) return; const name=prompt('New folder name'); if(!name) return; co.folders[name]=co.folders[name]||[]; App.set({}); return;}
if(act==='selectCompanyFiles'){App.state.currentCompanyUploadTarget=arg||((App.state.currentCompanyId||'')+'::General'); const fi=document.getElementById('co-file-input'); if(fi) fi.click(); return;}
if(act==='viewCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const list=co.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({}); return;}
if(act==='deleteCompanyFolder'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General');return;} if(confirm('Delete folder '+folder+' and its files?')){delete co.folders[folder]; App.set({});} return;}

// resources
if(act==='selectResTemplates'){const fi=document.getElementById('rs-file-templates'); if(fi) fi.click(); return;}
if(act==='selectResProcedures'){const fi=document.getElementById('rs-file-procedures'); if(fi) fi.click(); return;}
if(act==='viewResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; const list=(kind==='templates')?DATA.resources.templates:DATA.resources.procedures; const f=list.find(x=>x.name===name && x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; if(kind==='templates'){DATA.resources.templates=DATA.resources.templates.filter(x=>x.name!==name);} else {DATA.resources.procedures=DATA.resources.procedures.filter(x=>x.name!==name);} App.set({}); return;}

// filters
if(act==='resetCaseFilters'){App.state.casesFilter={q:""}; try{localStorage.removeItem('synergy_filters_cases_v2104');}catch(_){ } App.set({}); return;}
});

// change handlers
document.addEventListener('change',e=>{
  if(e.target && e.target.id==='flt-q'){const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({});}
  // Case files
  if(e.target && e.target.id==='file-input'){ const tgt=(App.state.currentUploadTarget||'').split('::'); const caseId=tgt[0], folder=tgt[1]||'General'; const cs=findCase(caseId); if(!cs) return; cs.folders[folder]=cs.folders[folder]||[]; const files=e.target.files||[]; const reader = (file)=> new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({name:file.name,size:file.size,dataUrl:r.result}); r.readAsDataURL(file); }); (async()=>{ for(let i=0;i<files.length;i++){ const f=await reader(files[i]); cs.folders[folder].push(f);} App.set({}); })(); }
  // Company files
  if(e.target && e.target.id==='co-file-input'){ const tgt=(App.state.currentCompanyUploadTarget||'').split('::'); const coId=tgt[0], folder=tgt[1]||'General'; const co=findCompany(coId); if(!co) return; co.folders[folder]=co.folders[folder]||[]; const files=e.target.files||[]; const reader = (file)=> new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({name:file.name,size:file.size,dataUrl:r.result}); r.readAsDataURL(file); }); (async()=>{ for(let i=0;i<files.length;i++){ const f=await reader(files[i]); co.folders[folder].push(f);} App.set({}); })(); }
});

document.addEventListener('DOMContentLoaded',()=>{ App.set({route:'dashboard'});});
})();