
(function(){ "use strict";
const BUILD="v2.10.7"; const STAMP=(new Date()).toISOString();
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
  timesheets:[
    // one submitted to show notifications
    {id:uid(),investigatorEmail:"alex@synergy.com",periodStart: YEAR+"-07-01", periodEnd: YEAR+"-07-31", status:"Submitted", submittedAt: new Date().toISOString(), lines:[
      {id:uid(),date: YEAR+"-07-10", caseId:null, caseRef:"INV-"+YEAR+"-001", hours:3, notes:"Interview prep"},
      {id:uid(),date: YEAR+"-07-11", caseId:null, caseRef:"INV-"+YEAR+"-001", hours:5.5, notes:"Interview complainant"}
    ]}
  ],
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

// Ensure there is at least one contact with email for demo
(function(){
  try {
    var hasEmail = (DATA.contacts||[]).some(function(c){ return !!c.email; });
    if(!hasEmail){
      var demo = { id: 'ct-demo', name: 'Demo Person', email: 'demo@example.com', phone: '0400 000 000', companyId: 'C-001', role: 'Stakeholder' };
      DATA.contacts = DATA.contacts || [];
      DATA.contacts.push(demo);
    }
    DATA.userSessions = DATA.userSessions || {};
    var anyEmail = (DATA.contacts||[]).find(function(c){ return !!c.email; });
    if(anyEmail && !DATA.userSessions[anyEmail.email]){
      var now = new Date();
      var arr = DATA.userSessions[anyEmail.email] = [];
      function add(daysAgo, mins){ var d=new Date(now.getTime()-daysAgo*24*60*60*1000); arr.push({ start: d.toISOString(), durationMins: mins }); }
      add(1, 42); add(8, 18); add(30, 73);
    }
  } catch(e){}
})();

;

DATA.userSessions = DATA.userSessions || {};
(function(){
  try{
    if (Object.keys(DATA.userSessions).length) return;
    var emails = (DATA.contacts||[]).filter(function(c){return !!c.email;}).slice(0,3).map(function(c){return c.email;});
    var now = new Date();
    emails.forEach(function(em, idx){
      var arr = DATA.userSessions[em] = DATA.userSessions[em] || [];
      function add(daysAgo, mins){ var d=new Date(now.getTime()-daysAgo*24*60*60*1000); arr.push({ start: d.toISOString(), durationMins: mins }); }
      add(1+idx, 45+idx*5);
      add(8+idx, 12+idx*7);
      add(30+idx, 78+idx*3);
    });
  }catch(e){}
})();

;
DATA.userSessions = DATA.userSessions || {};
;

// Helpers
const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;
const findUserByEmail=e=>DATA.users.find(u=>(u.email||"").toLowerCase()===(e||"").toLowerCase())||null;
const investigatorCases=email=>DATA.cases.filter(cs=>(cs.investigatorEmail||"").toLowerCase()===(email||"").toLowerCase());


function exportTimesheetPDF(t){
  try{
    const inv = (DATA.users.find(u => (u.email||'').toLowerCase()===(t.investigatorEmail||'').toLowerCase())||{name:t.investigatorEmail}).name;
    const lines = (t.lines||[]);
    let total = 0; lines.forEach(l=>{ total += parseFloat(l.hours||0); });
    const rows = lines.length ? lines.map(l=>{
      const ref = l.caseRef || ( (DATA.cases.find(c=>c.id===l.caseId)||{}).fileNumber || '' );
      return '<tr><td>'+ (l.date||'') +'</td><td>'+ (ref||'') +'</td><td style="text-align:right">'+ (l.hours||'') +'</td><td>'+ (l.notes||'') +'</td></tr>';
    }).join('') : '<tr><td colspan="4" style="color:#666">No entries</td></tr>';
    const now = new Date().toISOString().replace('T',' ').slice(0,16);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Timesheet ${t.periodStart} to ${t.periodEnd}</title>
<style>
  @page { margin: 12mm; }
  body{ font:12px -apple-system,Segoe UI,Roboto,Arial; color:#111; }
  h1{ font-size:18px; margin:0 0 4px; }
  h2{ font-size:14px; margin:0 0 16px; color:#333; }
  table{ width:100%; border-collapse:collapse; }
  th,td{ border:1px solid #ccd5e4; padding:6px; vertical-align:top; }
  thead th{ background:#f3f6fa; text-transform:uppercase; font-size:11px; color:#506070; letter-spacing:.04em; }
  .meta{ margin:8px 0 14px; }
  .meta div{ margin:2px 0; }
  .right{ text-align:right; }
  .muted{ color:#555; }
  .totals{ margin-top:8px; }
</style>
</head>
<body>
  <h1>Synergy CRM — Investigator Timesheet</h1>
  <div class="meta">
    <div><strong>Investigator:</strong> ${inv} &nbsp; <strong>Email:</strong> ${t.investigatorEmail||''}</div>
    <div><strong>Period:</strong> ${t.periodStart} → ${t.periodEnd} &nbsp; <strong>Status:</strong> ${t.status}</div>
    <div class="muted">Generated: ${now}</div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Case</th><th class="right">Hours</th><th>Notes</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals"><strong>Total hours:</strong> ${total.toFixed(2)}</div>
</body></html>`;
    const w = window.open('', '_blank');
    if(!w){ alert('Pop-up blocked. Please allow pop-ups for this site.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(()=>{ try{ w.focus(); w.print(); }catch(_){ } }, 250);
  }catch(err){
    alert('Export failed: '+(err&&err.message?err.message:err));
  }
}


function ts_overlaps(aStart,aEnd,bStart,bEnd){
  const toDate = s => new Date((s||"")+"T00:00:00");
  const a1=toDate(aStart), a2=toDate(aEnd), b1=toDate(bStart), b2=toDate(bEnd);
  return (a1<=b2 && b1<=a2);
}
function exportTimesheetRangeSummary(from,to){
  const ts = DATA.timesheets.filter(t => ts_overlaps(t.periodStart,t.periodEnd,from,to));
  const rows = ts.map(t=>{
    const inv=(DATA.users.find(u=>(u.email||'').toLowerCase()===(t.investigatorEmail||'').toLowerCase())||{name:t.investigatorEmail}).name;
    const total=(t.lines||[]).reduce((s,l)=>s+parseFloat(l.hours||0),0).toFixed(2);
    return '<tr><td>'+inv+'</td><td>'+t.periodStart+' → '+t.periodEnd+'</td><td class="right">'+total+'</td><td>'+t.status+'</td></tr>';
  }).join('') || '<tr><td colspan="4" style="color:#666">No timesheets in range</td></tr>';
  const now = new Date().toISOString().replace('T',' ').slice(0,16);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Timesheet Summary ${from} to ${to}</title>
<style>
@page{margin:12mm} body{font:12px -apple-system,Segoe UI,Roboto,Arial;color:#111}
h1{font-size:18px;margin:0 0 6px} .muted{color:#555}
table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccd5e4;padding:6px} thead th{background:#f3f6fa;text-transform:uppercase;font-size:11px;color:#506070;letter-spacing:.04em}
.right{text-align:right}
</style></head><body>
<h1>Synergy CRM — Timesheet Summary</h1>
<div class="muted">Range: ${from} → ${to} • Generated: ${now}</div>
<table><thead><tr><th>Investigator</th><th>Period</th><th class="right">Total Hours</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
  const w=window.open('','_blank'); if(!w){ alert('Pop-up blocked. Allow pop-ups.'); return; }
  w.document.open(); w.document.write(html); w.document.close(); setTimeout(()=>{ try{w.focus();w.print();}catch(_){ }}, 250);
}
function exportTimesheetRangeDetailed(from,to){
  const ts = DATA.timesheets.filter(t => ts_overlaps(t.periodStart,t.periodEnd,from,to));
  const now = new Date().toISOString().replace('T',' ').slice(0,16);
  const buildSection = (t) => {
    const inv=(DATA.users.find(u=>(u.email||'').toLowerCase()===(t.investigatorEmail||'').toLowerCase())||{name:t.investigatorEmail}).name;
    let total=0; const rows=(t.lines||[]).map(l=>{ total+=parseFloat(l.hours||0); const ref=l.caseRef || ((DATA.cases.find(c=>c.id===l.caseId)||{}).fileNumber||''); return '<tr><td>'+ (l.date||'') +'</td><td>'+ref+'</td><td class="right">'+(l.hours||'')+'</td><td>'+ (l.notes||'') +'</td></tr>'; }).join('') || '<tr><td colspan="4" style="color:#666">No entries</td></tr>';
    return `<section class="sheet">
      <h2>Investigator: ${inv} &nbsp; <span class="muted">(${t.investigatorEmail||''})</span></h2>
      <div>Period: ${t.periodStart} → ${t.periodEnd} &nbsp; Status: ${t.status||''}</div>
      <table><thead><tr><th>Date</th><th>Case</th><th class="right">Hours</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
      <div><strong>Total hours:</strong> ${total.toFixed(2)}</div>
    </section>`;
  };
  const sections = ts.map(buildSection).join('<div class="pagebreak"></div>') || '<div>No timesheets in range</div>';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Timesheets ${from} to ${to}</title>
<style>
@page{margin:12mm}
body{font:12px -apple-system,Segoe UI,Roboto,Arial;color:#111}
h1{font-size:18px;margin:0 0 6px}
h2{font-size:14px;margin:0 0 8px}
.muted{color:#555} .right{text-align:right}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ccd5e4;padding:6px;vertical-align:top}
thead th{background:#f3f6fa;text-transform:uppercase;font-size:11px;color:#506070;letter-spacing:.04em}
.pagebreak{page-break-before: always}
.sheet{page-break-inside: avoid}
.header{margin-bottom:10px}
</style></head><body>
<h1>Synergy CRM — Timesheets (Detailed)</h1>
<div class="muted">Range: ${from} → ${to} • Generated: ${now}</div>
${sections}
</body></html>`;
  const w=window.open('','_blank'); if(!w){ alert('Pop-up blocked. Allow pop-ups.'); return; }
  w.document.open(); w.document.write(html); w.document.close(); setTimeout(()=>{ try{w.focus();w.print();}catch(_){ }}, 250);
}

// App shell
const App={state:{route:"dashboard",currentCaseId:null,currentContactId:null,currentCompanyId:null,currentUploadTarget:null,currentCompanyUploadTarget:null,asUser:null,casesFilter:{q:""},tsFilterFrom:null,tsFilterTo:null,currentTimesheetId:null}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

// UI parts
function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'; if(App.state.asUser){s+='<span class="chip">Viewing as '+(App.state.asUser.name||App.state.asUser.email)+' ('+App.state.asUser.role+')</span> <button class="btn light" data-act="exitPortal">Exit</button> ';} s+='<span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
function Sidebar(active){const base=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');} out.push('</ul></aside>'); return out.join('');}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div>'; }

// Dashboard
function NotificationsCard(){const pending=DATA.timesheets.filter(t=>t.status==="Submitted"); if(!pending.length) return ''; let items=pending.map(t=>{const u=findUserByEmail(t.investigatorEmail)||{name:t.investigatorEmail}; const label=u.name+" • "+t.periodStart+" to "+t.periodEnd; return '<li style="padding:6px 0;display:flex;gap:8px;align-items:center"><span class="chip">Timesheet</span> '+label+' <div class="sp"></div><button class="btn light" data-act="openAdminTimesheet" data-arg="'+t.id+'">Review</button></li>';}).join(''); return '<div class="section"><header><h3 class="section-title">Notifications</h3></header><ul style="list-style:none;margin:0;padding:0">'+items+'</ul></div>';}

function Dashboard(){const d=App.get(); let rows=''; for(const c of d.cases.slice(0,6)) rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>'; const tbl='<table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>'; const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div><button class="btn light" data-act="exportSnapshot">Export snapshot</button><button class="btn light" data-act="importSnapshot">Import snapshot</button></div><input type="file" id="snapshot-input" accept="application/json" style="display:none"><div class="mono">Build: '+STAMP+'</div></div>'+NotificationsCard()+'<div class="section"><header><h3 class="section-title">Active Cases</h3></header>'+tbl+'</div>'; return Shell(html,'dashboard');}

// Cases
function Cases(){const d=App.get(), f=App.state.casesFilter||{q:""}; const list=d.cases.filter(c=>{if(!f.q) return true; const q=f.q.toLowerCase(); return (c.title||"").toLowerCase().includes(q)||(c.organisation||"").toLowerCase().includes(q)||(c.fileNumber||"").toLowerCase().includes(q);}); let rows=''; for(const cc of list){rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>';} const tools='<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="'+(f.q||'')+'"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>'; return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');}

function CasePage(id){const d=App.get(), cs=findCase(id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases'); const invOpts=()=>d.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join(''); const coOpts=()=>d.companies.map(co=>'<option '+(co.id===cs.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>').join(''); if(!cs.folders) cs.folders={General:[]};
const header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case ID: '+cs.fileNumber+'</h2><div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save Case</button><button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div><div class="grid cols-2" style="margin-top:12px"><div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div><div><label>Organisation (display)</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div><div><label>Company</label><select class="input" id="c-company">'+coOpts()+'</select></div><div><label>Investigator</label><select class="input" id="c-inv">'+invOpts()+'</select></div><div><label>Status</label><select class="input" id="c-status"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div><div><label>Priority</label><select class="input" id="c-priority"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div></div></div>';

let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3" class="muted">No notes yet.</td></tr>';
for(const nn of (cs.notes||[])){notesRows+='<tr><td>'+nn.time+'</td><td>'+nn.by+'</td><td>'+nn.text+'</td></tr>';}
let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
for(const tt of (cs.tasks||[])){taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>';}
const blocks='<div class="grid cols-2"><div class="section"><header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add Note</button></header><textarea class="input" id="note-text" placeholder="Type your note here"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody id="notes-body">'+notesRows+'</tbody></table></div><div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts()+'</select></div><div style="text-align:right;margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+taskRows+'</tbody></table></div></div>';

let docRows='';
for(const fname in cs.folders){if(!Object.prototype.hasOwnProperty.call(cs.folders,fname)) continue; const files=cs.folders[fname];
  docRows+='<tr><th colspan="3">'+fname+'</th></tr>';
  docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fname+'">Delete folder</button>')+'</td></tr>';
  if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
  for(const ff of files){const a=id+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }
}
const docs='<div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';
return Shell(header+blocks+docs,'cases');
}

// Contacts
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
let html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save</button><button class="btn light" data-act="route" data-arg="contacts">Back to Contacts</button></div><div class="grid cols-4" style="margin-top:12px"><div><label>Contact Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Phone</label><input class="input" id="ct-phone" value="'+(c.phone||'')+'"></div><div><label>Position/Org</label><input class="input" id="ct-org" value="'+(c.org||'')+'"></div><div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">'+coOpts()+'</select></div><div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">'+(c.notes||'')+'</textarea></div></div></div><div class="section"><header><h3 class="section-title">Portal Access</h3><div>'+headerBtns+'</div></header>'+ portalBody +'</div>'; // --- Inject "Last seen" badge next to the name (in the <h2>) ---
  (function(){
    try {
      var email = (c && c.email) ? c.email : '';
      var sessions = (window.DATA && DATA.userSessions && email) ? (DATA.userSessions[email] || []) : [];
      var last = sessions.length ? sessions[sessions.length-1] : null;
      var lastSeen = last ? new Date(last.start).toLocaleString() : 'Never';
      // Replace the first </h2> with a badge span just before it
      html = html.replace('</h2>', ' <span class="pill" style="margin-left:8px" title="Most recent login">Last seen: '+ lastSeen +'</span></h2>');
    } catch(e){ /* ignore */ }
  })();
  // --- User Log section: inject right under the header for visibility ---
  (function(){
    try {
      var email = (c && c.email) ? c.email : '';
      var sessions = (window.DATA && DATA.userSessions && email) ? (DATA.userSessions[email] || []) : [];
      var last = sessions.length ? sessions[sessions.length-1] : null;
      var lastWhen = last ? new Date(last.start).toLocaleString() : '<em class="muted">No logins yet</em>';
      var lastDur = last ? (Math.round((last.durationMins||0)) + ' min') : '—';
      var rows = sessions.slice(-10).reverse().map(function(s){
        var when = new Date(s.start).toLocaleString();
        var dur = Math.round(s.durationMins||0);
        return '<tr><td>'+when+'</td><td class="right">'+dur+' min</td></tr>';
      }).join('') || '<tr><td colspan="2"><em class="muted">No history</em></td></tr>';

      var card = ''
        + '<div class="card">'
        +   '<div class="row spread">'
        +     '<strong>User Log</strong>'
        +     '<div>'
        +       '<button class="btn light" data-act="simulateLogin" data-arg="'+id+'">Simulate login</button> '
        +       '<button class="btn light" data-act="clearUserLog" data-arg="'+id+'">Clear log</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="grid cols-3">'
        +     '<div><div class="muted">Last login</div><div>'+ lastWhen +'</div></div>'
        +     '<div><div class="muted">Last session duration</div><div>'+ lastDur +'</div></div>'
        +     '<div></div>'
        +   '</div>'
        +   '<div style="margin-top:8px">'
        +     '<table class="compact"><thead><tr><th>When</th><th class="right">Duration</th></tr></thead><tbody>'+ rows +'</tbody></table>'
        +   '</div>'
        + '</div>';

      // Insert immediately after the contact page header
      html = html;
    } catch(e){ /* no-op */ }
  })();
  // --- User Log: render as a separate card at the end of the Contact page ---
  (function(){
    try {
      var email = (c && c.email) ? c.email : '';
      var sessions = (window.DATA && DATA.userSessions && email) ? (DATA.userSessions[email] || []) : [];
      var last = sessions.length ? sessions[sessions.length-1] : null;
      var lastWhen = last ? new Date(last.start).toLocaleString() : '<em class="muted">No logins yet</em>';
      var lastDur = last ? (Math.round((last.durationMins||0)) + ' min') : '—';
      var rows = sessions.slice(-10).reverse().map(function(s){
        var when = new Date(s.start).toLocaleString();
        var dur = Math.round(s.durationMins||0);
        return '<tr><td>'+when+'</td><td class="right">'+dur+' min</td></tr>';
      }).join('') || '<tr><td colspan="2"><em class="muted">No history</em></td></tr>';
      var card = ''
        + '<section class="section">'
        +   '<div class="card" id="userlog-card">'
        +     '<div class="row spread">'
        +       '<strong>User Log</strong>'
        +       '<div>'
        +         '<button class="btn light" data-act="simulateLogin" data-arg="'+id+'">Simulate login</button> '
        +         '<button class="btn light" data-act="clearUserLog" data-arg="'+id+'">Clear log</button>'
        +       '</div>'
        +     '</div>'
        +     '<div class="grid cols-2 userlog-meta">'
        +       '<div><div class="muted">Last login</div><div>'+ lastWhen +'</div></div>'
        +       '<div><div class="muted">Last session duration</div><div>'+ lastDur +'</div></div>'
        +       '<div></div>'
        +     '</div>'
        +     '<div style="margin-top:16px">'
        +       '<table class="compact"><thead><tr><th>When</th><th class="right">Duration</th></tr></thead><tbody>'+ rows +'</tbody></table>'
        +     '</div>'
        +   '</div>'
        + '</section>';
      html += card;
    } catch(e) {}
  })();
  return Shell(html,'contacts');}

// Companies
function Companies(){const d=App.get(); const countContacts=cid=>d.contacts.filter(c=>c.companyId===cid).length; const countCases=cid=>d.cases.filter(c=>c.companyId===cid).length; let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}

function CompanyPage(cid){const d=App.get(), co=findCompany(cid); if(!co) return Shell('<div class="card">Company not found</div>','companies'); let linkedContacts=d.contacts.filter(c=>c.companyId===cid).map(c=>'<tr><td>'+c.name+'</td><td>'+c.email+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open Contact</button></td></tr>').join(''); if(!linkedContacts) linkedContacts='<tr><td colspan="3" class="muted">No linked contacts.</td></tr>'; let linkedCases=d.cases.filter(cs=>cs.companyId===cid).map(cs=>'<tr><td>'+cs.fileNumber+'</td><td>'+cs.title+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cs.id+'">Open Case</button></td></tr>').join(''); if(!linkedCases) linkedCases='<tr><td colspan="3" class="muted">No cases.</td></tr>'; if(!co.folders) co.folders={General:[]}; let docRows=''; for(const fname in co.folders){if(!Object.prototype.hasOwnProperty.call(co.folders,fname)) continue; const files=co.folders[fname]; docRows+='<tr><th colspan="3">'+fname+'</th></tr><tr><td colspan="3" class="right"><button class="btn light" data-act="selectCompanyFiles" data-arg="'+cid+'::'+fname+'">Upload to '+fname+'</button> '+(fname==='General'?'':'<button class="btn light" data-act="deleteCompanyFolder" data-arg="'+cid+'::'+fname+'">Delete folder</button>')+'</td></tr>'; if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';} for(const ff of files){const a=cid+'::'+fname+'::'+ff.name; docRows+='<tr><td>'+ff.name+'</td><td>'+ff.size+'</td><td class="right">'+(ff.dataUrl?('<button class="btn light" data-act="viewCompanyDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeCompanyDoc" data-arg="'+a+'">Remove</button></td></tr>';}} const html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Company</h2><div class="sp"></div><button class="btn" data-act="saveCompany" data-arg="'+cid+'">Save</button><button class="btn light" data-act="route" data-arg="companies">Back to Companies</button></div><div class="grid cols-2" style="margin-top:12px"><div><label>Company Name</label><input class="input" id="co-name" value="'+(co.name||'')+'"></div><div><label>Company ID</label><input class="input" id="co-id" value="'+(co.id||'')+'" disabled></div></div></div><div class="section"><header><h3 class="section-title">Contacts</h3><div><button class="btn light" data-act="newContactForCompany" data-arg="'+cid+'">Add Contact</button></div></header><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>'+linkedContacts+'</tbody></table></div><div class="section"><header><h3 class="section-title">Cases</h3><div><button class="btn light" data-act="newCaseForCompany" data-arg="'+cid+'">New Case</button></div></header><table><thead><tr><th>Case ID</th><th>Title</th><th></th></tr></thead><tbody>'+linkedCases+'</tbody></table></div><div class="section"><header><h3 class="section-title">Company Documents</h3><div><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+cid+'">Add folder</button> <button class="btn light" data-act="selectCompanyFiles" data-arg="'+cid+'::General">Select files</button></div></header><input type="file" id="co-file-input" multiple style="display:none"><div style="margin-top:8px"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>'; return Shell(html,'companies');}

// Documents rollup
function Documents(){const d=App.get(); let rows=''; for(const c of d.cases){let count=0; for(const k in c.folders){if(Object.prototype.hasOwnProperty.call(c.folders,k)) count+=c.folders[k].length;} rows+='<tr><td>'+c.fileNumber+'</td><td>'+count+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>'; } return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents');}

// Resources
function Resources(){const d=App.get(); if(!d.resources) d.resources={templates:[],procedures:[]}; const rows=kind=>{const list=(kind==='templates')?d.resources.templates:d.resources.procedures; if(!list.length) return '<tr><td colspan="3" class="muted">No items yet.</td></tr>'; return list.map(it=>{const arg=kind+'::'+it.name; return '<tr><td>'+it.name+'</td><td>'+it.size+'</td><td class="right">'+(it.dataUrl?('<button class="btn light" data-act="viewResource" data-arg="'+arg+'">View</button> '):'')+'<button class="btn light" data-act="removeResource" data-arg="'+arg+'">Remove</button></td></tr>';}).join(''); }; const html='<div class="section"><header><h3 class="section-title">Investigation Templates</h3><div><button class="btn light" data-act="selectResTemplates">Select files</button></div></header><input type="file" id="rs-file-templates" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('templates')+'</tbody></table></div><div class="section"><header><h3 class="section-title">Procedures</h3><div><button class="btn light" data-act="selectResProcedures">Select files</button></div></header><input type="file" id="rs-file-procedures" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+rows('procedures')+'</tbody></table></div>'; return Shell(html,'resources');}

// Admin (Timesheets)
function Admin(){
  const d=App.get();
  // defaults
  let from = App.state.tsFilterFrom, to = App.state.tsFilterTo;
  const today=new Date(), y=today.getFullYear(), m=("0"+(today.getMonth()+1)).slice(-2);
  if(!from) from = y+"-"+m+"-01";
  if(!to) { const last = new Date(y, parseInt(m), 0).getDate(); to = y+"-"+m+"-"+("0"+last).slice(-2); }
  // filter function (overlap of ranges)
  const toDate = s => new Date((s||"")+"T00:00:00");
  const overlaps = (ts) => {
    const a1=toDate(ts.periodStart), a2=toDate(ts.periodEnd);
    const b1=toDate(from), b2=toDate(to);
    return (a1<=b2 && b1<=a2);
  };
  const filtered = d.timesheets.filter(overlaps);
  const sorted=filtered.slice(0).sort((a,b)=>{const pr={"Submitted":0,"Draft":1,"Approved":2,"Rejected":3}; return pr[a.status]-pr[b.status];});
  let rows='';
  for(const t of sorted){
    const u = (d.users.find(u=> (u.email||'').toLowerCase()===(t.investigatorEmail||'').toLowerCase()) || {name:t.investigatorEmail});
    rows+='<tr><td>'+u.name+'</td><td>'+t.periodStart+' → '+t.periodEnd+'</td><td>'+t.status+'</td><td class="right"><button class="btn light" data-act="openAdminTimesheet" data-arg="'+t.id+'">Open</button></td></tr>';
  }
  if(!rows) rows='<tr><td colspan="4" class="muted">No timesheets in this date range.</td></tr>';
  const controls = '<div class="grid cols-4" style="gap:8px"><div><label>From</label><input class="input" type="date" id="tsf-from" value="'+from+'"></div><div><label>To</label><input class="input" type="date" id="tsf-to" value="'+to+'"></div><div style="align-self:end"><button class="btn" data-act="setTSRange">Apply</button></div><div style="align-self:end;text-align:right"><button class="btn light" data-act="exportTSRangeSummary">Export Summary PDF</button> <button class="btn light" data-act="exportTSRangeDetailed">Export Detailed PDF</button></div></div>';
  const html = '<div class="section"><header><h3 class="section-title">Timesheets</h3></header>'+controls+'<div style="margin-top:10px"><table><thead><tr><th>Investigator</th><th>Period</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  return Shell(html,'admin');
}

function TimesheetPage(tsId, mode){const t=DATA.timesheets.find(x=>x.id===tsId); if(!t) return Shell('<div class="card">Timesheet not found.</div>', mode==='admin'?'admin':'portal'); const inv=findUserByEmail(t.investigatorEmail)||{name:t.investigatorEmail}; const canEdit = (mode==='investigator' && t.status==='Draft'); const canReview = (mode==='admin' && t.status==='Submitted'); const invCases = investigatorCases(t.investigatorEmail);
let lineRows=''; for(const ln of (t.lines||[])){ const csRef=ln.caseRef || ( (DATA.cases.find(c=>c.id===ln.caseId)||{}).fileNumber || '' ); lineRows+='<tr><td>'+ln.date+'</td><td>'+(csRef||'')+'</td><td>'+ln.hours+'</td><td>'+ (ln.notes||'') +'</td><td class="right">'+(canEdit?('<button class="btn light" data-act="rmTSLine" data-arg="'+t.id+'::'+ln.id+'">Remove</button>'):'')+'</td></tr>'; }
if(!lineRows) lineRows='<tr><td colspan="5" class="muted">No entries yet.</td></tr>';
const caseOptions = invCases.map(c=>'<option value="'+c.id+'">'+c.fileNumber+' — '+(c.title||'')+'</option>').join('');
let headerBtns=''; if(mode==='investigator'){ headerBtns=(t.status==='Draft')?'<button class="btn success" data-act="submitTS" data-arg="'+t.id+'">Submit</button>':''; } else if(mode==='admin'){ headerBtns=(t.status==='Submitted')?'<button class="btn success" data-act="approveTS" data-arg="'+t.id+'">Approve</button> <button class="btn danger" data-act="rejectTS" data-arg="'+t.id+'">Reject</button>':''; headerBtns += ' <button class="btn light" data-act="exportTS" data-arg="'+t.id+'">Export PDF</button>'; }
const addLine = canEdit ? ('<div class="grid cols-4"><input class="input" type="date" id="ts-date"><select class="input" id="ts-case">'+caseOptions+'</select><input class="input" id="ts-hours" type="number" min="0" step="0.25" placeholder="Hours"><input class="input" id="ts-notes" placeholder="Notes (optional)"></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTSLine" data-arg="'+t.id+'">Add line</button></div>') : '';
const meta='<div class="grid cols-3"><div><label>Investigator</label><div class="chip">'+inv.name+'</div></div><div><label>Period start</label><input class="input" id="ts-ps" value="'+t.periodStart+'" '+(canEdit?'':'disabled')+'></div><div><label>Period end</label><input class="input" id="ts-pe" value="'+t.periodEnd+'" '+(canEdit?'':'disabled')+'></div></div>';
const body='<div class="section"><header><h3 class="section-title">Timesheet</h3><div>'+headerBtns+'</div></header>'+meta+'<div class="hr"></div>'+addLine+'<table><thead><tr><th>Date</th><th>Case</th><th>Hours</th><th>Notes</th><th></th></tr></thead><tbody>'+lineRows+'</tbody></table></div>';
return Shell('<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>'+ (mode==='admin'?'Review Timesheet':'My Timesheet') +'</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="'+(mode==='admin'?'admin':'portal')+'">Back</button></div></div>'+body, (mode==='admin'?'admin':'portal'));}

// Portal
function Portal(){const u=App.state.asUser; if(!u) return Shell('<div class="card">No portal user selected.</div>','dashboard'); const d=App.get(); let list=[]; if(u.role==='Client'){const contact=d.contacts.find(c=>(c.email||'').toLowerCase()===(u.email||'').toLowerCase()); const coId=contact?contact.companyId:null; list=d.cases.filter(cs=>!coId || cs.companyId===coId);} else if(u.role==='Investigator'){list=d.cases.filter(cs=>(cs.investigatorEmail||'').toLowerCase()===(u.email||'').toLowerCase());} else {list=d.cases.slice(0);} let rows=''; for(const c of list){rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';} const tbl='<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
let side='<aside class="sidebar"><h3>Portal</h3><ul class="nav">'; side+='<li class="active" data-act="route" data-arg="portal">My Cases</li>'; if(u.role==='Investigator'){side+='<li data-act="route" data-arg="portal_ts">My Timesheets</li>';} side+='</ul></aside>';
return Topbar()+'<div class="shell">'+side+'<main class="main"><div class="section"><header><h3 class="section-title">My Cases</h3></header>'+tbl+'</div></main></div>';}

function PortalTimesheets(){const u=App.state.asUser; if(!u) return Shell('<div class="card">No portal user selected.</div>','dashboard'); const mine=DATA.timesheets.filter(t=>(t.investigatorEmail||'').toLowerCase()===(u.email||'').toLowerCase()); let rows=''; for(const t of mine){rows+='<tr><td>'+t.periodStart+' → '+t.periodEnd+'</td><td>'+t.status+'</td><td class="right"><button class="btn light" data-act="openInvestigatorTimesheet" data-arg="'+t.id+'">Open</button></td></tr>';} const html='<div class="section"><header><h3 class="section-title">My Timesheets</h3><button class="btn" data-act="newTimesheet">New Timesheet</button></header><table><thead><tr><th>Period</th><th>Status</th><th></th></tr></thead><tbody>'+ (rows||'<tr><td colspan="3" class="muted">No timesheets yet</td></tr>') +'</tbody></table></div>'; let side='<aside class="sidebar"><h3>Portal</h3><ul class="nav"><li data-act="route" data-arg="portal">My Cases</li><li class="active" data-act="route" data-arg="portal_ts">My Timesheets</li></ul></aside>'; return Topbar()+'<div class="shell">'+side+'<main class="main">'+html+'</main></div>';}

// Render
function render(){const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='documents') el.innerHTML=Documents(); else if(r==='resources') el.innerHTML=Resources(); else if(r==='admin') el.innerHTML=Admin(); else if(r==='portal') el.innerHTML=Portal(); else if(r==='portal_ts') el.innerHTML=PortalTimesheets(); else if(r==='ts_admin') el.innerHTML=TimesheetPage(App.state.currentTimesheetId,'admin'); else if(r==='ts_investigator') el.innerHTML=TimesheetPage(App.state.currentTimesheetId,'investigator'); else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')';}

// Actions
document.addEventListener('click',e=>{let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return; const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
// nav
if(act==='route'){App.set({route:arg});return;}
if(act==='openCase'){App.set({currentCaseId:arg,route:'case'});return;}

// cases
if(act==='newCase'){
  const seq=('00'+(d.cases.length+1)).slice(-3);
  const inv=d.users[0]||{name:'',email:''};
  const created=(new Date()).toISOString().slice(0,7);
  let entered = prompt('Enter Case ID', 'INV-'+YEAR+'-'+seq);
  if(entered===null){ return; }
  entered = (entered||'').trim();
  if(!entered){ entered = 'INV-'+YEAR+'-'+seq; }
  const cs={id:uid(),fileNumber:entered,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}};
  d.cases.unshift(cs);
  App.set({currentCaseId:cs.id,route:'case'});
  return;
}
if(act==='saveCase'){const cs=findCase(arg); if(!cs) return; cs.title=document.getElementById('c-title').value; cs.organisation=document.getElementById('c-org').value; cs.companyId=document.getElementById('c-company').value; const invEmail=document.getElementById('c-inv').value; const u=d.users.find(x=>x.email===invEmail)||null; cs.investigatorEmail=invEmail; cs.investigatorName=u?u.name:''; cs.status=document.getElementById('c-status').value; cs.priority=document.getElementById('c-priority').value; alert('Case saved'); return;}
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
if(act==='newContact'){const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:'',notes:''}; d.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
if(act==='saveContact'){const c=findContact(arg); if(!c) return; c.name=document.getElementById('ct-name').value; c.email=document.getElementById('ct-email').value; c.phone=document.getElementById('ct-phone').value; c.org=document.getElementById('ct-org').value; c.companyId=document.getElementById('ct-company').value; c.notes=document.getElementById('ct-notes').value; alert('Contact saved'); return;}

// portal access
if(act==='grantPortal'){const c=findContact(arg); if(!c) return; const email=(document.getElementById('cp-email')?document.getElementById('cp-email').value:'')||c.email; if(!email){alert('Email required');return;} const role=document.getElementById('cp-role').value||'Client'; let exists=d.users.find(u=>(u.email||'').toLowerCase()===email.toLowerCase()); if(!exists) d.users.push({name:c.name||email,email,role}); else exists.role=role; alert('Access granted'); App.set({}); return;}
if(act==='grantAndView'){const c=findContact(arg); if(!c) return; const email=(document.getElementById('cp-email')?document.getElementById('cp-email').value:'')||c.email; if(!email){alert('Email required');return;} const role=document.getElementById('cp-role').value||'Client'; let user=d.users.find(u=>(u.email||'').toLowerCase()===email.toLowerCase()); if(!user){user={name:c.name||email,email,role}; d.users.push(user);} App.set({asUser:user,route:'portal'}); return;}
if(act==='updatePortal'){const c=findContact(arg); if(!c) return; const email=(c.email||'').toLowerCase(); if(!email){alert('Add an email first');return;} const role=document.getElementById('cp-role').value||'Client'; d.users.forEach(u=>{if((u.email||'').toLowerCase()===email) u.role=role;}); alert('Role updated'); App.set({}); return;}
if(act==='revokePortal'){const c=findContact(arg); if(!c) return; const email=(c.email||'').toLowerCase(); d.users=d.users.filter(u=>(u.email||'').toLowerCase()!==email); alert('Access revoked'); App.set({}); return;}
if(act==='viewPortalAs'){const c=findContact(arg); if(!c) return; const user=d.users.find(u=>(u.email||'').toLowerCase()===(c.email||'').toLowerCase()); if(!user){alert('No portal user for this contact');return;} App.set({asUser:user,route:'portal'}); return;}
if(act==='exitPortal'){App.set({asUser:null,route:'contacts'}); return;}
// contact user log actions
if(act==='simulateLogin'){ const c=findContact(arg); if(!c||!c.email){ alert('Contact has no email'); return; }
  DATA.userSessions = DATA.userSessions || {};
  const arr = DATA.userSessions[c.email] = DATA.userSessions[c.email] || [];
  const now = new Date();
  const mins = Math.floor(10 + Math.random()*110);
  arr.push({ start: now.toISOString(), durationMins: mins });
  App.set({}); alert('Simulated login added'); return;
}
if(act==='clearUserLog'){ const c=findContact(arg); if(!c||!c.email){ return; }
  DATA.userSessions = DATA.userSessions || {};
  DATA.userSessions[c.email] = []; App.set({}); return;
}

// companies
if(act==='openCompany'){App.set({currentCompanyId:arg,route:'company'});return;}
if(act==='newCompany'){const nid='C-'+('00'+(d.companies.length+1)).slice(-3); d.companies.push({id:nid,name:'New Company',folders:{General:[]}}); App.set({currentCompanyId:nid,route:'company'}); return;}
if(act==='saveCompany'){const co=findCompany(arg); if(!co) return; co.name=document.getElementById('co-name').value; alert('Company saved'); return;}
if(act==='newContactForCompany'){const cid=arg; const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:cid,notes:''}; d.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
if(act==='newCaseForCompany'){
  const cid=arg;
  const seq=('00'+(d.cases.length+1)).slice(-3);
  const inv=d.users[0]||{name:'',email:''};
  const co=findCompany(cid);
  const created=(new Date()).toISOString().slice(0,7);
  let entered = prompt('Enter Case ID', 'INV-'+YEAR+'-'+seq);
  if(entered===null){ return; }
  entered = (entered||'').trim();
  if(!entered){ entered = 'INV-'+YEAR+'-'+seq; }
  const cs={id:uid(),fileNumber:entered,title:'',organisation:(co?co.name:''),companyId:cid,investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created,notes:[],tasks:[],folders:{General:[]}};
  d.cases.unshift(cs);
  App.set({currentCaseId:cs.id,route:'case'});
  return;
}

// company docs
if(act==='addCompanyFolderPrompt'){const co=findCompany(arg); if(!co) return; const name=prompt('New folder name'); if(!name) return; co.folders[name]=co.folders[name]||[]; App.set({}); return;}
if(act==='selectCompanyFiles'){App.state.currentCompanyUploadTarget=arg||((App.state.currentCompanyId||'')+'::General'); const fi=document.getElementById('co-file-input'); if(fi) fi.click(); return;}
if(act==='viewCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const list=co.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({}); return;}
if(act==='deleteCompanyFolder'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General');return;} if(confirm('Delete folder '+folder+' and its files?')){delete co.folders[folder]; App.set({});} return;}

// resources actions
if(act==='selectResTemplates'){const fi=document.getElementById('rs-file-templates'); if(fi) fi.click(); return;}
if(act==='selectResProcedures'){const fi=document.getElementById('rs-file-procedures'); if(fi) fi.click(); return;}
if(act==='viewResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; const list=(kind==='templates')?DATA.resources.templates:DATA.resources.procedures; const f=list.find(x=>x.name===name && x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
if(act==='removeResource'){const p=arg.split('::'); const kind=p[0]; const name=p[1]; if(kind==='templates'){DATA.resources.templates=DATA.resources.templates.filter(x=>x.name!==name);} else {DATA.resources.procedures=DATA.resources.procedures.filter(x=>x.name!==name);} App.set({}); return;}

// Admin/Investigator timesheets
if(act==='exportTS'){ const t=DATA.timesheets.find(x=>x.id===arg); if(!t){alert('Timesheet not found'); return;} exportTimesheetPDF(t); return; }

if(act==='openAdminTimesheet'){App.set({currentTimesheetId:arg,route:'ts_admin'}); return;}
if(act==='openInvestigatorTimesheet'){App.set({currentTimesheetId:arg,route:'ts_investigator'}); return;}
if(act==='newTimesheet'){const u=App.state.asUser; if(!u||u.role!=='Investigator'){alert('Only an Investigator (portal) can create a timesheet. Use View portal as → Investigator.'); return;} const today=new Date(); const y=today.getFullYear(), m=("0"+(today.getMonth()+1)).slice(-2); const start=y+"-"+m+"-01"; const end=y+"-"+m+"-28"; const ts={id:uid(),investigatorEmail:u.email,periodStart:start,periodEnd:end,status:"Draft",submittedAt:null,lines:[]}; DATA.timesheets.unshift(ts); App.set({currentTimesheetId:ts.id,route:'ts_investigator'}); return;}
if(act==='addTSLine'){const tId=arg; const t=DATA.timesheets.find(x=>x.id===tId); if(!t){alert('Timesheet missing');return;} const date=document.getElementById('ts-date').value; const caseId=document.getElementById('ts-case').value; const hours=parseFloat(document.getElementById('ts-hours').value||"0"); const notes=document.getElementById('ts-notes').value; if(!date || !caseId || !hours){alert('Pick date, case, and hours'); return;} const cs=DATA.cases.find(c=>c.id===caseId); const caseRef=cs?cs.fileNumber:""; t.lines.push({id:uid(),date,caseId,caseRef,hours,notes}); App.set({}); return;}
if(act==='rmTSLine'){const p=arg.split('::'); const t=DATA.timesheets.find(x=>x.id===p[0]); if(!t) return; t.lines=t.lines.filter(l=>l.id!==p[1]); App.set({}); return;}
if(act==='submitTS'){const t=DATA.timesheets.find(x=>x.id===arg); if(!t) return; if(!t.lines||!t.lines.length){alert('Add at least one line');return;} t.status='Submitted'; t.submittedAt=new Date().toISOString(); App.set({route:'portal_ts'}); return;}
if(act==='approveTS'){const t=DATA.timesheets.find(x=>x.id===arg); if(!t) return; t.status='Approved'; App.set({route:'admin'}); return;}
if(act==='rejectTS'){const t=DATA.timesheets.find(x=>x.id===arg); if(!t) return; t.status='Rejected'; App.set({route:'admin'}); return;}


// Admin range filters & exports
if(act==='setTSRange'){
  const from=(document.getElementById('tsf-from')||{}).value||null;
  const to=(document.getElementById('tsf-to')||{}).value||null;
  App.set({tsFilterFrom:from, tsFilterTo:to, route:'admin'}); return;
}
if(act==='exportTSRangeSummary'){
  const from=(document.getElementById('tsf-from')||{}).value||null;
  const to=(document.getElementById('tsf-to')||{}).value||null;
  if(!from||!to){ alert('Select From and To'); return; }
  exportTimesheetRangeSummary(from,to); return;
}
if(act==='exportTSRangeDetailed'){
  const from=(document.getElementById('tsf-from')||{}).value||null;
  const to=(document.getElementById('tsf-to')||{}).value||null;
  if(!from||!to){ alert('Select From and To'); return; }
  exportTimesheetRangeDetailed(from,to); return;
}
// snapshot

if(act==='exportSnapshot'){const ts=new Date().toISOString().replace(/[:T]/g,'-').slice(0,19); const a=document.createElement('a'); a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(DATA)); a.download='synergy-snapshot-'+ts+'.json'; document.body.appendChild(a); a.click(); a.remove(); return;}
if(act==='importSnapshot'){const fi=document.getElementById('snapshot-input'); if(fi) fi.click(); return;}

// filters
if(act==='resetCaseFilters'){App.state.casesFilter={q:""}; try{localStorage.removeItem('synergy_filters_cases_v2104');}catch(_){ } App.set({}); return;}
});

// Change events
document.addEventListener('change',e=>{
  if(e.target && e.target.id==='snapshot-input'){const files=[...(e.target.files||[])]; if(!files.length) return; const r=new FileReader(); r.onload=ev=>{try{Object.assign(DATA, JSON.parse(ev.target.result)); App.set({});}catch(err){alert('Invalid JSON: '+err.message);}}; r.readAsText(files[0]);}
  if(e.target && e.target.id==='file-input'){const files=[...(e.target.files||[])]; if(!files.length) return; const target=(App.state.currentUploadTarget||'').split('::'); const caseId=target[0]||App.state.currentCaseId; const folderName=target[1]||'General'; const cs=findCase(caseId); if(!cs) return; cs.folders[folderName]=cs.folders[folderName]||[]; let remaining=files.length; const done=()=>{if(--remaining<=0) App.set({});}; files.forEach(file=>{const r=new FileReader(); r.onload=ev=>{cs.folders[folderName].push({name:file.name,size:file.size+' bytes',dataUrl:ev.target.result}); done();}; r.onerror=()=>{cs.folders[folderName].push({name:file.name,size:file.size+' bytes'}); done();}; r.readAsDataURL(file);});}
  if(e.target && e.target.id==='co-file-input'){const files=[...(e.target.files||[])]; if(!files.length) return; const target=(App.state.currentCompanyUploadTarget||'').split('::'); const companyId=target[0]||App.state.currentCompanyId; const folderName=target[1]||'General'; const co=findCompany(companyId); if(!co) return; co.folders[folderName]=co.folders[folderName]||[]; let remaining=files.length; const done=()=>{if(--remaining<=0) App.set({});}; files.forEach(file=>{const r=new FileReader(); r.onload=ev=>{co.folders[folderName].push({name:file.name,size:file.size+' bytes',dataUrl:ev.target.result}); done();}; r.onerror=()=>{co.folders[folderName].push({name:file.name,size:file.size+' bytes'}); done();}; r.readAsDataURL(file);});}
  if(e.target && e.target.id==='rs-file-templates'){const files=[...(e.target.files||[])]; if(!files.length) return; if(!DATA.resources) DATA.resources={templates:[],procedures:[]}; let remaining=files.length; const done=()=>{if(--remaining<=0) App.set({});}; files.forEach(file=>{const r=new FileReader(); r.onload=ev=>{DATA.resources.templates.push({name:file.name,size:file.size+' bytes',dataUrl:ev.target.result}); done();}; r.onerror=()=>{DATA.resources.templates.push({name:file.name,size:file.size+' bytes'}); done();}; r.readAsDataURL(file);});}
  if(e.target && e.target.id==='rs-file-procedures'){const files=[...(e.target.files||[])]; if(!files.length) return; if(!DATA.resources) DATA.resources={templates:[],procedures:[]}; let remaining=files.length; const done=()=>{if(--remaining<=0) App.set({});}; files.forEach(file=>{const r=new FileReader(); r.onload=ev=>{DATA.resources.procedures.push({name:file.name,size:file.size+' bytes',dataUrl:ev.target.result}); done();}; r.onerror=()=>{DATA.resources.procedures.push({name:file.name,size:file.size+' bytes'}); done();}; r.readAsDataURL(file);});}
  if(e.target && e.target.id==='flt-q'){const f=App.state.casesFilter||{q:""}; f.q=e.target.value; App.state.casesFilter=f; try{localStorage.setItem('synergy_filters_cases_v2104', JSON.stringify(f));}catch(_){ } App.set({});}
});

// Boot
document.addEventListener('DOMContentLoaded',()=>{try{const f=localStorage.getItem('synergy_filters_cases_v2104'); if(f) App.state.casesFilter=JSON.parse(f)||App.state.casesFilter;}catch(_){ } App.set({route:'dashboard'});});
})();
