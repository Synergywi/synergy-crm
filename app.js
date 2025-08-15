(function(){ "use strict";
const BUILD="v2.11.1"; const STAMP=(new Date()).toISOString();
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
    {id:"C-001",name:"Sunrise Mining Pty Ltd",industry:"Mining",type:"Client",abn:"12 345 678 901",acn:"345 678 901",phone:"07 345 5678",email:"admin@sunrisemining.com",website:"www.sunrisemining.com",street:{line1:"",line2:"",city:"Brisbane",state:"Queensland",postcode:"4000"},postal:{same:true,line1:"",line2:"",city:"",state:"",postcode:""},folders:{General:[]}},
    {id:"C-002",name:"City of Melbourne",industry:"Government",type:"Client",folders:{General:[]}},
    {id:"C-003",name:"Queensland Health (Metro North)",industry:"Health",type:"Client",folders:{General:[]}},
  ],
  contacts:[
    {id:uid(),name:"Alex Ng",email:"alex@synergy.com",phone:"",companyId:"C-001",org:"Investigator",notes:""},
    {id:uid(),name:"Priya Menon",email:"priya@synergy.com",phone:"",companyId:"C-003",org:"Investigator",notes:""},
    {id:uid(),name:"Chris Rice",email:"chris@synergy.com",phone:"",companyId:"C-002",org:"Reviewer",notes:""}
  ],
  cases:[
    mkCase(LAST,101,{title:"Safety complaint – workshop",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Closed",priority:"Medium",created:LAST+"-01"}),
    mkCase(LAST,102,{title:"Bullying allegation – IT",organisation:"City of Melbourne",companyId:"C-002",investigatorEmail:"priya@synergy.com",investigatorName:"Priya Menon",status:"Closed",priority:"High",created:LAST+"-07"}),
    mkCase(YEAR,1,{title:"Bullying complaint in Finance",organisation:"Sunrise Mining Pty Ltd",companyId:"C-001",investigatorEmail:"alex@synergy.com",investigatorName:"Alex Ng",status:"Investigation",priority:"High",created:YEAR+"-01"}),
  ],
  resources:{templates:[],procedures:[]},
  me:{name:"Admin",email:"admin@synergy.com",role:"Admin"}
};

const findCase=id=>DATA.cases.find(c=>c.id===id)||null;
const findCompany=id=>DATA.companies.find(c=>c.id===id)||null;
const findContact=id=>DATA.contacts.find(c=>c.id===id)||null;

const App={state:{route:"companies",currentCaseId:null,currentContactId:null,currentCompanyId:"C-001",currentUploadTarget:null,currentCompanyUploadTarget:null,asUser:null,casesFilter:{q:""},companyViewMode:"view"}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

// UI shell
function Topbar(){let s='<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><span class="badge">Soft Stable '+BUILD+'</span></div>'; return s;}
function Sidebar(active){const base=[["dashboard","Dashboard"],["cases","Cases"],["contacts","Contacts"],["companies","Companies"],["documents","Documents"],["resources","Resources"],["admin","Admin"]]; let out=['<aside class="sidebar"><h3>Investigations</h3><ul class="nav">']; for(const it of base){out.push('<li '+(active===it[0]?'class="active"':'')+' data-act="route" data-arg="'+it[0]+'">'+it[1]+'</li>');} out.push('</ul></aside>'); return out.join('');}
function Shell(content,active){return Topbar()+'<div class="shell">'+Sidebar(active)+'<main class="main">'+content+'</main></div><div id="boot">Ready ('+BUILD+')</div>'; }

// Companies list
function Companies(){const d=App.get(); const countContacts=cid=>d.contacts.filter(c=>c.companyId===cid).length; const countCases=cid=>d.cases.filter(c=>c.companyId===cid).length; let rows=''; for(const co of d.companies){rows+='<tr><td>'+co.id+'</td><td>'+co.name+'</td><td>'+countContacts(co.id)+'</td><td>'+countCases(co.id)+'</td><td class="right"><button class="btn light" data-act="openCompany" data-arg="'+co.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Companies</h3><button class="btn" data-act="newCompany">New Company</button></header><table><thead><tr><th>ID</th><th>Name</th><th>Contacts</th><th>Cases</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','companies');}

// Company Profile + Edit
function CompanyAboutCard(co){
  const s=co.street||{}, p=co.postal||{};
  function line(title,val){return '<div><div style="font-size:12px;color:#475569">'+title+'</div><div style="font-weight:600">'+(val||'—')+'</div></div>';}
  return '<div class="card">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
    +   '<div style="width:40px;height:40px;display:grid;place-items:center;border-radius:999px;background:#e8eef6;font-weight:700">'+(co.name||'?').slice(0,1).toUpperCase()+'</div>'
    +   '<div style="font-size:18px;font-weight:700">'+(co.name||'Company')+'</div>'
    +   '<div class="sp"></div>'
    +   '<div style="color:#475569">'+(co.phone||'')+' &nbsp;·&nbsp; '+(co.email||'')+'</div>'
    + '</div>'
    + '<div class="section"><header><h3 class="section-title">About this company</h3></header>'
    + '<div class="grid cols-2">'
    +   line('Industry', co.industry)
    +   + line('Type', co.type)
    +   + line('Domain', co.website)
    +   + line('City', s.city)
    +   + line('State', s.state)
    +   + line('Postcode', s.postcode)
    +   + line('ABN', co.abn)
    +   + line('ACN', co.acn)
    + '</div></div>'
    + '</div>';
}

function CompanyContactsPanel(co){
  const list=DATA.contacts.filter(c=>c.companyId===co.id);
  let rows=list.map(c=>'<tr><td>'+c.name+'</td><td>'+ (c.email||'') +'</td><td>'+ (c.phone||'') +'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>').join('');
  if(!rows) rows='<tr><td colspan="4" class="muted">No contacts</td></tr>';
  return '<div class="section"><header><h3 class="section-title">Company Contacts</h3><button class="btn light" data-act="newContactForCompany" data-arg="'+co.id+'">Add contact</button></header>'
    + '<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function CompanyDocsPanel(co){
  co.folders = co.folders || {General:[]};
  let docRows='';
  for(const folder in co.folders){
    const files=co.folders[folder];
    docRows+='<tr><th colspan="3">'+folder+'</th></tr>';
    docRows+='<tr><td colspan="3" class="right"><button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::'+folder+'">Upload to '+folder+'</button> '+(folder==='General'?'':'<button class="btn light" data-act="deleteCompanyFolder" data-arg="'+co.id+'::'+folder+'">Delete folder</button>')+'</td></tr>';
    if(!files.length){docRows+='<tr><td colspan="3" class="muted">No files</td></tr>';}
    for(const f of files){
      const a=co.id+'::'+folder+'::'+f.name;
      docRows+='<tr><td>'+f.name+'</td><td>'+f.size+'</td><td class="right">'+(f.dataUrl?('<button class="btn light" data-act="viewCompanyDoc" data-arg="'+a+'">View</button> '):'')+'<button class="btn light" data-act="removeCompanyDoc" data-arg="'+a+'">Remove</button></td></tr>';
    }
  }
  return '<div class="section"><header><h3 class="section-title">Company Documents</h3><div><button class="btn light" data-act="addCompanyFolderPrompt" data-arg="'+co.id+'">Add folder</button> <button class="btn light" data-act="selectCompanyFiles" data-arg="'+co.id+'::General">Select files</button></div></header><input type="file" id="co-file-input" multiple style="display:none"><table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+docRows+'</tbody></table></div>';
}

function CompanyEditForm(co){
  const s=co.street||{}, p=co.postal||{};
  function inp(id,label,val){return '<div><label>'+label+'</label><input class="input" id="'+id+'" value="'+(val||'')+'"></div>';}
  function ta(id,label,val){return '<div style="grid-column:span 2"><label>'+label+'</label><textarea class="input" id="'+id+'">'+(val||'')+'</textarea></div>';}
  return '<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Edit Company</h2><div class="sp"></div><button class="btn success" data-act="saveCompany" data-arg="'+co.id+'">Save</button><button class="btn light" data-act="viewCompany" data-arg="'+co.id+'">Cancel</button></div>'
    + '<div class="grid cols-2" style="margin-top:8px">'
    +   inp('co-name','Legal Name',co.name)
    +   inp('co-trade','Trading Name',co.tradingName)
    +   inp('co-industry','Industry',co.industry)
    +   inp('co-type','Type',co.type)
    +   inp('co-abn','ABN',co.abn)
    +   inp('co-acn','ACN',co.acn)
    +   inp('co-phone','Phone',co.phone)
    +   inp('co-email','Email',co.email)
    +   inp('co-web','Website',co.website)
    + ta('co-notes','Notes',co.notes||'')
    + '</div>'
    + '<div class="section"><header><h3 class="section-title">Addresses</h3></header>'
    + '<div class="grid cols-2">'
    +   '<div class="card"><h4>Street</h4><div class="grid cols-2">'
    +     inp('st-line1','Line 1',s.line1)+inp('st-line2','Line 2',s.line2)+inp('st-city','City',s.city)+inp('st-state','State',s.state)+inp('st-post','Postcode',s.postcode)
    +   '</div></div>'
    +   '<div class="card"><h4>Postal</h4><div class="grid cols-2">'
    +     inp('po-line1','Line 1',p.line1)+inp('po-line2','Line 2',p.line2)+inp('po-city','City',p.city)+inp('po-state','State',p.state)+inp('po-post','Postcode',p.postcode)
    +   '</div></div>'
    + '</div>'
    + '</div>';
}

function CompanyPage(id){
  const d=App.get(), co=findCompany(id);
  if(!co){ alert('Company not found'); App.set({route:'companies'}); return; }
  const header = '<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Company</h2><div class="sp"></div>'
    + '<button class="btn" data-act="editCompany" data-arg="'+co.id+'">Edit</button> '
    + '<button class="btn danger" data-act="deleteCompany" data-arg="'+co.id+'">Delete</button> '
    + '<button class="btn light" data-act="route" data-arg="companies">Back</button></div></div>';
  if(App.state.companyViewMode==='edit'){
    return Shell(header + CompanyEditForm(co), 'companies');
  }
  const layout = '<div class="grid cols-2">'+
    '<div>'+CompanyAboutCard(co)+CompanyDocsPanel(co)+'</div>'+
    '<div>'+CompanyContactsPanel(co)+'</div>'+
    '</div>';
  return Shell(header + layout, 'companies');
}

// Contacts list + page (kept minimal)
function Contacts(){const d=App.get(); const coName=id=>{const co=findCompany(id); return co?co.name:"";}; let rows=''; for(const c of d.contacts){rows+='<tr><td>'+c.name+'</td><td>'+c.email+'</td><td>'+coName(c.companyId)+'</td><td class="right"><button class="btn light" data-act="openContact" data-arg="'+c.id+'">Open</button></td></tr>';} return Shell('<div class="section"><header><h3 class="section-title">Contacts</h3><button class="btn" data-act="newContact">New Contact</button></header><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>','contacts');}
function ContactPage(id){const d=App.get(), c=findContact(id); if(!c) return Shell('<div class="card">Contact not found.</div>','contacts'); const coOpts=()=>['<option value="">(No linked company)</option>'].concat(d.companies.map(co=>'<option '+(co.id===c.companyId?'selected':'')+' value="'+co.id+'">'+co.name+' ('+co.id+')</option>')).join(''); let html='<div class="card"><div style="display:flex;align-items:center;gap:8px"><h2>Contact</h2><div class="sp"></div><button class="btn" data-act="saveContact" data-arg="'+id+'">Save</button><button class="btn light" data-act="route" data-arg="contacts">Back</button></div><div class="grid cols-4" style="margin-top:12px"><div><label>Contact Name</label><input class="input" id="ct-name" value="'+(c.name||'')+'"></div><div><label>Email</label><input class="input" id="ct-email" value="'+(c.email||'')+'"></div><div><label>Phone</label><input class="input" id="ct-phone" value="'+(c.phone||'')+'"></div><div><label>Position/Org</label><input class="input" id="ct-org" value="'+(c.org||'')+'"></div><div style="grid-column:span 2"><label>Link to Company</label><select class="input" id="ct-company">'+coOpts()+'</select></div><div style="grid-column:span 4"><label>Notes</label><textarea class="input" id="ct-notes">'+(c.notes||'')+'</textarea></div></div></div>'; return Shell(html,'contacts');}

// Documents, Cases, Dashboard placeholders (unchanged minimal)
function Dashboard(){return Shell('<div class="card">Welcome</div>','dashboard');}
function Cases(){return Shell('<div class="card">Cases not changed in this patch.</div>','cases');}
function Documents(){return Shell('<div class="card">Global Docs view</div>','documents');}
function Resources(){return Shell('<div class="card">Resources</div>','resources');}

// Render
function render(){const r=App.state.route, el=document.getElementById('app'); document.getElementById('boot').textContent='Rendering '+r+'…'; if(r==='dashboard') el.innerHTML=Dashboard(); else if(r==='cases') el.innerHTML=Cases(); else if(r==='contacts') el.innerHTML=Contacts(); else if(r==='contact') el.innerHTML=ContactPage(App.state.currentContactId); else if(r==='companies') el.innerHTML=Companies(); else if(r==='company') el.innerHTML=CompanyPage(App.state.currentCompanyId); else if(r==='documents') el.innerHTML=Documents(); else if(r==='resources') el.innerHTML=Resources(); else el.innerHTML=Dashboard(); document.getElementById('boot').textContent='Ready ('+BUILD+')';}
document.addEventListener('DOMContentLoaded',()=>{App.set({});});

// Actions
document.addEventListener('click',e=>{
  let t=e.target; while(t&&t!==document&&!t.getAttribute('data-act')) t=t.parentNode; if(!t||t===document) return;
  const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg'), d=App.get();
  // nav
  if(act==='route'){App.set({route:arg});return;}
  if(act==='openContact'){App.set({currentContactId:arg,route:'contact'});return;}
  if(act==='newContact'){const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId:'',notes:''}; d.contacts.unshift(c); App.set({currentContactId:c.id,route:'contact'}); return;}
  if(act==='saveContact'){const c=findContact(arg); if(!c) return; c.name=value('ct-name'); c.email=value('ct-email'); c.phone=value('ct-phone'); c.org=value('ct-org'); c.companyId=value('ct-company'); c.notes=value('ct-notes'); alert('Contact saved'); return;}

  // Companies
  if(act==='openCompany'){App.set({currentCompanyId:arg,companyViewMode:'view',route:'company'});return;}
  if(act==='newCompany'){const id = 'C-'+('00'+(d.companies.length+1)).slice(-3); const co={id,name:'New Company',industry:'',type:'',folders:{General:[]}}; d.companies.unshift(co); App.set({currentCompanyId:co.id,companyViewMode:'edit',route:'company'}); return;}
  if(act==='editCompany'){App.set({companyViewMode:'edit'}); return;}
  if(act==='viewCompany'){App.set({companyViewMode:'view'}); return;}
  if(act==='deleteCompany'){const co=findCompany(arg); if(!co) return; if(confirm('Delete company '+(co.name||co.id)+'?')){ DATA.companies = DATA.companies.filter(c=>c.id!==co.id); App.set({route:'companies', currentCompanyId:null}); } return;}
  if(act==='saveCompany'){
    const co=findCompany(arg); if(!co) return;
    assign(co, {
      name:value('co-name'),
      tradingName:value('co-trade'),
      industry:value('co-industry'),
      type:value('co-type'),
      abn:value('co-abn'),
      acn:value('co-acn'),
      phone:value('co-phone'),
      email:value('co-email'),
      website:value('co-web'),
      notes:value('co-notes'),
      street:{ line1:value('st-line1'), line2:value('st-line2'), city:value('st-city'), state:value('st-state'), postcode:value('st-post') },
      postal:{ line1:value('po-line1'), line2:value('po-line2'), city:value('po-city'), state:value('po-state'), postcode:value('po-post') }
    });
    alert('Company saved');
    App.set({companyViewMode:'view'});
    return;
  }

  if(act==='newContactForCompany'){
    const companyId = arg;
    const c={id:uid(),name:'New Contact',email:'',phone:'',org:'',companyId,notes:''};
    d.contacts.unshift(c);
    App.set({currentContactId:c.id,route:'contact'});
    return;
  }

  // company docs
  if(act==='addCompanyFolderPrompt'){const co=findCompany(arg); if(!co) return; const name=prompt('New folder name'); if(!name) return; co.folders=co.folders||{}; co.folders[name]=co.folders[name]||[]; App.set({}); return;}
  if(act==='selectCompanyFiles'){App.state.currentCompanyUploadTarget=arg||((App.state.currentCompanyId||'')+'::General'); const fi=document.getElementById('co-file-input'); if(fi) fi.click(); return;}
  if(act==='viewCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const list=(co.folders||{})[p[1]]||[]; const f=list.find(x=>x.name===p[2]&&x.dataUrl); if(f) window.open(f.dataUrl,'_blank'); return;}
  if(act==='removeCompanyDoc'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; co.folders[p[1]]=(co.folders[p[1]]||[]).filter(x=>x.name!==p[2]); App.set({}); return;}
  if(act==='deleteCompanyFolder'){const p=arg.split('::'); const co=findCompany(p[0]); if(!co) return; const folder=p[1]; if(folder==='General'){alert('Cannot delete General');return;} if(confirm('Delete folder '+folder+' and its files?')){delete co.folders[folder]; App.set({});} return;}
});

document.addEventListener('change',e=>{
  // company file uploads
  if(e.target && e.target.id==='co-file-input'){
    const target = App.state.currentCompanyUploadTarget || ((App.state.currentCompanyId||'')+'::General');
    const p = (target||'').split('::');
    const co=findCompany(p[0]); if(!co) return;
    const folder = p[1]||'General';
    co.folders = co.folders || {};
    co.folders[folder] = co.folders[folder] || [];
    const list = co.folders[folder];
    for(const f of e.target.files){
      const reader = new FileReader();
      reader.onload = (ev)=>{
        list.push({name:f.name,size:f.size+'B',dataUrl:ev.target.result});
        App.set({}); // re-render
      };
      reader.readAsDataURL(f);
    }
    e.target.value = '';
  }
});

// helpers
function value(id){const el=document.getElementById(id); return el ? el.value : '';}
function assign(o,src){for(const k in src){ if(Object.prototype.hasOwnProperty.call(src,k)){ o[k]=src[k]; } }}

})();