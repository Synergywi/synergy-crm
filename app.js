(function(){ "use strict";
const BUILD="v2.12.3"; const STAMP=new Date().toISOString();
function uid(){return "id-"+Math.random().toString(36).slice(2,9);}
const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;
function mkCase(y,seq,p){let b={id:uid(),fileNumber:"INV-"+y+"-"+("00"+seq).slice(-3),title:"",organisation:"",companyId:"C-001",investigatorEmail:"",investigatorName:"",status:"Planning",priority:"Medium",created:y+"-"+("0"+((seq%12)||1)).slice(-2),notes:[],tasks:[],folders:{General:[]}}; Object.assign(b,p||{}); return b;}
const DATA={
  users:[{name:"Admin",email:"admin@synergy.com",role:"Admin"},{name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},{name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},{name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}],
  companies:[
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Private",phone:"07 345 5678",email:"admin@sunrisemining.com",website:"www.sunrisemining.com",abn:"12 345 678 901",acn:"345 678 901",state:"Queensland",city:"Brisbane",postcode:"4000",folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Public",phone:"03 0000 0000",email:"info@melbourne.gov.au",website:"",abn:"",acn:"",state:"VIC",city:"Melbourne",postcode:"3000",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Health",type:"Government",phone:"07 0000 0000",email:"",website:"",abn:"",acn:"",state:"QLD",city:"Brisbane",postcode:"4000",folders:{General:[]}}
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",companyId:"C-001",org:"Investigator",notes:""},
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
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

const App={state:{route:"companies",currentCompanyId:"C-001",currentCaseId:null,currentContactId:null,companyTab:"summary",caseTab:"details",contactTab:"details"}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

function Topbar(){return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>';}
function Sidebar(active){const items=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out='<aside><h3>Investigations</h3><ul class="nav">'; for(const it of items){out+='<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>';} out+='</ul></aside>'; return out;}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main>'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>';}

function Companies(){const d=App.get(); const cntC=cid=>d.contacts.filter(c=>c.companyId===cid).length; const cntK=cid=>d.cases.filter(c=>c.companyId===cid).length; let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+cntC(co.id)+'</td><td>'+cntK(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}

function CompanyPage(id){
  const d=App.get(), co=d.companies.find(x=>x.id===id); if(!co){App.set({route:'companies'}); return Shell('<div class="card">Company not found</div>','companies');}
  co.folders=co.folders||{General:[]};
  const tab=App.state.companyTab||'summary';
  const tabBtn=(k,l)=>'<div class="tab '+(tab===k?'active':'')+'" data-act="companyTab" data-arg="'+k+'">'+l+'</div>';
  const header='<div class="card"><div style="display:flex;gap:10px;align-items:center"><div class="avatar">'+co.name[0]+'</div><div><h2 style="margin:0">'+co.name+'</h2><div class="mono">'+(co.phone||'')+' · '+(co.email||'')+'</div></div><div class="sp"></div><button class="btn" data-act="editCompany" data-arg="'+id+'">Edit</button> <button class="btn danger" data-act="deleteCompany" data-arg="'+id+'">Delete</button> <button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>';
  const profile='<div class="card"><h3>About this company</h3><div class="kvs"><div class="k">Industry</div><div>'+(co.industry||'')+'</div><div class="k">Type</div><div>'+(co.type||'')+'</div><div class="k">State</div><div>'+(co.state||'')+'</div><div class="k">City</div><div>'+(co.city||'')+'</div><div class="k">Postcode</div><div>'+(co.postcode||'')+'</div><div class="k">ABN</div><div>'+(co.abn||'')+'</div><div class="k">ACN</div><div>'+(co.acn||'')+'</div><div class="k">Website</div><div>'+(co.website||'')+'</div></div></div>';
  const recCases=d.cases.filter(c=>c.companyId===co.id).slice(0,6);
  let summary='<div class="card"><h3 class="section-title">Recent Cases</h3>'; if(!recCases.length) summary+='<div class="muted">No cases</div>'; else summary+='<table><thead><tr><th>Case</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>'+recCases.map(c=>'<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>').join('')+'</tbody></table>'; summary+='</div>';
  const contacts=d.contacts.filter(c=>c.companyId===co.id); let cRows=contacts.length?'':'<tr><td colspan="5" class="muted">No contacts</td></tr>';
  for(const ct of contacts){cRows+='<tr><td>'+ct.name+'</td><td>'+(ct.email||'')+'</td><td>'+(ct.phone||'')+'</td><td>'+(ct.org||'')+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+ct.id+'">Open</button> '+(ct.email?('<a class="icon-mail" href="mailto:'+ct.email+'">✉</a>'):'')+'</td></tr>';}
  const tabContacts='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 class="section-title">Company Contacts</h3><div class="sp"></div><button class="btn" data-act="addCompanyContact" data-arg="'+id+'">Add contact</button></div><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Position/Org</th><th></th></tr></thead><tbody>'+cRows+'</tbody></table></div>';
  let docRows=''; for(const folder in co.folders){const files=co.folders[folder]||[]; docRows+='<tr><th colspan="3">'+folder+'</th></tr>'; docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="coSelectFiles" data-arg="'+id+'::'+folder+'">Upload to '+folder+'</button> '+(folder==='General'?'':'<button class="btn light" data-act="coDeleteFolder" data-arg="'+id+'::'+folder+'">Delete folder</button>')+'</td></tr>'; if(!files.length) docRows+='<tr><td colspan="3">No files</td></tr>'; for(const f of files){const a=id+'::'+folder+'::'+f.name; docRows+='<tr><td>'+f.name+'</td><td>'+f.size+'</td><td class="right">'+(f.dataUrl?('<button class="btn light" data-act="coViewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="coRemoveDoc" data-arg="'+a+'">Remove</button></td></tr>'; }}
  const tabDocs='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3 class="section-title">Company Documents</h3><div class="sp"></div><button class="btn light" data-act="coAddFolderPrompt" data-arg="'+id+'">Add folder</button></div><input type="file" id="co-file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';
  const right='<div><div class="tabs">'+tabBtn('summary','Summary')+tabBtn('contacts','Company Contacts')+tabBtn('docs','Company Documents')+'</div>'+ (tab==='contacts'?tabContacts:(tab==='docs'?tabDocs:summary)) +'</div>';
  return Shell(header+'<div class="page-wrap">'+profile+right+'</div>','companies');
}

function Cases(){const d=App.get(); let rows=''; for(const cc of d.cases){rows+='<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+cc.status+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>'; } return Shell('<div class="section"><header><h3 class="section-title">Cases</h3><button class="btn" data-act="newCase">New Case</button></header><table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');}

function CasePage(id){
  const d=App.get(), cs=d.cases.find(c=>c.id===id); if(!cs){App.set({route:'cases'}); return Shell('<div class="card">Case not found</div>','cases');}
  cs.folders=cs.folders||{General:[]};
  const invOpts=()=>d.users.filter(u=>["Investigator","Reviewer","Admin"].includes(u.role)).map(u=>'<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>').join('');
  const coOpts=()=>d.companies.map(co=>'<option '+(co.id===cs.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>').join('');
  const header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>'+cs.fileNumber+'</h2><div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save</button> <button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete</button> <button class="btn light" data-act="route" data-arg="cases">Back</button></div></div>';
  const tabs=[["details","Details"],["notes","Notes"],["tasks","Tasks"],["docs","Documents"]]; const active=App.state.caseTab||"details"; const tabBtns=tabs.map(t=>'<div class="tab '+(active===t[0]?'active':'')+'" data-act="caseTab" data-arg="'+t[0]+'">'+t[1]+'</div>').join('');
  const details='<div class="card"><div class="grid cols-2"><div><label>Case ID</label><input class="input" id="c-id" value="'+(cs.fileNumber||'')+'"></div><div><label>Organisation</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div><div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div><div><label>Company</label><select class="input" id="c-company">'+coOpts()+'</select></div><div><label>Investigator</label><select class="input" id="c-inv">'+invOpts()+'</select></div><div><label>Status</label><select class="input" id="c-status"><option'+(cs.status==='Planning'?' selected':'')+'>Planning</option><option'+(cs.status==='Investigation'?' selected':'')+'>Investigation</option><option'+(cs.status==='Evidence Review'?' selected':'')+'>Evidence Review</option><option'+(cs.status==='Reporting'?' selected':'')+'>Reporting</option><option'+(cs.status==='Closed'?' selected':'')+'>Closed</option></select></div><div><label>Priority</label><select class="input" id="c-priority"><option'+(cs.priority==='Low'?' selected':'')+'>Low</option><option'+(cs.priority==='Medium'?' selected':'')+'>Medium</option><option'+(cs.priority==='High'?' selected':'')+'>High</option><option'+(cs.priority==='Critical'?' selected':'')+'>Critical</option></select></div></div></div>';
  let notesRows=(cs.notes&&cs.notes.length)?'':'<tr><td colspan="3">No notes</td></tr>'; for(const nn of (cs.notes||[])){notesRows+='<tr><td>'+ (nn.time||'') +'</td><td>'+ (nn.by||'') +'</td><td>'+ (nn.text||'') +'</td></tr>'; } const notes='<div class="card"><div class="section"><header><h3 class="section-title">Case Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add Note</button></header><textarea class="input" id="note-text" placeholder="Type your note here"></textarea><table><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'+notesRows+'</tbody></table></div></div>';
  let taskRows=(cs.tasks&&cs.tasks.length)?'':'<tr><td colspan="5">No tasks</td></tr>'; for(const tt of (cs.tasks||[])){taskRows+='<tr><td>'+tt.id+'</td><td>'+tt.title+'</td><td>'+tt.assignee+'</td><td>'+tt.due+'</td><td>'+tt.status+'</td></tr>'; } const tasks='<div class="card"><div class="section"><header><h3 class="section-title">Tasks</h3><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></header><div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts()+'</select></div><div style="text-align:right;margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+taskRows+'</tbody></table></div></div>';
  let docRows=''; for(const folder in cs.folders){const files=cs.folders[folder]||[]; docRows+='<tr><th colspan="3">'+folder+'</th></tr>'; docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+folder+'">Upload to '+folder+'</button> '+(folder==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+folder+'">Delete folder</button>')+'</td></tr>'; if(!files.length) docRows+='<tr><td colspan="3">No files</td></tr>'; for(const f of files){const a=id+'::'+folder+'::'+f.name; docRows+='<tr><td>'+f.name+'</td><td>'+f.size+'</td><td class="right">'+(f.dataUrl?('<button class="btn light" data-act="viewDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeDoc" data-arg="'+a+'">Remove</button></td></tr>'; }}
  const docs='<div class="card"><div class="section"><header><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div></div>';
  const body='<div class="card"><div class="tabs">'+tabBtns+'</div>'+(active==='notes'?notes:(active==='tasks'?tasks:(active==='docs'?docs:details)))+'</div>';
  return Shell(header+body,'cases');
}

function Contacts(){const d=App.get(); const coName=id=>{const co=d.companies.find(x=>x.id===id); return co?co.name:"";}; let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>'; } return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}

function ContactPage(id){
  const d=App.get(), c=d.contacts.find(x=>x.id===id); if(!c) return Shell('<div class="card">Contact not found</div>','contacts');
  c.portal=c.portal||{enabled:true,role:(c.role||'Investigator')};
  const coOpts=()=>['<option value="">(No linked company)</option>'].concat(d.companies.map(co=>'<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>')).join('');
  const header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save</button><button class="btn danger" data-act="deleteContact" data-arg="'+id+'">Delete</button><button class="btn light" data-act="route" data-arg="contacts">Back</button></div></div>';
  const tabs=[["details","Details"],["portal","Portal"]]; const active=App.state.contactTab||"details"; const tabBtns=tabs.map(t=>'<div class="tab '+(active===t[0]?'active':'')+'" data-act="contactTab" data-arg="'+t[0]+'">'+t[1]+'</div>').join('');
  const details='<div class="card"><div class="grid cols-4" style="margin-top:12px"><div><label>Contact Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Phone</label><input class="input" id="ct-phone" value="'+(c.phone||'')+'"></div><div><label>Position/Org</label><input class="input" id="ct-org" value="'+(c.org||'')+'"></div><div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">'+coOpts()+'</select></div><div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">'+(c.notes||'')+'</textarea></div></div></div>';
  const portal='<div class="card"><div class="grid cols-4"><div><label>Status</label><div class="chip">'+(c.portal.enabled?'Enabled':'Disabled')+'</div></div><div><label>Role</label><select class="input" id="ct-role"><option'+(c.portal.role==='Investigator'?' selected':'')+'>Investigator</option><option'+(c.portal.role==='Reviewer'?' selected':'')+'>Reviewer</option><option'+(c.portal.role==='Admin'?' selected':'')+'>Admin</option></select></div><div class="right" style="grid-column:span 4;margin-top:8px"><button class="btn light" data-act="viewPortal" data-arg="'+id+'">View portal</button> <button class="btn light" data-act="updateRole" data-arg="'+id+'">Update Role</button> <button class="btn light" data-act="revokePortal" data-arg="'+id+'">Revoke</button></div></div></div>';
  const body='<div class="card"><div class="tabs">'+tabBtns+'</div>'+(active==='portal'?portal:details)+'</div>';
  return Shell(header+body,'contacts');
}

// Routing + actions
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
  if(act==='route'){App.set({route:arg}); return;}
  if(act==='openCompany'){App.set({currentCompanyId:arg,companyTab:'summary',route:'company'}); return;}
  if(act==='openCase'){App.set({currentCaseId:arg,caseTab:'details',route:'case'}); return;}
  if(act==='openContact'){App.set({currentContactId:arg,contactTab:'details',route:'contact'}); return;}
  if(act==='newCompany'){const c={id:"C-"+('00'+(d.companies.length+1)).slice(-3),name:'New Company',folders:{General:[]}}; d.companies.unshift(c); App.set({currentCompanyId:c.id,route:'company'}); return;}
  if(act==='newCase'){const seq=('00'+(d.cases.length+1)).slice(-3), inv=d.users[0]; const cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created:(new Date()).toISOString().slice(0,7),notes:[],tasks:[],folders:{General:[]}}; d.cases.unshift(cs); App.set({currentCaseId:cs.id,route:'case'}); return;}
  if(act==='companyTab'){App.set({companyTab:arg}); return;}
  if(act==='caseTab'){App.set({caseTab:arg}); return;}
  if(act==='contactTab'){App.set({contactTab:arg}); return;}
  if(act==='addCompanyContact'){const nc={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:arg,notes:''}; d.contacts.unshift(nc); App.set({currentContactId:nc.id,route:'contact'}); return;}
  // Company docs
  if(act==='coAddFolderPrompt'){const co=d.companies.find(c=>c.id===arg); if(!co) return; const name=prompt('New folder name'); if(!name) return; co.folders[name]=co.folders[name]||[]; App.set({companyTab:'docs'}); return;}
  if(act==='coSelectFiles'){App.state.currentCompanyUploadTarget=arg; const fi=document.getElementById('co-file-input'); if(fi) fi.click(); return;}
  if(act==='coViewDoc'){const p=arg.split('::'); const co=d.companies.find(c=>c.id===p[0]); if(!co) return; const list=co.folders[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
  if(act==='coRemoveDoc'){const p=arg.split('::'); const co=d.companies.find(c=>c.id===p[0]); if(!co) return; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({companyTab:'docs'}); return;}
  if(act==='coDeleteFolder'){const p=arg.split('::'); const co=d.companies.find(c=>c.id===p[0]); if(!co) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General'); return;} if(confirm('Delete folder '+folder+' and its files?')){delete co.folders[folder]; App.set({companyTab:'docs'});} return;}
  // Case save/delete
  if(act==='saveCase'){const cs=d.cases.find(c=>c.id===arg); if(!cs) return; const gv=id=>{const el=document.getElementById(id); return el?el.value:null;}; const setIf=(k,v)=>{if(v!=null) cs[k]=v;}; setIf('title',gv('c-title')); setIf('organisation',gv('c-org')); const coV=gv('c-company'); if(coV!=null) cs.companyId=coV; const invE=gv('c-inv'); if(invE!=null){cs.investigatorEmail=invE; const u=d.users.find(x=>x.email===invE); cs.investigatorName=u?u.name:'';} setIf('status',gv('c-status')); setIf('priority',gv('c-priority')); const idEl=document.getElementById('c-id'); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim(); alert('Case saved'); return;}
  if(act==='deleteCase'){const cs=d.cases.find(c=>c.id===arg); if(!cs) return; if(confirm('Delete '+(cs.fileNumber||cs.id)+'?')){ DATA.cases=DATA.cases.filter(c=>c.id!==arg); App.set({route:'cases'});} return;}
  if(act==='addNote'){const cs=d.cases.find(c=>c.id===arg); if(!cs) return; const tx=document.getElementById('note-text').value; if(!tx){alert('Enter a note');return;} const stamp=new Date().toISOString().slice(0,16).replace('T',' '); const me=(DATA.me&&DATA.me.email)||'admin@synergy.com'; cs.notes.unshift({time:stamp,by:me,text:tx}); App.set({}); return;}
  if(act==='addStdTasks'){const cs=d.cases.find(c=>c.id===arg); if(!cs) return; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(ti=>cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:ti,assignee:cs.investigatorName||'',due:'',status:'Open'})); App.set({}); return;}
  if(act==='addTask'){const cs=d.cases.find(c=>c.id===arg); if(!cs) return; const sel=document.getElementById('task-assignee'); const who=sel?sel.options[sel.selectedIndex].text:''; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:document.getElementById('task-title').value,assignee:who,due:document.getElementById('task-due').value,status:'Open'}); App.set({}); return;}
  // Contact portal
  if(act==='viewPortal'){alert('Portal view (stub)'); return;}
  if(act==='updateRole'){const c=d.contacts.find(x=>x.id===arg); if(!c) return; const el=document.getElementById('ct-role'); if(el){ c.portal=c.portal||{}; c.portal.role=el.value; alert('Role updated'); } return;}
  if(act==='revokePortal'){const c=d.contacts.find(x=>x.id===arg); if(!c) return; c.portal=c.portal||{}; c.portal.enabled=false; alert('Portal revoked'); App.set({}); return;}
});

// Upload handlers
function readFilesToList(fileList, pushFn, done){
  const files=Array.from(fileList||[]); if(!files.length){ if(done) done(); return; }
  let i=0; (function next(){ if(i>=files.length){ if(done) done(); return; } const f=files[i++]; const r=new FileReader(); r.onload=e=>{ pushFn({name:f.name,size:f.size,dataUrl:e.target.result}); next(); }; r.readAsDataURL(f);}());
}
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='file-input'){ const p=(App.state.currentUploadTarget||'').split('::'); const cs=DATA.cases.find(c=>c.id===p[0]); if(!cs) return; const folder=p[1]||'General'; cs.folders[folder]=cs.folders[folder]||[]; readFilesToList(t.files,o=>cs.folders[folder].push(o),()=>App.set({})); }
  if(t.id==='co-file-input'){ const p=(App.state.currentCompanyUploadTarget||'').split('::'); const co=DATA.companies.find(c=>c.id===p[0]); if(!co) return; const folder=p[1]||'General'; co.folders[folder]=co.folders[folder]||[]; readFilesToList(t.files,o=>co.folders[folder].push(o),()=>App.set({companyTab:'docs'})); }
});

function render(){const r=App.state.route, el=document.getElementById('app'); if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='cases') el.innerHTML=Cases(); else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else el.innerHTML=Companies();}

document.addEventListener('DOMContentLoaded',()=>{ App.set({}); });
})(); 
