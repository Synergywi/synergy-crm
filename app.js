(function(){
'use strict';
var BUILD='V7-clean';

// Demo DATA (seed)
window.DATA = window.DATA || {
  users:[
    {name:'Admin', email:'admin@synergy.com', role:'Admin'},
    {name:'Alex Ng', email:'alex@synergy.com', role:'Investigator'},
    {name:'Priya Menon', email:'priya@synergy.com', role:'Investigator'}
  ],
  companies:[
    {id:'C-001', name:'Sunrise Mining Pty Ltd'},
    {id:'C-002', name:'City of Melbourne'},
    {id:'C-003', name:'Queensland Health (Metro North)'}
  ],
  contacts:[
    {id:'ct1', name:'Alex Ng', email:'alex@synergy.com', companyId:'C-001'},
    {id:'ct2', name:'Priya Menon', email:'priya@synergy.com', companyId:'C-003'}
  ],
  cases:[
    {id:'c1', fileNumber:'INV-2025-001', title:'Bullying complaint in Finance', organisation:'Sunrise Mining Pty Ltd', status:'Planning', investigatorName:'Alex Ng', notes:[]},
    {id:'c2', fileNumber:'INV-2025-002', title:'Sexual harassment allegation', organisation:'Queensland Health (Metro North)', status:'Investigation', investigatorName:'Priya Menon', notes:[]},
    {id:'c3', fileNumber:'INV-2025-003', title:'Misconduct – data exfiltration', organisation:'City of Melbourne', status:'Evidence Review', investigatorName:'Admin', notes:[]}
  ],
  settings:{org:{name:'Your Org', color:'#1166cc'}}
};

// ---------- helpers ----------
function el(id){ return document.getElementById(id); }
function setBoot(msg){ var b=el('boot'); if(b) b.textContent=msg; }
function slugName(n){ return String(n||'user').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function ensureContactEmail(contact){
  if(contact && contact.email && String(contact.email).trim()!=='') return contact.email;
  // try to copy from users by name
  var u=(window.DATA.users||[]).find(function(x){ return x.name && contact.name && x.name.toLowerCase()===contact.name.toLowerCase(); });
  var mail = u && u.email ? u.email : (slugName(contact.name||contact.id)+'@example.local');
  contact.email = mail;
  return mail;
}
function loadSessions(){
  try{ return JSON.parse(localStorage.getItem('synergy_userSessions_v1')||'{}')||{}; }catch(e){ return {}; }
}
function saveSessions(store){
  try{ localStorage.setItem('synergy_userSessions_v1', JSON.stringify(store||{})); }catch(e){}
}
function sessionKey(contact){
  var em = ensureContactEmail(contact);
  return 'mail:'+String(em).trim().toLowerCase();
}

// Export helpers used by toolbar buttons
window.exportTimesheetRangeSummary = function(from,to){
  var w = window.open('','_blank'); if(!w){ alert('Pop-up blocked'); return; }
  w.document.write('<!doctype html><title>Summary</title><body><h2>Summary</h2><p>'+from+' → '+to+'</p></body>');
  w.document.close();
};
window.exportTimesheetRangeDetailed = function(from,to){
  var w = window.open('','_blank'); if(!w){ alert('Pop-up blocked'); return; }
  w.document.write('<!doctype html><title>Detailed</title><body><h2>Detailed</h2><p>'+from+' → '+to+'</p></body>');
  w.document.close();
};

// ---------- app shell ----------
window.App = {
  state:{ route:'dashboard', currentCaseId:null, currentContactId:null, currentCompanyId:null },
  set:function(p){ for(var k in p){ if(p.hasOwnProperty(k)) this.state[k]=p[k]; } render(); },
  get:function(){ return this.state; }
};

function Topbar(){
  return '<div class="card" style="margin-top:12px"><strong>Synergy CRM</strong><span style="float:right;color:#6b7b8f">Build '+BUILD+'</span></div>';
}
function Sidebar(active){
  var items=[
    ['dashboard','Dashboard'],
    ['cases','Cases'],
    ['contacts','Contacts'],
    ['companies','Companies'],
    ['documents','Documents'],
    ['resources','Resources'],
    ['admin','Admin'],
    ['settings','System Settings']
  ];
  var html='<aside><h3>Investigations</h3><ul class="nav">';
  for(var i=0;i<items.length;i++){
    var it=items[i];
    html+='<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>';
  }
  html+='</ul></aside>';
  return html;
}
function Shell(content,active){
  return '<div class="shell">'+Sidebar(active)+'<main>'+content+'</main></div>';
}

// ---------- views ----------
function Dashboard(){
  var cs=window.DATA.cases||[], contacts=window.DATA.contacts||[], companies=window.DATA.companies||[];
  var kpi = '<div class="grid-2" style="grid-template-columns:repeat(4,minmax(0,1fr))">'
          +  '<div class="card"><div class="muted">Open cases</div><div style="font-weight:700;font-size:22px">'+cs.filter(function(c){return (c.status||'').toLowerCase()!=='closed';}).length+'</div></div>'
          +  '<div class="card"><div class="muted">Investigators</div><div style="font-weight:700;font-size:22px">'+(window.DATA.users||[]).filter(function(u){return (u.role||'').toLowerCase()==='investigator';}).length+'</div></div>'
          +  '<div class="card"><div class="muted">Companies</div><div style="font-weight:700;font-size:22px">'+companies.length+'</div></div>'
          +  '<div class="card"><div class="muted">Contacts</div><div style="font-weight:700;font-size:22px">'+contacts.length+'</div></div>'
          + '</div>';
  var rows = cs.slice(0,8).map(function(c){
    return '<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+c.status+'</td>'
         + '<td class="right"><button class="btn light" data-act="open-case" data-id="'+c.id+'">Open</button></td></tr>';
  }).join('');
  var tbl = '<table><thead><tr><th>Case ID</th><th>Title</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>';
  var body = '<div class="card"><h3 style="margin:0 0 8px 0">Overview</h3><div class="muted">Boot OK</div>'+kpi+'</div>'
           + '<div class="section"><header><h3 class="section-title">Active Cases</h3>'
           + '<div><button class="btn light" data-act="route" data-arg="cases">View all</button></div></header>'+tbl+'</div>';
  return Shell(body,'dashboard');
}

function Cases(){
  var rows=(window.DATA.cases||[]).map(function(c){
    return '<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+c.organisation+'</td><td>'+c.status+'</td>'
         + '<td class="right"><button class="btn light" data-act="open-case" data-id="'+c.id+'">Open</button></td></tr>';
  }).join('');
  var body = '<div class="section"><header><h3 class="section-title">Cases</h3>'
           + '<div><button class="btn" data-act="new-case">New Case</button></div></header>'
           + '<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  return Shell(body,'cases');
}
function CaseDetail(id){
  var c=(window.DATA.cases||[]).find(function(x){return x.id===id;});
  if(!c) return Shell('<div class="card">Case not found.</div>','cases');
  var notes = (c.notes||[]).map(function(n){return '<li>'+n+'</li>';}).join('') || '<li class="muted">No notes yet</li>';
  var body = '<div class="section"><header><h3 class="section-title">Case '+c.fileNumber+'</h3>'
           + '<div><button class="btn success" data-act="save-case" data-id="'+c.id+'">Save</button> '
           + '<button class="btn" data-act="add-note" data-id="'+c.id+'">Add Note</button> '
           + '<button class="btn light" data-act="upload">Upload</button> '
           + '<button class="btn light" data-act="back-cases">Back to Cases</button></div></header>'
           + '<div class="grid-2">'
           +   '<div><label>Title<input id="case-title" class="input" value="'+(c.title||'')+'"></label>'
           +       '<label>Organisation<input id="case-org" class="input" value="'+(c.organisation||'')+'"></label>'
           +       '<label>Status<select id="case-status" class="input">'
           +           ['Planning','Investigation','Evidence Review','Closed'].map(function(s){return '<option '+(s===c.status?'selected':'')+'>'+s+'</option>';}).join('')
           +       '</select></label></div>'
           +   '<div><div class="card"><strong>Notes</strong><ul id="case-notes">'+notes+'</ul></div></div>'
           + '</div></div>';
  return Shell(body,'cases');
}

function Contacts(){
  var rows=(window.DATA.contacts||[]).map(function(c){
    return '<tr><td>'+c.name+'</td><td>'+ (c.email||'') +'</td><td>'+ (c.companyId||'') +'</td>'
         + '<td class="right"><button class="btn light" data-act="open-contact" data-id="'+c.id+'">Open</button></td></tr>';
  }).join('');
  var body='<div class="section"><header><h3 class="section-title">Contacts</h3></header>'
         + '<table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  return Shell(body,'contacts');
}
function ContactDetail(id){
  var c=(window.DATA.contacts||[]).find(function(x){return x.id===id;});
  if(!c) return Shell('<div class="card">Contact not found.</div>','contacts');
  ensureContactEmail(c);
  var store=loadSessions(); var key=sessionKey(c); var arr=store[key]||[]; var last=arr[arr.length-1];
  var lastText = last ? ('Last login: '+last.start+' • '+last.durationMins+'m') : 'No log yet';
  var body='<div class="section"><header><h3 class="section-title">Contact</h3>'
         + '<div><button class="btn success" data-act="save-contact" data-id="'+c.id+'">Save</button> '
         + '<button class="btn light" data-act="simulate-login" data-id="'+c.id+'">Simulate login</button> '
         + '<button class="btn light" data-act="clear-log" data-id="'+c.id+'">Clear log</button> '
         + '<button class="btn light" data-act="back-contacts">Back</button></div></header>'
         + '<div class="grid-2">'
         +   '<div><label>Name<input id="ct-name" class="input" value="'+(c.name||'')+'"></label>'
         +       '<label>Email<input id="ct-email" class="input" value="'+(c.email||'')+'"></label></div>'
         +   '<div><div class="card"><div id="ct-last" class="muted">'+lastText+'</div><ul id="ct-log">'
         +       arr.map(function(s){return '<li>'+s.start+' • '+s.durationMins+'m</li>';}).join('')
         +   '</ul></div></div>'
         + '</div></div>';
  return Shell(body,'contacts');
}

function Companies(){
  var rows=(window.DATA.companies||[]).map(function(c){
    return '<tr><td>'+c.id+'</td><td>'+c.name+'</td>'
         + '<td class="right"><button class="btn light" data-act="open-company" data-id="'+c.id+'">Open</button></td></tr>';
  }).join('');
  var body='<div class="section"><header><h3 class="section-title">Companies</h3></header>'
         + '<table><thead><tr><th>ID</th><th>Name</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  return Shell(body,'companies');
}
function CompanyDetail(id){
  var c=(window.DATA.companies||[]).find(function(x){return x.id===id;});
  if(!c) return Shell('<div class="card">Company not found.</div>','companies');
  var body='<div class="section"><header><h3 class="section-title">Company</h3>'
         + '<div><button class="btn success" data-act="save-company" data-id="'+c.id+'">Save</button> '
         + '<button class="btn light" data-act="back-companies">Back</button></div></header>'
         + '<label>Name<input id="co-name" class="input" value="'+(c.name||'')+'"></label></div>';
  return Shell(body,'companies');
}

function Documents(){ return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><div class="muted">Upload coming soon.</div></div>','documents'); }
function Resources(){ return Shell('<div class="section"><header><h3 class="section-title">Resources</h3></header><div class="muted">Add templates and procedures here.</div></div>','resources'); }
function Admin(){ return Shell('<div class="section"><header><h3 class="section-title">Timesheets</h3><div><button class="btn light" data-act="admin-export-sum">Export Summary</button> <button class="btn light" data-act="admin-export-det">Export Detailed</button></div></header><div class="muted">Use toolbar for date range.</div></div>','admin'); }
function Settings(){
  var s=(window.DATA.settings||{org:{}});
  var body='<div class="section"><header><h3 class="section-title">System Settings</h3>'
         + '<div><button class="btn success" data-act="settings-save">Save</button></div></header>'
         + '<label>Organization name<input id="set-org" class="input" value="'+(s.org.name||'')+'"></label>'
         + '<label>Primary color<input id="set-color" class="input" value="'+(s.org.color||'#1166cc')+'"></label>'
         + '</div>';
  return Shell(body,'settings');
}

// ---------- render ----------
function render(){
  var r=App.state.route;
  var out='';
  if(r==='dashboard') out=Dashboard();
  else if(r==='cases') out=Cases();
  else if(r==='case') out=CaseDetail(App.state.currentCaseId);
  else if(r==='contacts') out=Contacts();
  else if(r==='contact') out=ContactDetail(App.state.currentContactId);
  else if(r==='companies') out=Companies();
  else if(r==='company') out=CompanyDetail(App.state.currentCompanyId);
  else if(r==='documents') out=Documents();
  else if(r==='resources') out=Resources();
  else if(r==='admin') out=Admin();
  else if(r==='settings') out=Settings();
  else out=Dashboard();
  el('app').innerHTML = out;
  setBoot('Ready ('+DIST+')');
}

// ---------- events ----------
document.addEventListener('click', function(e){
  var t=e.target; while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode;
  if(!t || t===document) return;
  var act=t.getAttribute('data-act'), id=t.getAttribute('data-id'), arg=t.getAttribute('data-arg');
  if(act==='route'){ App.set({route:arg}); return; }

  if(act==='open-case'){ App.set({route:'case', currentCaseId:id}); return; }
  if(act==='new-case'){ var idn='c'+Math.random().toString(36).slice(2,8); window.DATA.cases.unshift({id:idn,fileNumber:'INV-'+(new Date().getFullYear())+'-'+('000'+(window.DATA.cases.length+1)).slice(-3),title:'New Case',organisation:'',status:'Planning',investigatorName:'Admin',notes:[]}); App.set({route:'case', currentCaseId:idn}); return; }
  if(act==='back-cases'){ App.set({route:'cases'}); return; }
  if(act==='save-case'){ var c=window.DATA.cases.find(function(x){return x.id===id;}); if(!c) return; c.title=(el('case-title')||{}).value||c.title; c.organisation=(el('case-org')||{}).value||c.organisation; c.status=(el('case-status')||{}).value||c.status; alert('Case saved'); return; }
  if(act==='add-note'){ var ca=window.DATA.cases.find(function(x){return x.id===id;}); if(!ca) return; var txt=prompt('New note'); if(txt){ ca.notes=ca.notes||[]; ca.notes.push(txt); App.set({}); } return; }
  if(act==='upload'){ alert('Upload not implemented in demo'); return; }

  if(act==='open-contact'){ App.set({route:'contact', currentContactId:id}); return; }
  if(act==='back-contacts'){ App.set({route:'contacts'}); return; }
  if(act==='save-contact'){ var c=window.DATA.contacts.find(function(x){return x.id===id;}); if(!c) return; c.name=(el('ct-name')||{}).value||c.name; c.email=(el('ct-email')||{}).value||c.email; ensureContactEmail(c); alert('Contact saved'); App.set({}); return; }
  if(act==='simulate-login'){ var cc=window.DATA.contacts.find(function(x){return x.id===id;}); if(!cc) return; ensureContactEmail(cc); var store=loadSessions(); var key=sessionKey(cc); store[key]=store[key]||[]; store[key].push({start:new Date().toISOString(), durationMins: Math.floor(10+Math.random()*90)}); saveSessions(store); alert('Simulated login added'); App.set({}); return; }
  if(act==='clear-log'){ var ccl=window.DATA.contacts.find(function(x){return x.id===id;}); if(!ccl) return; var st=loadSessions(); var k=sessionKey(ccl); st[k]=[]; saveSessions(st); App.set({}); return; }

  if(act==='open-company'){ App.set({route:'company', currentCompanyId:id}); return; }
  if(act==='back-companies'){ App.set({route:'companies'}); return; }
  if(act==='save-company'){ var co=window.DATA.companies.find(function(x){return x.id===id;}); if(!co) return; co.name=(el('co-name')||{}).value||co.name; alert('Company saved'); return; }

  if(act==='admin-export-sum'){ var today=new Date(), y=today.getFullYear(), m=('0'+(today.getMonth()+1)).slice(-2); var start=y+'-'+m+'-01', end=y+'-'+m+'-28'; window.exportTimesheetRangeSummary(start,end); return; }
  if(act==='admin-export-det'){ var today2=new Date(), y2=today2.getFullYear(), m2=('0'+(today2.getMonth()+1)).slice(-2); var s2=y2+'-'+m2+'-01', e2=y2+'-'+m2+'-28'; window.exportTimesheetRangeDetailed(s2,e2); return; }

  if(act==='settings-save'){ var s=window.DATA.settings||{org:{}}; s.org=s.org||{}; s.org.name=(el('set-org')||{}).value||s.org.name; s.org.color=(el('set-color')||{}).value||s.org.color; window.DATA.settings=s; try{ localStorage.setItem('synergy_settings_v1', JSON.stringify(s)); alert('Settings saved'); }catch(e){} return; }
});

document.addEventListener('DOMContentLoaded', function(){ render(); });
})();