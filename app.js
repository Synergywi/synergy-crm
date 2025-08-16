(function(){ "use strict";
const BUILD="v2.13.1"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM "+BUILD+" • "+STAMP);

/* ---------- helpers ---------- */
function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

/* ---------- seed data ---------- */
function mkCase(y,seq,p){
  let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",
    investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),
    notes:[],tasks:[],folders:{General:[]}};
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
    {id:"C-003",name:"Queensland Health (Metro North)",folders:{General:[]}},
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
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

/* ---------- finders ---------- */
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

/* ---------- app shell ---------- */
const App={state:{route:"dashboard",currentCaseId:null,currentContactId:null,asUser:null,casesFilter:{q:""}}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){
  let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>';
  if(App.state.asUser){
    s+='<span class="chip"><i></i>Viewing as '+(App.state.asUser.name||App.state.asUser.email)+' ('+App.state.asUser.role+')</span> <button class="btn light" data-act="exitPortal">Exit</button> ';
  }
  s+='<span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;
}
function Sidebar(active){
  const base=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]];
  let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">'];
  for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');}
  out.push('</ul></aside>'); return out.join('');
}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

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
  let rows='';
  for(const c of d.cases.slice(0,6)){
    rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+statusChip(c.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';
  }
  const tbl='<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
  const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div></div><div class="mono">Build: '+STAMP+'</div></div><div class="section"><header><h3 class="section-title">Active Cases</h3></header>'+tbl+'</div>';
  return Shell(html,'dashboard');
}

function Cases(){
  const d=App.get(), f=App.state.casesFilter||{q:""};
  const list=d.cases.filter(c=>{ if(!f.q) return true; const q=f.q.toLowerCase(); return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q); });
  let rows='';
  for(const cc of list){
    rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+statusChip(cc.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>';
  }
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
  for(const fname in cs.folders){
    if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname];
    docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const ff of files){const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
  }
  const docs = '<div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';

  return Shell(header + leftDetails + blocks + docs, 'cases');
}

function Contacts(){const d=App.get(); const coName=id=>{const co=findCompany(id); return co?co.name:"";}; let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}

/* ---------- render ---------- */
function render(){
  const r=App.state.route, el=document.getElementById('app');
  document.getElementById('boot').textContent='Rendering '+r+'…';
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='companies') el.innerHTML='<div class="section"><header><h3 class="section-title">Companies</h3></header><div class="card muted">Company list/page intentionally trimmed for this demo build.</div>';
  else if(r==='documents') el.innerHTML='<div class="card">Documents</div>';
  else if(r==='resources') el.innerHTML='<div class="card">Resources</div>';
  else if(r==='admin') el.innerHTML='<div class="card">Admin not available</div>';
  else el.innerHTML=Dashboard();
  document.getElementById('boot').textContent='Ready ('+BUILD+')';
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
  if(act==='route'){App.set({route:arg});return;}
  if(act==='openCase'){App.set({currentCaseId:arg,route:'case'});return;}

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

  if(act==='resetCaseFilters'){App.state.casesFilter={q:""}; try{localStorage.removeItem('synergy_filters_cases_v2104');}catch(_){ } App.set({}); return;}
});

document.addEventListener('change',e=>{
  if(e.target && e.target.id==='flt-q'){const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({});}
});

document.addEventListener('DOMContentLoaded',()=>{ App.set({route:'dashboard'}); });
})();