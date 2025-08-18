(function(){ "use strict";
const BUILD="baseline-1.0.0"; const STAMP=(new Date()).toISOString();
console.log("Synergy CRM PRO "+BUILD+" • "+STAMP);

/* utils */
function notifyCalendar(action, ev){
  try{
    DATA.notifications = DATA.notifications||[];
    DATA.notifications.unshift({id:uid(), action, evId:ev.id, title:ev.title, when:(new Date()).toISOString(), read:false});
    if(typeof persistAll==='function') persistAll();
  }catch(_){}
}

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
  notifications:[],
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
  const notifState = App.state.notifs||{show:'unread'};
  const list=(DATA.notifications||[]).filter(n=>notifState.show==='all' || !n.read);
  const notifRows=list.map(n=>`<tr><td>${new Date(n.when).toLocaleString()}</td><td>${n.action}</td><td>${esc(n.title)}</td><td class="right"><button class="btn light" data-act="notifOpen" data-arg="${n.id}">Open</button> <button class="btn" data-act="notifDismiss" data-arg="${n.id}">Dismiss</button></td></tr>`).join('') || `<tr><td colspan="4" class="muted">No notifications</td></tr>`;
  const notifs=`<div class="card"><h3 class="section-title">Calendar updates</h3><div class="right" style="margin-bottom:6px"><button class="btn light" data-act="notifToggle">${notifState.show==='all'?'Show unread':'Show all'}</button> <button class="btn" data-act="notifMarkAll">Mark all read</button></div><table><thead><tr><th>When</th><th>Action</th><th>Title</th><th></th></tr></thead><tbody>${notifRows}</tbody></table></div>`;
  const week=`<div class="card"><h3>This Week</h3><div class="muted">New cases: ${DATA.cases.filter(c=>c.created.startsWith(String(YEAR)+"-")).length}</div></div>`;
return Shell(Tabs('dashboard',[['overview','Overview'],['week','This Week']]) + (tab==='overview'?overview:week), 'dashboard');
}
