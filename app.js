(function(){ 'use strict';
var BUILD='baseline-1.0.0', STAMP='2025-08-19T02:40:28';
var KEY='synergy_data_full_v3';

function save(){ try{ localStorage.setItem(KEY, JSON.stringify(DATA)); }catch(_){} }
function load(){ try{ var raw=localStorage.getItem(KEY); return raw?JSON.parse(raw):null; }catch(_ ){ return null; } }
function uid(){ return 'id-'+Math.random().toString(36).slice(2,9); }
function nowISO(){ return new Date().toISOString(); }
var YEAR=(new Date()).getFullYear();

function seed(){
  var users=[
    {name:'Admin',email:'admin@synergy.com',role:'Admin'},
    {name:'Alex Ng',email:'alex@synergy.com',role:'Investigator'},
    {name:'Priya Menon',email:'priya@synergy.com',role:'Investigator'},
    {name:'Chris Rice',email:'chris@synergy.com',role:'Reviewer'}
  ];
  var companies=[
    {id:'C-001',name:'Sunrise Mining Pty Ltd',folders:{General:[]}},
    {id:'C-002',name:'City of Melbourne',folders:{General:[]}},
    {id:'C-003',name:'Queensland Health (Metro North)',folders:{General:[]}}
  ];
  var contacts=[
    {id:uid(),name:'Alex Ng',email:'alex@synergy.com',companyId:'C-001',notes:'Investigator for Sunrise.'},
    {id:uid(),name:'Priya Menon',email:'priya@synergy.com',companyId:'C-003',notes:''},
    {id:uid(),name:'Chris Rice',email:'chris@synergy.com',companyId:'C-002',notes:''}
  ];
  function mkCase(y,s,p){var c={id:uid(),fileNumber:'INV-'+y+'-'+('00'+s).slice(-3),title:'',organisation:'',companyId:'C-001',investigatorEmail:'',investigatorName:'',status:'Planning',priority:'Medium',created:y+'-01',notes:[],tasks:[],people:[],folders:{General:[]}};for(var k in p) c[k]=p[k]; return c;}
  var cases=[
    mkCase(YEAR-1,101,{title:'Safety complaint – workshop',organisation:'Sunrise Mining Pty Ltd',companyId:'C-001',investigatorEmail:'alex@synergy.com',investigatorName:'Alex Ng',status:'Closed',priority:'Medium',created:(YEAR-1)+'-01'}),
    mkCase(YEAR-1,102,{title:'Bullying allegation – IT',organisation:'City of Melbourne',companyId:'C-002',investigatorEmail:'priya@synergy.com',investigatorName:'Priya Menon',status:'Closed',priority:'High',created:(YEAR-1)+'-07'}),
    mkCase(YEAR,1,{title:'Bullying complaint in Finance',organisation:'Sunrise Mining Pty Ltd',companyId:'C-001',investigatorEmail:'alex@synergy.com',investigatorName:'Alex Ng',status:'Investigation',priority:'High',created:YEAR+'-01'}),
    mkCase(YEAR,2,{title:'Sexual harassment allegation at Brisbane site',organisation:'Queensland Health (Metro North)',companyId:'C-003',investigatorEmail:'priya@synergy.com',investigatorName:'Priya Menon',status:'Planning',priority:'Critical',created:YEAR+'-06'}),
    mkCase(YEAR,3,{title:'Misconduct – data exfiltration',organisation:'City of Melbourne',companyId:'C-002',investigatorEmail:'chris@synergy.com',investigatorName:'Chris Rice',status:'Evidence Review',priority:'Medium',created:YEAR+'-07'})
  ];
  var cal=[
    {id:uid(),title:'Case intake - Sunrise',date:YEAR+'-08-03',start:'09:00',end:'10:00',type:'Appointment',location:'HQ',caseId:cases[2].id,owner:'admin@synergy.com'},
    {id:uid(),title:'Interview planning',date:YEAR+'-08-06',start:'11:00',end:'12:00',type:'Appointment',location:'Room 2',caseId:cases[2].id,owner:'alex@synergy.com'},
    {id:uid(),title:'Evidence review',date:YEAR+'-08-13',start:'13:00',end:'14:00',type:'Appointment',location:'HQ',caseId:cases[4].id,owner:'chris@synergy.com'},
    {id:uid(),title:'Draft report sync',date:YEAR+'-08-22',start:'15:00',end:'15:30',type:'Note',location:'',caseId:'',owner:'priya@synergy.com'}
  ];
  return {users:users,me:{name:'Admin',email:'admin@synergy.com',role:'Admin'},companies:companies,contacts:contacts,cases:cases,calendar:cal,notifications:[],resources:{templates:[],procedures:[]},settings:{emailAlerts:true},version:BUILD};
}

var DATA = load() || seed();

var App = { state: { route:'dashboard', currentCaseId:null, currentCompanyId:null, currentContactId:null, asUser:null, calCursor:(function(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);})(), showUnread:false, caseTab:'details', casesFilter:{q:''} },
  set: function(p){ for(var k in p) App.state[k]=p[k]; render(); },
  get: function(){ return DATA; }
};

function userFor(email){ email=(email||'').toLowerCase(); for(var i=0;i<DATA.users.length;i++) if((DATA.users[i].email||'').toLowerCase()===email) return DATA.users[i]; return null; }
function findCase(id){ for(var i=0;i<DATA.cases.length;i++) if(DATA.cases[i].id===id) return DATA.cases[i]; return null; }
function findCompany(id){ for(var i=0;i<DATA.companies.length;i++) if(DATA.companies[i].id===id) return DATA.companies[i]; return null; }
function findContact(id){ for(var i=0;i<DATA.contacts.length;i++) if(DATA.contacts[i].id===id) return DATA.contacts[i]; return null; }
function findEvent(id){ for(var i=0;i<(DATA.calendar||[]).length;i++) if(DATA.calendar[i].id===id) return DATA.calendar[i]; return null; }
function statusChip(s){ return '<span class="status '+s.replace(/\s/g,' ')+'">'+s+'</span>'; }
function val(id){ var el=document.getElementById(id); return el?el.value:''; }

function Topbar(){
  var me = App.state.asUser || DATA.me;
  var unread=(DATA.notifications||[]).filter(function(n){return !n.read;}).length;
  var bell=(DATA.me.role==='Admin')?('<div class="bell" data-act="route" data-arg="dashboard" title="Notifications"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill="#fff" d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zM9 18a3 3 0 006 0H9z"/></svg>'+ (unread?'<span class="dot">'+unread+'</span>':'') +'</div>') : '';
  var as = App.state.asUser?('<span class="chip">You: '+(me.name||me.email)+' ('+(me.role||'')+')</span> <button class="btn light" data-act="exitImpersonate">Switch to Admin</button> '):'';
  return '<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div>'+as+bell+'<span class="badge">Soft Stable '+BUILD+'</span></div>';
}

function Sidebar(active){
  var routes=[['dashboard','Dashboard'],['calendar','Calendar'],['cases','Cases'],['companies','Companies'],['contacts','Contacts'],['documents','Documents'],['resources','Resources'],['admin','Admin']];
  var out='<aside class="sidebar"><h3>Investigations</h3><ul class="nav">';
  for(var i=0;i<routes.length;i++){ var r=routes[i]; out+='<li '+(active===r[0]?'class="active"':'')+' data-act="route" data-arg="'+r[0]+'">'+r[1]+'</li>'; }
  out+='</ul></aside>'; return out;
}
function Shell(content,active){ return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div>'; }

function Dashboard(){
  var d=DATA;
  var rows='';
  for(var i=0;i<d.cases.length;i++){ var c=d.cases[i]; rows+='<tr><td>'+c.fileNumber+'</td><td>'+c.organisation+'</td><td>'+c.investigatorName+'</td><td>'+statusChip(c.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>'; }
  var notifRows='';
  var list=(App.state.showUnread?(d.notifications||[]).filter(function(n){return !n.read;}):(d.notifications||[]));
  if(!list.length) notifRows='<tr><td colspan="3" class="muted">No notifications</td></tr>';
  for(var j=0;j<list.length;j++){ var n=list[j]; notifRows+='<tr><td>'+n.time.replace('T',' ').slice(0,16)+'</td><td>'+n.action+'</td><td>'+n.title+'</td><td class="right"><button class="btn light" data-act="openEventFromNotif" data-arg="'+n.eventId+'">Open</button> <button class="btn light" data-act="dismissNotif" data-arg="'+n.id+'">Dismiss</button></td></tr>'; }
  var html=''
   + '<div class="card"><div style="display:flex;align-items:center;gap:8px"><h3>Welcome</h3><div class="sp"></div></div><div class="mono">Timestamp: '+new Date().toISOString().replace('T',' ').slice(0,19)+'</div></div>'
   + '<div class="grid cols-2">'
   +   '<div class="section"><header><h3 class="section-title">Active Cases</h3></header><table><thead><tr><th>Case ID</th><th>Company</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'
   +   '<div class="section"><header><h3 class="section-title">Calendar updates (Admin)</h3><div><button class="btn light" data-act="toggleUnread">'+(App.state.showUnread?'Show all':'Show unread')+'</button> <button class="btn light" data-act="markAllRead">Mark all read</button></div></header><table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>'+notifRows+'</tbody></table></div>'
   + '</div>';
  return Shell(html,'dashboard');
}

function monthDays(yyyymm){
  var y=parseInt(yyyymm.slice(0,4),10), m=parseInt(yyyymm.slice(5),10)-1;
  var start=new Date(y,m,1);
  var sday=start.getDay(); if(sday===0) sday=7; // Monday-first
  var cur=new Date(y,m,1-sday+1);
  var res=[]; for(var i=0;i<42;i++){ res.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
  return res;
}

function Calendar(){
  var me=App.state.asUser||DATA.me;
  var owner=me.role==='Admin'?null:(me.email||'').toLowerCase();
  var d=DATA, yyyymm=App.state.calCursor, days=monthDays(yyyymm);
  function evsFor(date){
    var ds=date.toISOString().slice(0,10);
    var list=(d.calendar||[]).filter(function(e){ var ok=(e.date===ds); if(!ok) return false; if(owner&& (e.owner||'').toLowerCase()!==owner) return false; return true; });
    return list;
  }
  var head='<div class="cal-head"><button class="btn light" data-act="calPrev">◀</button><button class="btn light" data-act="calToday">Today</button><h3 style="margin:0 8px">'+new Date(yyyymm+'-01').toLocaleString(undefined,{month:'long',year:'numeric'})+'</h3><div class="sp"></div></div>';
  var grid='<div class="cal-grid">';
  for(var i=0;i<days.length;i++){ var dt=days[i]; var evs=evsFor(dt); var dnum=dt.getDate(); grid+='<div class="day"><div class="dnum">'+dnum+'</div>'; for(var j=0;j<evs.length;j++){ var e=evs[j]; grid+='<div class="ev '+(e.type==='Appointment'?'appt':'note')+'" data-act="openEvent" data-arg="'+e.id+'"><span class="dot"></span><span>'+e.title+'</span><span class="type-badge">'+(e.type||'')+'</span></div>'; } grid+='</div>'; }
  grid+='</div>';
  var addForm=''
    + '<div class="card"><h3 style="margin:0 0 8px">Add Event (any user)</h3>'
    + '<div class="grid cols-4">'
    + '<input class="input" id="ev-title" placeholder="Appointment or note">'
    + '<input class="input" id="ev-date" type="date">'
    + '<select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select>'
    + '<input class="input" id="ev-location" placeholder="Location">'
    + '<input class="input" id="ev-start" type="time" value="09:00">'
    + '<input class="input" id="ev-end" type="time" value="10:00">'
    + '<select class="input" id="ev-case"><option value="">(Optional) Link to case</option>'+DATA.cases.map(function(c){return '<option value="'+c.id+'">'+c.fileNumber+' — '+c.title+'</option>';}).join('')+'</select>'
    + '<select class="input" id="ev-owner">'+DATA.users.map(function(u){return '<option value="'+u.email+'">'+u.name+' ('+u.role+')</option>';}).join('')+'</select>'
    + '</div><div class="right" style="margin-top:8px"><button class="btn" data-act="addEvent">Add</button></div></div>';
  var html='<div class="calendar">'+head+grid+'</div>'+addForm+EventModal();
  return Shell(html,'calendar');
}

function EventModal(){
  return '<div class="modal" id="ev-modal"><div class="panel">'
    + '<h3 style="margin:0 0 8px">Edit Event</h3>'
    + '<div class="grid cols-2">'
    + '<div><label>Title</label><input class="input" id="em-title"></div>'
    + '<div><label>Date</label><input class="input" id="em-date" type="date"></div>'
    + '<div><label>Start</label><input class="input" id="em-start" type="time"></div>'
    + '<div><label>End</label><input class="input" id="em-end" type="time"></div>'
    + '<div><label>Type</label><select class="input" id="em-type"><option>Appointment</option><option>Note</option></select></div>'
    + '<div><label>Location</label><input class="input" id="em-location"></div>'
    + '<div style="grid-column:span 2"><label>Case (optional)</label><select class="input" id="em-case"><option value="">None</option>'+DATA.cases.map(function(c){return '<option value="'+c.id+'">'+c.fileNumber+' — '+c.title+'</option>';}).join('')+'</select></div>'
    + '</div>'
    + '<div class="actions"><button class="btn danger" id="em-delete">Delete</button><button class="btn light" id="em-cancel">Cancel</button><button class="btn success" id="em-save">Save</button></div>'
    + '</div></div>';
}
function openEventModal(ev){
  var m=document.getElementById('ev-modal'); if(!m) return;
  m.classList.add('show'); m.setAttribute('data-id', ev.id);
  document.getElementById('em-title').value=ev.title||'';
  document.getElementById('em-date').value=ev.date||'';
  document.getElementById('em-start').value=ev.start||'';
  document.getElementById('em-end').value=ev.end||'';
  document.getElementById('em-type').value=ev.type||'Appointment';
  document.getElementById('em-location').value=ev.location||'';
  document.getElementById('em-case').value=ev.caseId||'';
}
function closeEventModal(){
  var m=document.getElementById('ev-modal'); if(m) m.classList.remove('show');
}

function Cases(){
  var f=App.state.casesFilter||{q:''};
  var list=DATA.cases.filter(function(c){ if(!f.q) return true; var q=f.q.toLowerCase(); return (c.title||'').toLowerCase().indexOf(q)>-1 || (c.organisation||'').toLowerCase().indexOf(q)>-1 || (c.fileNumber||'').toLowerCase().indexOf(q)>-1; });
  var rows=list.map(function(cc){return '<tr><td>'+cc.fileNumber+'</td><td>'+cc.title+'</td><td>'+cc.organisation+'</td><td>'+cc.investigatorName+'</td><td>'+statusChip(cc.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+cc.id+'">Open</button></td></tr>';}).join('');
  var tools='<div class="grid cols-4" style="gap:8px"><input class="input" id="flt-q" placeholder="Search title, org, ID" value="'+(f.q||'')+'"></div><div class="right" style="margin-top:8px"><button class="btn light" data-act="resetCaseFilters">Reset</button> <button class="btn" data-act="newCase">New Case</button></div>';
  return Shell('<div class="section"><header><h3 class="section-title">Cases</h3></header>'+tools+'<table><thead><tr><th>Case ID</th><th>Title</th><th>Organisation</th><th>Investigator</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','cases');
}

function caseTabs(id){
  var tabs=['details','notes','tasks','documents','people','calendar'];
  var out='<div class="card" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">';
  for(var i=0;i<tabs.length;i++){ var t=tabs[i]; out+='<button class="btn light" data-act="caseTab" data-arg="'+t+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'; }
  out+='</div>'; return out;
}

function CasePage(id){
  var cs=findCase(id); if(!cs) return Shell('<div class="card">Case not found.</div>','cases');
  if(!cs.folders) cs.folders={General:[]};
  if(!cs.people) cs.people=[];

  var invOpts=DATA.users.filter(function(u){return ['Investigator','Reviewer','Admin'].indexOf(u.role)>-1;}).map(function(u){return '<option '+(u.email===cs.investigatorEmail?'selected':'')+' value="'+u.email+'">'+u.name+' ('+u.role+')</option>';}).join('');
  var coOpts=DATA.companies.map(function(co){return '<option '+(co.id===cs.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>';}).join('');

  var header='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Case '+cs.fileNumber+'</h2><div class="sp"></div><button class="btn" data-act="saveCase" data-arg="'+id+'">Save Case</button> <button class="btn danger" data-act="deleteCase" data-arg="'+id+'">Delete Case</button> <button class="btn light" data-act="route" data-arg="cases">Back to Cases</button></div></div>';

  var details='<div class="card"><div class="grid cols-2">'
    + '<div><label>Case ID</label><input class="input" id="c-id" value="'+(cs.fileNumber||'')+'"></div>'
    + '<div><label>Organisation (display)</label><input class="input" id="c-org" value="'+(cs.organisation||'')+'"></div>'
    + '<div><label>Title</label><input class="input" id="c-title" value="'+(cs.title||'')+'"></div>'
    + '<div><label>Company</label><select class="input" id="c-company">'+coOpts+'</select></div>'
    + '<div><label>Investigator</label><select class="input" id="c-inv">'+invOpts+'</select></div>'
    + '<div><label>Status</label><select class="input" id="c-status"><option>Planning</option><option>Investigation</option><option>Evidence Review</option><option>Reporting</option><option>Closed</option></select></div>'
    + '<div><label>Priority</label><select class="input" id="c-priority"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>'
    + '</div></div>';

  var notes='<div class="card"><header style="display:flex;justify-content:space-between"><h3 class="section-title">Notes</h3><button class="btn light" data-act="addNote" data-arg="'+id+'">Add Note</button></header><textarea id="note-text" class="input" placeholder="Type your note here"></textarea>'
    + '<table style="margin-top:8px"><thead><tr><th>Time</th><th>By</th><th>Note</th></tr></thead><tbody>'
    + ((cs.notes||[]).map(function(n){return '<tr><td>'+n.time+'</td><td>'+n.by+'</td><td>'+n.text+'</td></tr>';}).join('')||'<tr><td colspan="3" class="muted">No notes yet.</td></tr>')
    + '</tbody></table></div>';

  var tasksRows=(cs.tasks||[]).map(function(t){return '<tr><td>'+t.id+'</td><td>'+t.title+'</td><td>'+t.assignee+'</td><td>'+t.due+'</td><td>'+t.status+'</td></tr>';}).join('') || '<tr><td colspan="5" class="muted">No tasks yet.</td></tr>';
  var tasks='<div class="card"><header style="display:flex;justify-content:space-between"><h3 class="section-title">Tasks</h3><div><button class="btn light" data-act="addStdTasks" data-arg="'+id+'">Add standard tasks</button></div></header><div class="grid cols-3"><input class="input" id="task-title" placeholder="Task title"><input class="input" id="task-due" type="date"><select class="input" id="task-assignee">'+invOpts+'</select></div><div class="right" style="margin-top:6px"><button class="btn light" data-act="addTask" data-arg="'+id+'">Add</button></div><table style="margin-top:8px"><thead><tr><th>ID</th><th>Title</th><th>Assignee</th><th>Due</th><th>Status</th></tr></thead><tbody>'+tasksRows+'</tbody></table></div>';

  var docRows=''; for(var fn in cs.folders){ if(!cs.folders.hasOwnProperty(fn)) continue; var files=cs.folders[fn]; docRows+='<tr><th colspan="3">'+fn+'</th></tr>'; docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectFiles" data-arg="'+id+'::'+fn+'">Upload to '+fn+'</button> '+(fn==='General'?'':'<button class="btn light" data-act="deleteFolder" data-arg="'+id+'::'+fn+'">Delete folder</button>')+'</td></tr>'; if(!files.length) docRows+='<tr><td colspan="3" class="muted">No files</td></tr>'; for(var k=0;k<files.length;k++){ var f=files[k]; var arg=id+'::'+fn+'::'+f.name; docRows+='<tr><td>'+f.name+'</td><td>'+f.size+'</td><td class="right"><button class="btn light" data-act="viewDoc" data-arg="'+arg+'">Preview</button> <button class="btn light" data-act="removeDoc" data-arg="'+arg+'">Remove</button></td></tr>'; } }
  var docs='<div class="card"><header style="display:flex;justify-content:space-between"><h3 class="section-title">Case Documents</h3><div><button class="btn light" data-act="addFolderPrompt" data-arg="'+id+'">Add folder</button> <button class="btn light" data-act="selectFiles" data-arg="'+id+'::General">Select files</button></div></header><input type="file" id="file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';

  var co = findCompany(cs.companyId), candidates=(co?DATA.contacts.filter(function(ct){return ct.companyId===co.id;}):DATA.contacts);
  var linkedIds=(cs.people||[]).map(function(p){return p.contactId;});
  var peopleRows=(cs.people||[]).map(function(p){ var ct=findContact(p.contactId)||{name:'?'}; return '<tr><td>'+ct.name+'</td><td>'+ct.email+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+ct.id+'">Open contact</button> <button class="btn light" data-act="unlinkContact" data-arg="'+id+'::'+ct.id+'">Unlink</button></td></tr>'; }).join('') || '<tr><td colspan="3" class="muted">No related contacts yet.</td></tr>';
  var candidateOpts = candidates.map(function(c){return '<option value="'+c.id+'" '+(linkedIds.indexOf(c.id)>-1?'disabled':'')+'>'+c.name+' — '+(c.email||'')+'</option>';}).join('');
  var people='<div class="card"><header style="display:flex;justify-content:space-between"><h3 class="section-title">People</h3><div><select class="input" id="link-contact">'+candidateOpts+'</select> <button class="btn light" data-act="linkToCase" data-arg="'+id+'">Link to case</button></div></header><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>'+peopleRows+'</tbody></table></div>';

  var evRows=(DATA.calendar||[]).filter(function(e){return e.caseId===id;}).map(function(e){ return '<tr><td>'+e.date+'</td><td>'+e.start+'–'+e.end+'</td><td>'+e.title+'</td><td>'+e.type+'</td><td class="right"><button class="btn light" data-act="openEvent" data-arg="'+e.id+'">Open</button></td></tr>'; }).join('') || '<tr><td colspan="5" class="muted">No events yet.</td></tr>';
  var calTab='<div class="card"><header style="display:flex;justify-content:space-between"><h3 class="section-title">Calendar</h3></header><table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Type</th><th></th></tr></thead><tbody>'+evRows+'</tbody></table><div style="margin-top:8px"><div class="grid cols-4"><input class="input" id="ce-title" placeholder="Event title"><input class="input" id="ce-date" type="date"><input class="input" id="ce-start" type="time" value="09:00"><input class="input" id="ce-end" type="time" value="10:00"><select class="input" id="ce-type"><option>Appointment</option><option>Note</option></select><input class="input" id="ce-location" placeholder="Location"><select class="input" id="ce-owner">'+DATA.users.map(function(u){return '<option value="'+u.email+'">'+u.name+' ('+u.role+')</option>';}).join('')+'</select></div><div class="right" style="margin-top:8px"><button class="btn" data-act="addCaseEvent" data-arg="'+id+'">Add case event</button></div></div></div>';

  var body = (App.state.caseTab==='details'?details:
              App.state.caseTab==='notes'?notes:
              App.state.caseTab==='tasks'?tasks:
              App.state.caseTab==='documents'?docs:
              App.state.caseTab==='people'?people:
              calTab);

  return Shell(header + caseTabs(id) + body, 'cases');
}

function Companies(){
  function countContacts(cid){ var n=0; for(var i=0;i<DATA.contacts.length;i++) if(DATA.contacts[i].companyId===cid) n++; return n; }
  function countCases(cid){ var n=0; for(var i=0;i<DATA.cases.length;i++) if(DATA.cases[i].companyId===cid) n++; return n; }
  var rows=DATA.companies.map(function(co){ return '<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>'; }).join('');
  return Shell('<div class="section"><header><h3 class="section-title">Companies</h3></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');
}
function CompanyPage(id){
  var co=findCompany(id); if(!co) return Shell('<div class="card">Company not found.</div>','companies');
  var recent=DATA.cases.filter(function(c){return c.companyId===id;}).map(function(c){return '<tr><td>'+c.fileNumber+'</td><td>'+c.title+'</td><td>'+statusChip(c.status)+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open</button></td></tr>';}).join('') || '<tr><td colspan="4" class="muted">No cases.</td></tr>';
  var contacts=DATA.contacts.filter(function(p){return p.companyId===id;}).map(function(p){return '<tr><td>'+p.name+'</td><td>'+p.email+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+p.id+'">Open</button> <button class="btn light" data-act="viewPortalAs" data-arg="'+p.id+'">View Portal</button></td></tr>';}).join('') || '<tr><td colspan="3" class="muted">No contacts.</td></tr>';
  var folders=co.folders||{General:[]}; var docRows='';
  for(var fn in folders){ if(!folders.hasOwnProperty(fn)) continue; var files=folders[fn]; docRows+='<tr><th colspan="3">'+fn+'</th></tr>'; docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectCompanyFiles" data-arg="'+id+'::'+fn+'">Upload to '+fn+'</button></td></tr>'; if(!files.length) docRows+='<tr><td colspan="3" class="muted">No files</td></tr>'; for(var k=0;k<files.length;k++){ var f=files[k]; var arg=id+'::'+fn+'::'+f.name; docRows+='<tr><td>'+f.name+'</td><td>'+f.size+'</td><td class="right"><button class="btn light" data-act="viewCompanyDoc" data-arg="'+arg+'">Preview</button> <button class="btn light" data-act="removeCompanyDoc" data-arg="'+arg+'">Remove</button></td></tr>'; } }
  var html='<div class="card"><div style="display:flex;gap:8px;align-items:center"><div class="chip">'+(co.name?co.name[0]:'')+'</div><h2 style="margin:0">'+co.name+'</h2><div class="sp"></div><button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>'
    + '<div class="card"><h3 class="section-title">Summary</h3><table><thead><tr><th>Case ID</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>'+recent+'</tbody></table></div>'
    + '<div class="card"><h3 class="section-title">Company Contacts</h3><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>'+contacts+'</tbody></table></div>'
    + '<div class="card"><h3 class="section-title">Company Documents</h3><input type="file" id="co-file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';
  return Shell(html,'companies');
}

function Contacts(){
  function coName(id){ var c=findCompany(id); return c?c.name:''; }
  var rows=DATA.contacts.map(function(c){ return '<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button> <button class="btn light" data-act="viewPortalAs" data-arg="'+c.id+'">View Portal</button></td></tr>'; }).join('');
  return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');
}
function ContactPage(id){
  var c=findContact(id); if(!c) return Shell('<div class="card">Contact not found.</div>','contacts');
  var coOpts=['<option value="">(No linked company)</option>'].concat(DATA.companies.map(function(co){return '<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>';})).join('');
  var html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save Contact</button><button class="btn light" data-act="route" data-arg="contacts">Back</button></div><div class="grid cols-4" style="margin-top:12px"><div><label>Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Role</label><input class="input" id="ct-role" value="'+(c.role||'')+'"></div><div><label>Company</label><select class="input" id="ct-company">'+coOpts+'</select></div><div style="grid-column:1/-1"><label>Notes</label><textarea id="ct-notes" class="input">'+(c.notes||'')+'</textarea></div></div></div>';
  return Shell(html,'contacts');
}

function Documents(){
  var rows=DATA.cases.map(function(c){ var count=0; for(var k in c.folders) if(c.folders.hasOwnProperty(k)) count+=c.folders[k].length; return '<tr><td>'+c.fileNumber+'</td><td>'+count+'</td><td class="right"><button class="btn light" data-act="openCase" data-arg="'+c.id+'">Open Case</button></td></tr>'; }).join('');
  return Shell('<div class="section"><header><h3 class="section-title">Documents</h3></header><table><thead><tr><th>Case ID</th><th>Files</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','documents');
}

function Resources(){
  var html='<div class="section"><header><h3 class="section-title">Resources</h3></header><div class="mono">Static Links / FAQs / Guides area placeholder</div></div>';
  return Shell(html,'resources');
}

function Admin(){
  var rows=DATA.users.map(function(u){ return '<tr><td>'+u.name+'</td><td>'+u.email+'</td><td>'+u.role+'</td><td class="right">'+(u.email!==(DATA.me.email||'')?'<button class="btn light" data-act="impersonate" data-arg="'+u.email+'">Impersonate</button>':'')+'</td></tr>'; }).join('');
  var html='<div class="section"><header><h3 class="section-title">Users</h3></header><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="section"><header><h3 class="section-title">Settings</h3></header><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="set-email" '+(DATA.settings.emailAlerts?'checked':'')+'> Email alerts</label><div class="mono" style="margin-top:8px">Version: '+BUILD+'</div></div><div class="section"><header><h3 class="section-title">Audit</h3></header><div class="mono muted">No events yet.</div></div>';
  return Shell(html,'admin');
}

function render(){
  var r=App.state.route, el=document.getElementById('app');
  if(!el) return;
  if(r==='dashboard') el.innerHTML=Dashboard();
  else if(r==='calendar') el.innerHTML=Calendar();
  else if(r==='cases') el.innerHTML=Cases();
  else if(r==='case') el.innerHTML=CasePage(App.state.currentCaseId);
  else if(r==='companies') el.innerHTML=Companies();
  else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId);
  else if(r==='contacts') el.innerHTML=Contacts();
  else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId);
  else if(r==='documents') el.innerHTML=Documents();
  else if(r==='resources') el.innerHTML=Resources();
  else if(r==='admin') el.innerHTML=Admin();
  else el.innerHTML=Dashboard();
}

document.addEventListener('click', function(e){
  var t=e.target; while(t && t!==document && !t.getAttribute) t=t.parentNode;
  while(t && t!==document && !t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  var act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg');
  if(act==='route'){ App.set({route:arg}); return; }
  if(act==='openCase'){ App.set({currentCaseId:arg,route:'case',caseTab:'details'}); return; }
  if(act==='openCompany'){ App.set({currentCompanyId:arg,route:'company'}); return; }
  if(act==='openContact'){ App.set({currentContactId:arg,route:'contact'}); return; }
  if(act==='calPrev'){ var dt=new Date(App.state.calCursor+'-01'); dt.setMonth(dt.getMonth()-1); var y=dt.getFullYear(), m=('0'+(dt.getMonth()+1)).slice(-2); App.set({calCursor:y+'-'+m}); return; }
  if(act==='calToday'){ var td=new Date(); App.set({calCursor: td.getFullYear()+'-'+('0'+(td.getMonth()+1)).slice(-2)}); return; }
  if(act==='addEvent'){ 
    var ev={id:uid(),title:val('ev-title'),date:val('ev-date'),start:val('ev-start'),end:val('ev-end'),type:val('ev-type'),location:val('ev-location'),caseId:val('ev-case'),owner:val('ev-owner')};
    if(!ev.title||!ev.date){ alert('Title and Date required'); return; }
    DATA.calendar.unshift(ev); pushNotif('created',ev); save(); App.set({}); return; 
  }
  if(act==='openEvent'){ var ev=findEvent(arg); if(!ev) return; openEventModal(ev); return; }
  if(act==='openEventFromNotif'){ var ev=findEvent(arg); if(!ev) return; markNotifByEvent(arg,true); openEventModal(ev); return; }
  if(act==='dismissNotif'){ markNotif(arg,true); save(); App.set({}); return; }
  if(act==='toggleUnread'){ App.set({showUnread:!App.state.showUnread}); return; }
  if(act==='markAllRead'){ markAllRead(); save(); App.set({}); return; }
  if(act==='newCase'){ var seq=('00'+(DATA.cases.length+1)).slice(-3); var inv=DATA.users[1]; var cs={id:uid(),fileNumber:'INV-'+YEAR+'-'+seq,title:'',organisation:'',companyId:'C-001',investigatorEmail:inv.email,investigatorName:inv.name,status:'Planning',priority:'Medium',created:nowISO().slice(0,7),notes:[],tasks:[],people:[],folders:{General:[]}}; DATA.cases.unshift(cs); save(); App.set({currentCaseId:cs.id,route:'case'}); return; }
  if(act==='saveCase'){ var cs=findCase(arg); if(!cs) return; cs.title=val('c-title'); cs.organisation=val('c-org'); cs.companyId=val('c-company'); var invEmail=val('c-inv'); cs.investigatorEmail=invEmail; var u=userFor(invEmail); cs.investigatorName=u?u.name:''; cs.status=val('c-status'); cs.priority=val('c-priority'); var idEl=document.getElementById('c-id'); if(idEl && idEl.value) cs.fileNumber=idEl.value.trim(); save(); alert('Case saved'); return; }
  if(act==='deleteCase'){ var cs=findCase(arg); if(!cs) return; if(confirm('Delete '+(cs.fileNumber||cs.title)+'?')){ DATA.cases = DATA.cases.filter(function(x){return x.id!==cs.id;}); save(); App.set({route:'cases',currentCaseId:null}); } return; }
  if(act==='addNote'){ var cs=findCase(arg); if(!cs) return; var text=val('note-text'); if(!text){ alert('Enter a note'); return; } cs.notes.unshift({time:nowISO().replace('T',' ').slice(0,16),by: (DATA.me.email||'admin@synergy.com'), text:text}); save(); App.set({}); return; }
  if(act==='addStdTasks'){ var cs=findCase(arg); if(!cs) return; var base=cs.tasks; ['Gather documents','Interview complainant','Interview respondent','Write report'].forEach(function(a){ base.push({id:'T-'+(base.length+1),title:a,assignee:cs.investigatorName||'',due:'',status:'Open'}); }); save(); App.set({}); return; }
  if(act==='addTask'){ var cs=findCase(arg); if(!cs) return; cs.tasks.push({id:'T-'+(cs.tasks.length+1),title:val('task-title'),assignee:(function(){var sel=document.getElementById('task-assignee');return sel?sel.options[sel.selectedIndex].text:'';})(),due:val('task-due'),status:'Open'}); save(); App.set({}); return; }
  if(act==='addFolderPrompt'){ var cs=findCase(arg); if(!cs) return; var name=prompt('New folder name'); if(!name) return; cs.folders[name]=cs.folders[name]||[]; save(); App.set({}); return; }
  if(act==='selectFiles'){ App.state.currentUploadTarget=arg||((App.state.currentCaseId||'')+'::General'); var fi=document.getElementById('file-input'); if(fi) fi.click(); return; }
  if(act==='viewDoc'){ var p=arg.split('::'); var cs=findCase(p[0]); if(!cs) return; var list=cs.folders[p[1]]||[]; var f=list.find(function(x){return x.name===p[2] && x.dataUrl;}); if(f) window.open(f.dataUrl,'_blank'); return; }
  if(act==='removeDoc'){ var pp=arg.split('::'); var c2=findCase(pp[0]); if(!c2) return; c2.folders[pp[1]]= (c2.folders[pp[1]]||[]).filter(function(x){return x.name!==pp[2];}); save(); App.set({}); return; }
  if(act==='deleteFolder'){ var p2=arg.split('::'); var c3=findCase(p2[0]); if(!c3) return; var folder=p2[1]; if(folder==='General'){ alert('Cannot delete General'); return; } if(confirm('Delete folder '+folder+'?')){ delete c3.folders[folder]; save(); App.set({}); } return; }
  if(act==='linkToCase'){ var cid=val('link-contact'); if(!cid) return; var cs=findCase(arg); if(!cs) return; if(!cs.people) cs.people=[]; if(cs.people.some(function(p){return p.contactId===cid;})) return; cs.people.push({contactId:cid}); save(); App.set({}); return; }
  if(act==='unlinkContact'){ var parts=arg.split('::'); var cs=findCase(parts[0]); if(!cs) return; cs.people=cs.people.filter(function(p){return p.contactId!==parts[1];}); save(); App.set({}); return; }
  if(act==='addCaseEvent'){ var cs=findCase(arg); if(!cs) return; var ev={id:uid(),title:val('ce-title'),date:val('ce-date'),start:val('ce-start'),end:val('ce-end'),type:val('ce-type'),location:val('ce-location'),caseId:cs.id,owner:val('ce-owner')}; if(!ev.title||!ev.date){ alert('Title and Date required'); return; } DATA.calendar.unshift(ev); pushNotif('created',ev); save(); App.set({}); return; }
  if(act==='impersonate'){ var u=userFor(arg); if(!u) return; App.set({asUser: u, route:'dashboard'}); return; }
  if(act==='exitImpersonate'){ App.set({asUser:null}); return; }
});

document.addEventListener('change', function(e){
  if(e.target && e.target.id==='flt-q'){ App.state.casesFilter={q:e.target.value}; save(); App.set({});}
});

document.addEventListener('change', function(e){
  var t=e.target;
  function filesToList(files){ var out=[]; for(var i=0;i<files.length;i++) out.push(files[i]); return out; }
  if(t && t.id==='file-input' && t.files && t.files.length){ 
    var p=(App.state.currentUploadTarget||'').split('::'); var cs=findCase(p[0]); if(!cs) return;
    var folder=p[1]||'General'; cs.folders[folder]=cs.folders[folder]||[];
    var list=filesToList(t.files);
    var pending=list.length, done=0;
    list.forEach(function(f){ var r=new FileReader(); r.onload=function(){ cs.folders[folder].push({name:f.name,size:f.size+' B',dataUrl:r.result}); done++; if(done===pending){ save(); App.set({}); } }; try{ r.readAsDataURL(f); }catch(_ ){ cs.folders[folder].push({name:f.name,size:f.size+' B'}); done++; if(done===pending){ save(); App.set({}); } } });
  }
  if(t && t.id==='co-file-input' && t.files && t.files.length){ 
    var p=(App.state.currentCompanyUploadTarget||'').split('::'); var co=findCompany(p[0]); if(!co) return; var folder=p[1]||'General'; co.folders=co.folders||{General:[]}; co.folders[folder]=co.folders[folder]||[];
    var list=filesToList(t.files);
    var pending=list.length, done=0;
    list.forEach(function(f){ var r=new FileReader(); r.onload=function(){ co.folders[folder].push({name:f.name,size:f.size+' B',dataUrl:r.result}); done++; if(done===pending){ save(); App.set({}); } }; try{ r.readAsDataURL(f); }catch(_ ){ co.folders[folder].push({name:f.name,size:f.size+' B'}); done++; if(done===pending){ save(); App.set({}); } } });
  }
});

document.addEventListener('click', function(e){
  if(e.target && e.target.id==='em-cancel'){ closeEventModal(); }
  if(e.target && e.target.id==='em-save'){ 
    var m=document.getElementById('ev-modal'); if(!m) return; var id=m.getAttribute('data-id'); var ev=findEvent(id); if(!ev) return;
    ev.title=val('em-title'); ev.date=val('em-date'); ev.start=val('em-start'); ev.end=val('em-end'); ev.type=val('em-type'); ev.location=val('em-location'); ev.caseId=val('em-case');
    pushNotif('updated',ev); save(); closeEventModal(); App.set({});
  }
  if(e.target && e.target.id==='em-delete'){ 
    var m=document.getElementById('ev-modal'); if(!m) return; var id=m.getAttribute('data-id'); var ev=findEvent(id); if(!ev) return;
    if(confirm('Delete event "'+(ev.title||'')+'"?')){ DATA.calendar=DATA.calendar.filter(function(x){return x.id!==id;}); pushNotif('deleted',ev); save(); closeEventModal(); App.set({}); }
  }
});

function pushNotif(action, ev){ if((DATA.me.role||'')!=='Admin') return; var n={id:uid(),time:nowISO(),action:action,title:ev.title,eventId:ev.id,read:false}; DATA.notifications=DATA.notifications||[]; DATA.notifications.unshift(n); }
function markNotif(id, read){ var list=DATA.notifications||[]; for(var i=0;i<list.length;i++) if(list[i].id===id) list[i].read=!!read; }
function markNotifByEvent(eid, read){ var list=DATA.notifications||[]; for(var i=0;i<list.length;i++) if(list[i].eventId===eid) list[i].read=!!read; }
function markAllRead(){ var list=DATA.notifications||[]; for(var i=0;i<list.length;i++) list[i].read=true; }

document.addEventListener('DOMContentLoaded', function(){ App.set({route:'dashboard'}); });
})();
