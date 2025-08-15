
(function(){ "use strict";
const BUILD="v2.11.0"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);

// ---------- Helpers ----------
function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

// Seed
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",
         investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",
         created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]}};
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
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
    mkCase(YEAR,2,{title:"Sexual harassment allegation at Brisbane site",organisation:"Queensland Health (Metro North)",companyId:"C-003",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Planning",priority:"Critical",created:YEAR+"-06"}),
    mkCase(YEAR,3,{title:"Misconduct – data exfiltration",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"chris@synergy.com",investigatorName:"Chris Rice",status:"Evidence Review",priority:"Medium",created:YEAR+"-07"})
  ],
  resources:{folders:{General:[]}},
  timesheets:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// Utilities
const findCase   = id => DATA.cases.find(c=>c.id===id)||null;
const findCompany= id => DATA.companies.find(c=>c.id===id)||null;
const findContact= id => DATA.contacts.find(c=>c.id===id)||null;

// App state
const App={
  state:{
    route:"dashboard",
    currentCaseId:null,
    currentContactId:null,
    currentCompanyId:null,
    currentUploadTarget:null,              // case docs target
    currentCompanyUploadTarget:null,       // company docs target
    currentResUploadTarget:"General",      // resources folder
    asUser:null,
    casesFilter:{q:""}
  },
  set(p){Object.assign(this.state,p||{}); render();},
  get(){return DATA;}
};

// ---------- Layout ----------
function Topbar(){
  return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'
       + (App.state.asUser?('<span class="chip">Viewing as '+(App.state.asUser.name||App.state.asUser.email)+' ('+App.state.asUser.role+')</span> <button class="btn light" data-act="exitPortal">Exit</button> '):'')
       + '<span class="badge">Soft Stable '+BUILD+'</span></div>';
}
function Sidebar(active){
  const base=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'];
  for(const it of base){ out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>'); }
  out.push('</ul></aside>'); return out.join('');
}
function Shell(content,active){
  return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>';
}

// ---------- Dashboard ----------
function Dashboard(){
  const d=App.get(); let rows='';
  for(const c of d.cases.slice(0,6)){
    rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';
  }
  const tbl='<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
  const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div></div><div class="mono">Build: '+STAMP+'</div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header>'+tbl+'</div>';
  return Shell(html,'dashboard');
}

// ---------- Cases ----------
function Cases(){
  const d=App.get(), f=App.state.casesFilter||{q:""};
  const list=d.cases.filter(c=>{ if(!f.q) return true; const q=f.q.toLowerCase(); return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q); });
  let rows=''; for(const cc of list){ rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>'; }
  const tools='<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="'+(f.q||'')+'"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>';
  return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');
}

function CasePage(id){
  const d=App.get(), cs=findCase(id);
  if(!cs){ alert('Case not found'); App.set({route:'cases'}); return Shell('<div class="card">Case not found.</div>','cases'); }
  const invOpts=()=>d.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join('');
  const coOpts=()=>d.companies.map(co=>'<option '+(co.id===cs.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>').join('');
  if(!cs.folders) cs.folders={General:[]};

  const header = '<div class="card">'
    + '<div style="display:flex;align-items:center;gap:8px">'
    +   '<h2>Case '+cs.fileNumber+'</h2><div class="sp"></div>'
    +   '<button class="btn" data-act="saveCase" data-arg="'+id+'">Save Case</button> '
    +   '<button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete Case</button> '
    +   '<button class="btn light" data-act="route" data-arg="cases">Back to Cases</button>'
    + '</div></div>';

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
    + '</div></div>';

  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
  for(const nn of (cs.notes||[])){ notesRows+='<tr><td>'+ (nn.time||'') +'</td><td>'+ (nn.by||'') +'</td><td>'+ (nn.text||'') +'</td></tr>'; }
  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  for(const tt of (cs.tasks||[])){ taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>'; }

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
  for(const fname in cs.folders){
    if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue;
    const files=cs.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){ docRows+='<tr><td colspan="3" class="muted">No files</td></tr>'; }
    for(const ff of files){
      const a=id+'::'+fname+'::'+ff.name;
      docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>';
    }
  }
  const docs = '<div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';

  return Shell(header + leftDetails + blocks + docs, 'cases');
}

// ---------- Contacts ----------
function Contacts(){
  const d=App.get(); const coName=id=>{const co=findCompany(id); return co?co.name:"";};
  let rows=''; for(const c of d.contacts){ rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>'; }
  return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');
}

function ContactPage(id){
  const d=App.get(), c=findContact(id); if(!c) return Shell('<div class="card">Contact not found.</div>','contacts');
  const coOpts=()=>['<option value="">(No linked company)</option>'].concat(d.companies.map(co=>'<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>')).join('');
  let existing=d.users.find(u=>(u.email||'').toLowerCase()===(c.email||'').toLowerCase())||null; let headerBtns='', portalBody='';
  if(c.email){
    if(existing){
      headerBtns='<button class="btn light" data-act="viewPortalAs" data-arg="'+id+'">View portal</button> <button class="btn light" data-act="updatePortal" data-arg="'+id+'">Update Role</button> <button class="btn light" data-act="revokePortal" data-arg="'+id+'">Revoke</button>';
      portalBody='<div class="grid cols-3"><div><label>Status</label><div class="chip">Enabled</div></div><div><label>Role</label><select class="input" id="cp-role"><option '+(existing.role==='Admin'?'selected':'')+'>Admin</option><option '+(existing.role==='Investigator'?'selected':'')+'>Investigator</option><option '+(existing.role==='Reviewer'?'selected':'')+'>Reviewer</option><option '+(existing.role==='Client'?'selected':'')+'>Client</option></select></div><div></div></div>';
    } else {
      headerBtns='<button class="btn" data-act="grantPortal" data-arg="'+id+'">Grant Access</button> <button class="btn light" data-act="grantAndView" data-arg="'+id+'">Grant & view</button>';
      portalBody='<div class="grid cols-3"><div><label>Role</label><select class="input" id="cp-role"><option>Client</option><option>Investigator</option><option>Reviewer</option><option>Admin</option></select></div><div><label>Email</label><input class="input" id="cp-email" value="'+(c.email||'')+'"></div><div></div></div><div class="muted">Granting access creates a user with this email in-memory.</div>';
    }
  } else {
    portalBody='<div class="muted">Add an email to enable portal access.</div>';
  }
  let html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteContact" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="contacts">Back to Contacts</button></div><div class="grid cols-4" style="margin-top:12px"><div><label>Contact Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Phone</label><input class="input" id="ct-phone" value="'+(c.phone||'')+'"></div><div><label>Position/Org</label><input class="input" id="ct-org" value="'+(c.org||'')+'"></div><div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">'+coOpts()+'</select></div><div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">'+(c.notes||'')+'</textarea></div></div></div>' + '<div class="section"><header><h3 class="section-title">Portal Access</h3><div>'+headerBtns+'</div></header>'+ portalBody +'</div>';
  return Shell(html,'contacts');
}

// ---------- Companies ----------
function Companies(){
  const d=App.get();
  const countContacts=cid=>d.contacts.filter(c=>c.companyId===cid).length;
  const countCases=cid=>d.cases.filter(c=>c.companyId===cid).length;
  let rows=''; for(const co of d.companies){ rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>'; }
  return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');
}


function CompanyPage(id){
  const d=App.get(), co=findCompany(id);
  if(!co){ alert('Company not found'); App.set({route:'companies'}); return Shell('<div class="card">Company not found.</div>','companies'); }
  co.address = co.address || { line1:'', line2:'', city:'', state:'', postcode:'', country:'' };
  co.postal  = co.postal  || { line1:'', line2:'', city:'', state:'', postcode:'', country:'' };
  co.billing = co.billing || { name:'', phone:'', email:'' };
  co.mainContact = co.mainContact || { name:'', phone:'', email:'' };
  co.folders = co.folders || { General:[] };
  const same = !!co.postalSame;
  const mode = App.state.companyViewMode || 'view';

  function buildFiles(){
    var out='';
    for(var fname in co.folders){
      if(!Object.prototype.hasOwnProperty.call(co.folders,fname)) continue;
      var files=co.folders[fname]||[];
      out+='<tr><th colspan="3">'+fname+'</th></tr>';
      out+='<tr><td colspan="3" class="right">'
        + '<button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::'+fname+'">Upload to '+fname+'</button> '
        + (fname==='General' ? '' : '<button class="btn light" data-act="deleteCompanyFolder" data-arg="'+co.id+'::'+fname+'">Delete folder</button>')
        + '</td></tr>';
      if(!files.length){ out+='<tr><td colspan="3" class="muted">No files</td></tr>'; }
      for(var i=0;i<files.length;i++){
        var f=files[i]; var a=co.id+'::'+fname+'::'+f.name;
        var viewBtn = f.dataUrl ? '<button class="btn light" data-act="viewCompanyDoc" data-arg="'+a+'">View</button> ' : '';
        out+='<tr><td>'+f.name+'</td><td>'+(f.size||'')+'</td><td class="right">'+viewBtn+'<button class="btn light" data-act="removeCompanyDoc" data-arg="'+a+'">Remove</button></td></tr>';
      }
    }
    return out;
  }

  var header = '<div class="card"><div style="display:flex;align-items:center;gap:8px">'
    + '<h2>Company</h2><div class="sp"></div>'
    + (mode==='view' ? '<button class="btn" data-act="editCompany">Edit</button>' : '<button class="btn" data-act="saveCompany" data-arg="'+co.id+'">Save</button> <button class="btn light" data-act="viewCompany">Cancel</button>')
    + ' <button class="btn danger" data-act="deleteCompany" data-arg="'+co.id+'">Delete</button>'
    + ' <button class="btn success" data-act="newCaseForCompany" data-arg="'+co.id+'">New Case</button>'
    + ' <button class="btn light" data-act="route" data-arg="companies">Back</button>'
    + '</div></div>';

  if(mode==='view'){
    var about = '<div class="section"><header><h3 class="section-title">About this company</h3></header>'
      + '<div class="card grid cols-2">'
      + '<div><label>Domain</label><div>'+(co.website||'')+'</div></div>'
      + '<div><label>Industry</label><div>'+(co.industry||'')+'</div></div>'
      + '<div><label>Type</label><div>'+(co.type||'')+'</div></div>'
      + '<div><label>City</label><div>'+(co.address.city||'')+'</div></div>'
      + '<div><label>State</label><div>'+(co.address.state||'')+'</div></div>'
      + '<div><label>Postcode</label><div>'+(co.address.postcode||'')+'</div></div>'
      + '<div><label>ABN</label><div>'+(co.abn||'')+'</div></div>'
      + '<div><label>ACN</label><div>'+(co.acn||'')+'</div></div>'
      + '</div></div>';

    var contacts = d.contacts.filter(function(c){return c.companyId===co.id;});
    var contactRows = contacts.length ? contacts.map(function(c){
      return '<tr><td>'+c.name+'</td><td>'+(c.email||'')+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>';
    }).join('') : '<tr><td colspan="3" class="muted">No contacts yet.</td></tr>';

    var linkedCases = d.cases.filter(function(cs){return cs.companyId===co.id;});
    var caseRows = linkedCases.length ? linkedCases.map(function(cs){
      return '<tr><td>'+cs.fileNumber+'</td><td>'+cs.title+'</td><td>'+cs.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cs.id+'">Open Case</button></td></tr>';
    }).join('') : '<tr><td colspan="4" class="muted">No cases yet.</td></tr>';

    var profile = '<div class="grid cols-2">'
      + '<div class="card">'
      +   '<div style="display:flex;align-items:center;gap:12px">'
      +     '<div style="width:40px;height:40px;border-radius:999px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-weight:700">'+(co.name?co.name.slice(0,1):'C')+'</div>'
      +     '<div><div style="font-weight:700">'+(co.name||'')+'</div><div class="muted">'+(co.phone||'')+' · '+(co.email||'')+'</div></div>'
      +   '</div>'
      +   about
      + '</div>'
      + '<div>'
      +   '<div class="section"><header><h3 class="section-title">Related Contacts</h3></header><div class="card"><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>'+contactRows+'</tbody></table></div></div>'
      +   '<div class="section"><header><h3 class="section-title">Related Cases</h3></header><div class="card"><table><thead><tr><th>Case ID</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>'+caseRows+'</tbody></table></div></div>'
      +   '<div class="section"><header><h3 class="section-title">Company Documents</h3><div><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+co.id+'">Add folder</button> <button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::General">Select files</button></div></header>'
      +   '<input type="file" id="co-file-input" multiple style="display:none">'
      +   '<div class="card"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+buildFiles()+'</tbody></table></div></div>'
      + '</div>'
      + '</div>';
    return Shell(header + profile, 'companies');
  }

  // EDIT mode form
  var details = '<div class="section"><header><h3 class="section-title">Company Details</h3></header>'
    + '<div class="card grid cols-2">'
    + '<div><label>ID</label><input class="input" value="'+co.id+'" disabled></div>'
    + '<div><label>Legal Name</label><input class="input" id="co-name" value="'+(co.name||'')+'"></div>'
    + '<div><label>Trading Name</label><input class="input" id="co-trading" value="'+(co.tradingName||'')+'"></div>'
    + '<div><label>ABN</label><input class="input" id="co-abn" value="'+(co.abn||'')+'" placeholder="12 345 678 901"></div>'
    + '<div><label>ACN</label><input class="input" id="co-acn" value="'+(co.acn||'')+'"></div>'
    + '<div><label>Phone</label><input class="input" id="co-phone" value="'+(co.phone||'')+'"></div>'
    + '<div><label>Email</label><input class="input" id="co-email" value="'+(co.email||'')+'"></div>'
    + '<div><label>Website</label><input class="input" id="co-web" value="'+(co.website||'')+'"></div>'
    + '<div><label>Industry</label><input class="input" id="co-industry" value="'+(co.industry||'')+'"></div>'
    + '<div><label>Type</label><input class="input" id="co-type" value="'+(co.type||'')+'"></div>'
    + '<div style="grid-column:span 2"><label>Notes</label><textarea class="input" id="co-notes">'+(co.notes||'')+'</textarea></div>'
    + '</div></div>';

  var contactsSec = '<div class="section"><header><h3 class="section-title">Contacts</h3></header>'
    + '<div class="card grid cols-2">'
    + '<div><label>Main Contact Name</label><input class="input" id="co-main-name" value="'+(co.mainContact.name||'')+'"></div>'
    + '<div><label>Main Contact Phone</label><input class="input" id="co-main-phone" value="'+(co.mainContact.phone||'')+'"></div>'
    + '<div style="grid-column:span 2"><label>Main Contact Email</label><input class="input" id="co-main-email" value="'+(co.mainContact.email||'')+'"></div>'
    + '<div><label>Billing Contact Name</label><input class="input" id="co-bill-name" value="'+(co.billing.name||'')+'"></div>'
    + '<div><label>Billing Contact Phone</label><input class="input" id="co-bill-phone" value="'+(co.billing.phone||'')+'"></div>'
    + '<div style="grid-column:span 2"><label>Billing Contact Email</label><input class="input" id="co-bill-email" value="'+(co.billing.email||'')+'"></div>'
    + '</div></div>';

  var addresses = '<div class="section"><header><h3 class="section-title">Addresses</h3></header>'
    + '<div class="grid cols-2">'
    +   '<div class="card">'
    +     '<h4>Street Address</h4>'
    +     '<label>Line 1</label><input class="input" id="co-addr-1" value="'+(co.address.line1||'')+'">'
    +     '<label>Line 2</label><input class="input" id="co-addr-2" value="'+(co.address.line2||'')+'">'
    +     '<label>City</label><input class="input" id="co-addr-city" value="'+(co.address.city||'')+'">'
    +     '<label>State</label><input class="input" id="co-addr-state" value="'+(co.address.state||'')+'">'
    +     '<label>Postcode</label><input class="input" id="co-addr-post" value="'+(co.address.postcode||'')+'">'
    +     '<label>Country</label><input class="input" id="co-addr-country" value="'+(co.address.country||'Australia')+'">'
    +   '</div>'
    +   '<div class="card">'
    +     '<div style="display:flex;justify-content:space-between;align-items:center">'
    +       '<h4>Postal Address</h4>'
    +       '<label><input type="checkbox" id="co-postal-same" '+(same?'checked':'')+'> Same as street</label>'
    +     '</div>'
    +     '<label>Line 1</label><input class="input" id="co-post-1" value="'+(co.postal.line1||'')+'" '+(same?'disabled':'')+'>'
    +     '<label>Line 2</label><input class="input" id="co-post-2" value="'+(co.postal.line2||'')+'" '+(same?'disabled':'')+'>'
    +     '<label>City</label><input class="input" id="co-post-city" value="'+(co.postal.city||'')+'" '+(same?'disabled':'')+'>'
    +     '<label>State</label><input class="input" id="co-post-state" value="'+(co.postal.state||'')+'" '+(same?'disabled':'')+'>'
    +     '<label>Postcode</label><input class="input" id="co-post-post" value="'+(co.postal.postcode||'')+'" '+(same?'disabled':'')+'>'
    +     '<label>Country</label><input class="input" id="co-post-country" value="'+(co.postal.country||'Australia')+'" '+(same?'disabled':'')+'>'
    +   '</div>'
    + '</div></div>';

  var docs = '<div class="section"><header><h3 class="section-title">Company Documents</h3>'
    + '<div><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+co.id+'">Add folder</button> '
    + '<button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::General">Select files</button></div></header>'
    + '<input type="file" id="co-file-input" multiple style="display:none">'
    + '<div class="card"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+buildFiles()+'</tbody></table></div></div>';

  return Shell(header + details + contactsSec + addresses + docs, 'companies');
}


// ---------- Documents ----------
function Documents(){
  const d=App.get(); let rows='';
  for(const c of d.cases){ let count=0; for(const k in c.folders){ if(Object.prototype.hasOwnProperty.call(c.folders,k)) count+=c.folders[k].length; } rows+='<tr><td>'+c.fileNumber+'</td><td>'+count+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>'; }
  return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents');
}

// ---------- Resources (with folders) ----------
function Resources(){
  const d=App.get(); d.resources = d.resources || {}; d.resources.folders = d.resources.folders || { General:[] };
  const makeRows = () => {
    const rows=[];
    const folders=d.resources.folders;
    for(const fname in folders){
      if(!Object.prototype.hasOwnProperty.call(folders,fname)) continue;
      const files=folders[fname]||[];
      rows.push(`<tr><th colspan="3">${fname}</th></tr>`);
      rows.push(`<tr><td colspan="3" class="right">
        <button class="btn light" data-act="selectResFiles" data-arg="${fname}">Upload to ${fname}</button>
        ${fname==='General'?'':`<button class="btn light" data-act="deleteResFolder" data-arg="${fname}">Delete folder</button>`}
      </td></tr>`);
      if(!files.length){ rows.push(`<tr><td colspan="3" class="muted">No files</td></tr>`); }
      for(const f of files){
        const a = `${fname}::${f.name}`;
        rows.push(`<tr><td>${f.name}</td><td>${f.size||''}</td><td class="right">
          ${f.dataUrl?`<button class="btn light" data-act="viewResFile" data-arg="${a}">View</button> `:''}
          <button class="btn light" data-act="removeResFile" data-arg="${a}">Remove</button>
        </td></tr>`);
      }
    }
    return rows.join("");
  };
  const rowsHtml = makeRows();
  const html = `
    <div class="section">
      <header>
        <h3 class="section-title">Resources</h3>
        <div>
          <button class="btn light" data-act="addResFolderPrompt">Add folder</button>
          <button class="btn light" data-act="selectResFiles" data-arg="General">Select files</button>
        </div>
      </header>
      <input type="file" id="rs-file-any" multiple style="display:none">
      <div class="card">
        <table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>${rowsHtml}</tbody></table>
      </div>
    </div>`;
  return Shell(html,'resources');
}

// ---------- Render ----------
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
  else if(r==='admin') el.innerHTML= (typeof Admin!=='undefined' && Admin) ? Admin() : '<div class="card">Admin not available</div>';
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}

// ---------- Actions ----------
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();

  // nav
  if(act==='route'){App.set({route:arg});return;}
  if(act==='openCase'){App.set({currentCaseId:arg,route:'case'});return;}
  if(act==='openCompany'){App.set({currentCompanyId:arg,route:'company',companyViewMode:'view'});return;}
if(act==='editCompany'){App.set({companyViewMode:'edit'});return;}
if(act==='viewCompany'){App.set({companyViewMode:'view'});return;}

  // companies
  if(act==='newCompany'){
    const nid='C-'+String(DATA.companies.length+1).padStart(3,'0');
    const co={id:nid,name:'New Company',folders:{General:[]}};
    DATA.companies.unshift(co);
    App.set({currentCompanyId:co.id,route:'company'});
    return;
  }
  if(act==='saveCompany'){
    const co=findCompany(arg); if(!co) return;
    const getV=id=>{ const el=document.getElementById(id); return el?el.value:''; };
    const getB=id=>{ const el=document.getElementById(id); return !!(el&&el.checked); };
    co.name = getV('co-name'); co.tradingName=getV('co-trading'); co.abn=getV('co-abn'); co.acn=getV('co-acn');
    co.phone=getV('co-phone'); co.email=getV('co-email'); co.website=getV('co-web'); co.notes=getV('co-notes');
    co.address=co.address||{}; co.postal=co.postal||{}; co.billing=co.billing||{}; co.mainContact=co.mainContact||{};
    co.mainContact.name=getV('co-main-name'); co.mainContact.phone=getV('co-main-phone'); co.mainContact.email=getV('co-main-email');
    co.billing.name=getV('co-bill-name'); co.billing.phone=getV('co-bill-phone'); co.billing.email=getV('co-bill-email');
    co.address.line1=getV('co-addr-1'); co.address.line2=getV('co-addr-2'); co.address.city=getV('co-addr-city'); co.address.state=getV('co-addr-state'); co.address.postcode=getV('co-addr-post'); co.address.country=getV('co-addr-country');
    const same=getB('co-postal-same'); co.postalSame=same;
    if(same){ co.postal={...co.address}; } else {
      co.postal.line1=getV('co-post-1'); co.postal.line2=getV('co-post-2'); co.postal.city=getV('co-post-city'); co.postal.state=getV('co-post-state'); co.postal.postcode=getV('co-post-post'); co.postal.country=getV('co-post-country');
    }
    alert('Company saved'); App.set({companyViewMode:'view'}); return;
  }
  if(act==='deleteCompany'){
    const co=findCompany(arg); if(!co) return;
    const hasCases = DATA.cases.some(c=>c.companyId===co.id);
    if(hasCases && !confirm('This company has linked cases. Delete anyway?')) return;
    DATA.companies=DATA.companies.filter(c=>c.id!==co.id);
    if(hasCases){ DATA.cases=DATA.cases.filter(c=>c.companyId!==co.id); }
    App.set({route:'companies',currentCompanyId:null}); return;
  }
  if(act==='newCaseForCompany'){
    const co=findCompany(arg); if(!co) return;
    const seq=('00'+(DATA.cases.length+1)).slice(-3);
    const inv=DATA.users[0]||{name:'',email:''};
    const created=(new Date()).toISOString().slice(0,7);
    const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:co.name,companyId:co.id,investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}};
    DATA.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'}); return;
  }

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
  if(act==='openContact'){App.set({currentContactId:arg,route:'contact'});return;}
  if(act==='newContact'){const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:'',notes:''}; DATA.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
  if(act==='saveContact'){const c=findContact(arg); if(!c) return; c.name=document.getElementById('ct-name').value; c.email=document.getElementById('ct-email').value; c.phone=document.getElementById('ct-phone').value; c.org=document.getElementById('ct-org').value; c.companyId=document.getElementById('ct-company').value; c.notes=document.getElementById('ct-notes').value; alert('Contact saved'); return;}
  if(act==='deleteContact'){ const c=findContact(arg); if(!c){ alert('Contact not found'); return; } if(confirm('Delete this contact ('+(c.name||c.email||c.id)+') ?')){ DATA.contacts = DATA.contacts.filter(x=>x.id!==c.id); App.set({route:'contacts', currentContactId:null}); } return; }

  // portal access
  if(act==='grantPortal'){const c=findContact(arg); if(!c) return; const email=(document.getElementById('cp-email')?document.getElementById('cp-email').value:'')||c.email; if(!email){alert('Email required');return;} const role=document.getElementById('cp-role').value||'Client'; let exists=d.users.find(u=>(u.email||'').toLowerCase()===email.toLowerCase()); if(!exists) d.users.push({name:c.name||email,email,role}); else exists.role=role; alert('Access granted'); App.set({}); return;}
  if(act==='grantAndView'){const c=findContact(arg); if(!c) return; const email=(document.getElementById('cp-email')?document.getElementById('cp-email').value:'')||c.email; if(!email){alert('Email required');return;} const role=document.getElementById('cp-role').value||'Client'; let user=d.users.find(u=>(u.email||'').toLowerCase()===email.toLowerCase()); if(!user){user={name:c.name||email,email,role}; d.users.push(user);} App.set({asUser:user,route:'portal'}); return;}
  if(act==='updatePortal'){const c=findContact(arg); if(!c) return; const email=(c.email||'').toLowerCase(); if(!email){alert('Add an email first');return;} const role=document.getElementById('cp-role').value||'Client'; d.users.forEach(u=>{if((u.email||'').toLowerCase()===email) u.role=role;}); alert('Role updated'); App.set({}); return;}
  if(act==='revokePortal'){const c=findContact(arg); if(!c) return; const email=(c.email||'').toLowerCase(); d.users=d.users.filter(u=>(u.email||'').toLowerCase()!==email); alert('Access revoked'); App.set({}); return;}
  if(act==='viewPortalAs'){const c=findContact(arg); if(!c) return; const user=d.users.find(u=>(u.email||'').toLowerCase()===(c.email||'').toLowerCase()); if(!user){alert('No portal user for this contact');return;} App.set({asUser:user,route:'portal'}); return;}
  if(act==='exitPortal'){App.set({asUser:null,route:'contacts'}); return;}

  // company docs
  if(act==='addCompanyFolderPrompt'){ const co=findCompany(arg); if(!co) return; const name=prompt('New folder name'); if(!name) return; co.folders = co.folders||{General:[]}; co.folders[name]=co.folders[name]||[]; App.set({}); return; }
  if(act==='selectCompanyFiles'){ App.state.currentCompanyUploadTarget=arg||((App.state.currentCompanyId||'')+'::General'); const fi=document.getElementById('co-file-input'); if(fi) fi.click(); return; }
  if(act==='viewCompanyDoc'){ const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const list=(co.folders&&co.folders[p[1]])||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return; }
  if(act==='removeCompanyDoc'){ const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const fname=p[2]; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==fname); App.set({}); return; }
  if(act==='deleteCompanyFolder'){ const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const folder=p[1]; if(folder==='General'){ alert('Cannot delete General'); return; } if(confirm('Delete folder '+folder+' and its files?')){ delete co.folders[folder]; App.set({}); } return; }

  // resources folders
  if(act==='addResFolderPrompt'){ const name=prompt('New folder name'); if(!name) return; DATA.resources = DATA.resources||{}; DATA.resources.folders = DATA.resources.folders||{General:[]}; DATA.resources.folders[name]=DATA.resources.folders[name]||[]; App.set({}); return; }
  if(act==='selectResFiles'){ App.state.currentResUploadTarget=arg||'General'; const fi=document.getElementById('rs-file-any'); if(fi) fi.click(); return; }
  if(act==='viewResFile'){ const p=arg.split('::'); const folder=p[0], name=p[1]; const list=(DATA.resources.folders&&DATA.resources.folders[folder])||[]; const f=list.find(x=>x.name===name && x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return; }
  if(act==='removeResFile'){ const p=arg.split('::'); const folder=p[0], name=p[1]; DATA.resources.folders[folder]=(DATA.resources.folders[folder]||[]).filter(x=>x.name!==name); App.set({}); return; }
  if(act==='deleteResFolder'){ const folder=arg; if(folder==='General'){alert('Cannot delete General'); return;} if(confirm('Delete folder '+folder+' and its files?')){ delete DATA.resources.folders[folder]; App.set({}); } return; }

  // filters
  if(act==='resetCaseFilters'){App.state.casesFilter={q:""}; try{localStorage.removeItem('synergy_filters_cases_v21');}catch(_){ } App.set({}); return;}
});

// ---------- Change listeners (uploads + filters) ----------
document.addEventListener('change',e=>{
  // cases search
  if(e.target && e.target.id==='flt-q'){
    const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f;
    try{localStorage.setItem('synergy_filters_cases_v21', JSON.stringify(f));}catch(_){ }
    App.set({}); return;
  }
  // case docs upload
  if(e.target && e.target.id==='file-input'){
    const target=App.state.currentUploadTarget || ((App.state.currentCaseId||'')+'::General');
    const [caseId, folder='General'] = (target||'').split('::');
    const cs=findCase(caseId); const fi=e.target;
    if(!cs){ fi.value=''; return; }
    cs.folders = cs.folders || {General:[]}; const list = cs.folders[folder] = cs.folders[folder] || [];
    const jobs = Array.from(fi.files||[]).map(f=>new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({name:f.name,size:f.size,dataUrl:r.result}); r.readAsDataURL(f);}));
    Promise.all(jobs).then(files=>{ files.forEach(ff=>list.push(ff)); fi.value=''; App.set({}); });
    return;
  }
  // company docs upload
  if(e.target && e.target.id==='co-file-input'){
    const target=App.state.currentCompanyUploadTarget || ((App.state.currentCompanyId||'')+'::General');
    const [companyId, folder='General'] = (target||'').split('::');
    const co=findCompany(companyId); const fi=e.target;
    if(!co){ fi.value=''; return; }
    co.folders = co.folders || {General:[]}; const list = co.folders[folder] = co.folders[folder] || [];
    const jobs = Array.from(fi.files||[]).map(f=>new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({name:f.name,size:f.size,dataUrl:r.result}); r.readAsDataURL(f);}));
    Promise.all(jobs).then(files=>{ files.forEach(ff=>list.push(ff)); fi.value=''; App.set({}); });
    return;
  }
  // resources upload
  if(e.target && e.target.id==='rs-file-any'){
    const folder = App.state.currentResUploadTarget || 'General';
    DATA.resources = DATA.resources || {}; DATA.resources.folders = DATA.resources.folders || {General:[]};
    const list = DATA.resources.folders[folder] = DATA.resources.folders[folder] || [];
    const fi=e.target;
    const jobs = Array.from(fi.files||[]).map(f=>new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({name:f.name,size:f.size,dataUrl:r.result}); r.readAsDataURL(f);}));
    Promise.all(jobs).then(files=>{ files.forEach(ff=>list.push(ff)); fi.value=''; App.set({}); });
    return;
  }
});

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded',()=>{ App.set({route:'dashboard'}); });
})();