(function(){ "use strict";
const BUILD="v2.10.9"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);
// ---- Session helpers (normalize & persist) ----
const SESS_STORE_KEY = 'synergy_userSessions_v1';
function normEmail(e){ return (e||'').trim().toLowerCase(); }
function sessionKeyForEmail(e){ const s=normEmail(e); return s||null; }
function sessionKeyForContact(c){
  const e = sessionKeyForEmail(c && c.email);
  return e ? ('mail:'+e) : (c && c.id ? ('contact:'+c.id) : null);
}
function loadUserSessions(){
  try{
    const raw = localStorage.getItem(SESS_STORE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    DATA.userSessions = DATA.userSessions || {};
    Object.keys(obj||{}).forEach(k=>{ DATA.userSessions[k]=obj[k]; });
    Object.keys(DATA.userSessions||{}).forEach(k=>{
      if(k.indexOf('mail:')===0 || k.indexOf('contact:')===0) return;
      const nk = 'mail:'+normEmail(k);
      if(!DATA.userSessions[nk]) DATA.userSessions[nk]=DATA.userSessions[k];
      if(nk!==k) delete DATA.userSessions[k];
    });
  }catch(e){ DATA.userSessions = DATA.userSessions || {}; }
}
function saveUserSessions(){
  try{ localStorage.setItem(SESS_STORE_KEY, JSON.stringify(DATA.userSessions||{})); }catch(e){}
}

function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

// ---- Activity / Audit helpers ----
function nowStamp(){ return new Date().toISOString().replace('T',' ').slice(0,16); }
function actor(){ return (DATA.me && DATA.me.email) || 'admin@synergy.com'; }

function ensureActivity(cs){ cs.activity = cs.activity || []; return cs.activity; }
function logCase(cs, type, details){
  const a = ensureActivity(cs);
  a.unshift({ time: nowStamp(), type, by: actor(), details: details || '' });
}

DATA.audit = DATA.audit || []; // global audit trail for destructive ops (like deletion)
function logAudit(type, payload){
  DATA.audit.unshift({ time: nowStamp(), type, by: actor(), ...payload });
}

// Seed
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]},activity:[]};
  Object.assign(b,p||{});
  // Record creation event
  b.activity.unshift({ time: nowStamp(), type: "created", by: actor(), details: "Case created" });
  return b;
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
  resources:{templates:[],procedures:[]},
  timesheets:[],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// Ensure one contact has email & a little session history for demo
(function(){
  try {
    var hasEmail = (DATA.contacts||[]).some(function(c){ return !!c.email; });
    if(!hasEmail){
      var demo = { id: 'ct-demo', name: 'Demo Person', email: 'demo@example.com', phone: '0400 000 000', companyId: 'C-001', role: 'Stakeholder' };
      DATA.contacts = DATA.contacts || [];
      DATA.contacts.push(demo);
    }
  } catch(e){}
})();

const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;
const findUserByEmail=e=>DATA.users.find(u=>(u.email||"").toLowerCase()===(e||"").toLowerCase())||null;
const investigatorCases=email=>DATA.cases.filter(cs=>(cs.investigatorEmail||"").toLowerCase()===(email||"").toLowerCase());

const App={state:{route:"dashboard",currentCaseId:null,currentContactId:null,currentCompanyId:null,currentUploadTarget:null,currentCompanyUploadTarget:null,asUser:null,casesFilter:{q:""}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'; if(App.state.asUser){s+='<span class="chip">Viewing as '+(App.state.asUser.name||App.state.asUser.email)+' ('+App.state.asUser.role+')</span> <button class="btn light" data-act="exitPortal">Exit</button> ';} s+='<span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
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

  const activityRows = (cs.activity && cs.activity.length)
    ? cs.activity.map(ev=>(
        '<tr><td>'+ev.time+'</td><td>'+ev.by+'</td><td><span class="chip">'+ev.type+'</span></td><td>'+ (ev.details||'') +'</td></tr>'
      )).join('')
    : '<tr><td colspan="4" class="muted">No activity yet.</td></tr>';

  const activity = '<div class="section"><header><h3 class="section-title">Activity</h3></header>'
    + '<table><thead><tr><th>Time</th><th>By</th><th>Type</th><th>Details</th></tr></thead>'
    + '<tbody>'+activityRows+'</tbody></table></div>';

  return Shell(header + leftDetails + blocks + docs + activity, 'cases');
}

function Contacts(){const d=App.get(); const coName=id=>{const co=findCompany(id); return co?co.name:"";}; let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}

function ContactPage(id){const d=App.get(), c=findContact(id); if(!c) return Shell('<div class="card">Contact not found.</div>','contacts'); const coOpts=()=>['<option value="">(No linked company)</option>'].concat(d.companies.map(co=>'<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>')).join(''); let existing=d.users.find(u=>(u.email||'').toLowerCase()===(c.email||'').toLowerCase())||null; let headerBtns='', portalBody='';
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
return Shell(html,'contacts');}

function Companies(){const d=App.get(); const countContacts=cid=>d.contacts.filter(c=>c.companyId===cid).length; const countCases=cid=>d.cases.filter(c=>c.companyId===cid).length; let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}

function Documents(){const d=App.get(); let rows=''; for(const c of d.cases){let count=0; for(const k in c.folders){if(Object.prototype.hasOwnProperty.call(c.folders,k)) count+=c.folders[k].length;} rows+='<tr><td>'+c.fileNumber+'</td><td>'+count+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>'; } return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents');}

function Resources(){const d=App.get(); if(!d.resources) d.resources={templates:[],procedures:[]}; const rows=kind=>{const list=(kind==='templates')?d.resources.templates:d.resources.procedures; if(!list.length) return '<tr><td colspan="3" class="muted">No items yet.</td></tr>'; return list.map(it=>{const arg=kind+'::'+it.name; return '<tr><td>'+it.name+'</td><td>'+it.size+'</td><td class="right">'+(it.dataUrl?('<button class="btn light" data-act="viewResource" data-arg="'+arg+'">View</button> '):'')+'<button class="btn light" data-act="removeResource" data-arg="'+arg+'">Remove</button></td></tr>';}).join(''); }; const html='<div class="section"><header><h3 class="section-title">Investigation Templates</h3><div><button class="btn light" data-act="selectResTemplates">Select files</button></div></header><input type="file" id="rs-file-templates" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('templates')+'</tbody></table></div><div class="section"><header><h3 class="section-title">Procedures</h3><div><button class="btn light" data-act="selectResProcedures">Select files</button></div></header><input type="file" id="rs-file-procedures" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('procedures')+'</tbody></table></div>'; return Shell(html,'resources');}

// Render
function render(){const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='documents') el.innerHTML=Documents(); else if(r==='resources') el.innerHTML=Resources(); else if(r==='admin') el.innerHTML=Admin ? Admin() : '<div class="card">Admin not available</div>'; else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')';}

// Actions
document.addEventListener('click',e=>{let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return; const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
// nav
if(act==='route'){App.set({route:arg});return;}
if(act==='openCase'){App.set({currentCaseId:arg,route:'case'});return;}

// cases
if(act==='addQuickNote'){ const cs=findCase(arg); if(!cs) return; const text=prompt('Add a note'); if(!text) { return; } const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes = cs.notes||[]; cs.notes.unshift({time:stamp,by:me,text}); App.set({}); return; }

if(act==='newCase'){const seq=('00'+(d.cases.length+1)).slice(-3); const inv=d.users[0]||{name:'',email:''}; const created=(new Date()).toISOString().slice(0,7); const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]},activity:[]}; cs.activity.unshift({ time: nowStamp(), type: "created", by: actor(), details: "Case created" }); d.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'});return;}
if(act==='saveCase'){const cs=findCase(arg); if(!cs) return; const before={fileNumber:cs.fileNumber,title:cs.title,organisation:cs.organisation,companyId:cs.companyId,investigatorEmail:cs.investigatorEmail,investigatorName:cs.investigatorName,status:cs.status,priority:cs.priority}; const getV=id=>{const el=document.getElementById(id); return el?el.value:null;}; const setIf=(key,val)=>{ if(val!=null){ cs[key]=val; } }; setIf('title', getV('c-title')); setIf('organisation', getV('c-org')); const coVal=getV('c-company'); if(coVal!=null) cs.companyId=coVal; const invEmail=getV('c-inv'); if(invEmail!=null){ cs.investigatorEmail=invEmail; const u=DATA.users.find(x=>x.email===invEmail)||null; cs.investigatorName=u?u.name:''; } setIf('status', getV('c-status')); setIf('priority', getV('c-priority')); const idEl=document.getElementById('c-id'); if(idEl && idEl.value){ cs.fileNumber=idEl.value.trim(); } const after={fileNumber:cs.fileNumber,title:cs.title,organisation:cs.organisation,companyId:cs.companyId,investigatorEmail:cs.investigatorEmail,investigatorName:cs.investigatorName,status:cs.status,priority:cs.priority}; const changed=[]; Object.keys(after).forEach(k=>{ if(before[k]!==after[k]){ if(k==='status'){ logCase(cs,'status',`${before[k]} → ${after[k]}`); } else { changed.push(`${k}: "${before[k]||''}" → "${after[k]||''}"`); } } }); if(changed.length){ logCase(cs,'edit',changed.join(' | ')); } alert('Case saved'); return;}

if(act==='deleteCase'){ const cs=findCase(arg); if(!cs){ alert('Case not found'); return; } if(confirm('Delete this case ('+(cs.fileNumber||cs.title||cs.id)+') ?')){ try { logAudit('case.deleted', { caseId: cs.id, fileNumber: cs.fileNumber, title: cs.title }); } catch(_){} try { logCase(cs, 'deleted', 'Case removed by user'); } catch(_){} DATA.cases = DATA.cases.filter(c=>c.id!==cs.id); App.set({route:'cases', currentCaseId:null}); } return; }
if(act==='addNote'){const cs=findCase(arg); if(!cs) return; const text=document.getElementById('note-text').value; if(!text){alert('Enter a note');return;} const stamp=(new Date().toISOString().replace('T',' ').slice(0,16)), me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes.unshift({time:stamp,by:me,text}); logCase(cs,'note.added',text.slice(0,120)); App.set({}); return;}
if(act==='addStdTasks'){const cs=findCase(arg); if(!cs) return; const base=cs.tasks, add=['Gather documents','Interview complainant','Interview respondent','Write report']; add.forEach(a=>base.push({id:'T-'+(base.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'})); logCase(cs,'tasks.bulkAdded',`${add.length} standard tasks`); App.set({}); return;}
if(act==='addTask'){const cs=findCase(arg); if(!cs) return; const sel=document.getElementById('task-assignee'); const who=sel.options[sel.selectedIndex].text; const title=document.getElementById('task-title').value; const due=document.getElementById('task-due').value; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title,assignee:who,due,status:'Open'}); logCase(cs,'task.added',`"${title}" → ${who}${due ? (' (due '+due+')') : ''}`); App.set({}); return;}

// case docs
if(act==='addFolderPrompt'){const cs=findCase(arg); if(!cs) return; const name=prompt('New folder name'); if(!name) return; cs.folders[name]=cs.folders[name]||[]; logCase(cs,'folder.added',name); App.set({}); return;}
if(act==='selectFiles'){App.state.currentUploadTarget=arg||((App.state.currentCaseId||'')+'::General'); const fi=document.getElementById('file-input'); if(fi) fi.click(); return;}
if(act==='viewDoc'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; const list=cs.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeDoc'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; const fname=p[2]; cs.folders[p[1]]=(cs.folders[p[1]]||[]).filter(x=>x.name!==fname); logCase(cs,'doc.removed',`${fname} from ${p[1]}`); App.set({}); return;}
if(act==='deleteFolder'){const p=arg.split('::'); const cs=findCase(p[0]); if(!cs) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General');return;} if(confirm('Delete folder '+folder+' and its files?')){delete cs.folders[folder]; logCase(cs,'folder.deleted',folder); App.set({});} return;}

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

// resources actions
if(act==='selectResTemplates'){const fi=document.getElementById('rs-file-templates'); if(fi) fi.click(); return;}
if(act==='selectResProcedures'){const fi=document.getElementById('rs-file-procedures'); if(fi) fi.click(); return;}
if(act==='viewResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; const list=(kind==='templates')?DATA.resources.templates:DATA.resources.procedures; const f=list.find(x=>x.name===name && x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; if(kind==='templates'){DATA.resources.templates=DATA.resources.templates.filter(x=>x.name!==name);} else {DATA.resources.procedures=DATA.resources.procedures.filter(x=>x.name!==name);} App.set({}); return;}

// filters
if(act==='resetCaseFilters'){App.state.casesFilter={q:""}; try{localStorage.removeItem('synergy_filters_cases_v2104');}catch(_){ } App.set({}); return;}
});

document.addEventListener('change',e=>{
  if(e.target && e.target.id==='flt-q'){const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({});}
  if(e.target && e.target.id==='file-input'){
    const fi = e.target;
    const target = App.state.currentUploadTarget || ((App.state.currentCaseId||'')+'::General');
    const parts = (target||'').split('::');
    const caseId = parts[0], folder = parts[1]||'General';
    const cs = findCase(caseId);
    if(!cs){ fi.value=''; return; }
    const list = cs.folders[folder] = cs.folders[folder] || [];
    const toRead = Array.from(fi.files||[]);
    const jobs = toRead.map(f => new Promise(res=>{
      const r = new FileReader();
      r.onload = () => res({ name: f.name, size: f.size, dataUrl: r.result });
      r.readAsDataURL(f);
    }));
    Promise.all(jobs).then(files=>{
      files.forEach(ff => list.push(ff));
      if(files.length){ logCase(cs,'doc.uploaded', `${files.length} file(s) → ${folder}`); }
      fi.value='';
      App.set({});
    });
  }
});

document.addEventListener('DOMContentLoaded',()=>{ try{ loadUserSessions(); }catch(_){ } try{const f=localStorage.getItem('synergy_filters_cases_v2104'); if(f) App.state.casesFilter=JSON.parse(f)||App.state.casesFilter;}catch(_){ } App.set({route:'dashboard'});});
})();