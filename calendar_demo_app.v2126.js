
(function(){
  "use strict";
  const BUILD="calendar-persist-2126"; const STAMP=(new Date()).toISOString();
  console.log("Synergy CRM PRO "+BUILD+" • "+STAMP);

  /* utils */
  function uid(){ return "id-"+Math.random().toString(36).slice(2,10); }
  function esc(s){ return (s||"").replace(/[&<>\"']/g, m=>({"&":"&amp;","<":"&lt;","—":"—",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]||m)); }
  const YEAR=(new Date()).getFullYear(), LAST=YEAR-1;

  /* data */
  const DATA = { users:[
      {name:"Admin",email:"admin@synergy.com",role:"Admin"},
      {name:"Alex Ng",email:"alex@synergy.com",role:"Investigator"},
      {name:"Priya Menon",email:"priya@synergy.com",role:"Investigator"},
      {name:"Chris Rice",email:"chris@synergy.com",role:"Reviewer"}
    ],
    cases:[],
    contacts:[],
    companies:[],
    resources:{links:[],faqs:[],guides:[]},
    me:{name:"Admin",email:"admin@synergy.com",role:"Admin"},
    calendar:[]
  };

  /* minimal shell (Dashboard + Calendar only for the demo) */
  const App={state:{route:"calendar", tabs:{}, settings:{}, calendar:{ view:"month", ym:(new Date()).toISOString().slice(0,7), selectedDate:(new Date()).toISOString().slice(0,10), filterUsers:"ALL" }}, set(p){Object.assign(App.state,p||{}); render();}, get(){return DATA;}};

  function Topbar(){ const me=(DATA.me||{}); return `<div class="topbar"><div class="brand">Synergy CRM</div><div class="sp"></div><div class="muted" style="margin-right:10px">You: ${me.name||"Unknown"} (${me.role||"User"})</div><span class="badge">Calendar Demo</span></div>`; }
  function Sidebar(active){
    const items=[["calendar","Calendar"]];
    return `<aside class="sidebar"><h3>Investigations</h3><ul class="nav">${items.map(([k,v])=>`<li ${active===k?'class="active"':''} data-act="route" data-arg="${k}">${v}</li>`).join("")}</ul></aside>`;
  }
  function Shell(content,active){ return Topbar()+`<div class="shell">${Sidebar(active)}<main class="main">${content}</main></div><div id="boot">Ready (${BUILD})</div>`; }

  /* ===== Persistence helpers ===== */
  function loadMe(){
    try{ const raw=localStorage.getItem("synergy_me"); if(raw){ const m=JSON.parse(raw); if(m&&m.email) DATA.me=m; } }catch(_){}
  }
  function saveCalendar(){ try{ localStorage.setItem("synergy_calendar_v1", JSON.stringify(DATA.calendar||[])); }catch(_){ } }
  function loadCalendar(){
    try{
      const raw=localStorage.getItem("synergy_calendar_v1");
      if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)) DATA.calendar = arr; }
      else seedCalendar(); // first time only
    }catch(_){ seedCalendar(); }
  }
  function saveCalState(){ try{ localStorage.setItem("synergy_calstate_v1", JSON.stringify(App.state.calendar||{})); }catch(_){ } }
  function loadCalState(){
    try{
      const raw=localStorage.getItem("synergy_calstate_v1");
      if(raw){ const s=JSON.parse(raw); if(s&&s.ym) App.state.calendar = Object.assign({view:"month"}, s); }
    }catch(_){}
  }

  /* seed a few events for the current month */
  function seedCalendar(){
    const u=DATA.users, today=new Date(), y=today.getFullYear(), m=today.getMonth();
    function ev(day,startH,endH,who,title,loc,type){
      const s=new Date(y,m,day,startH,0,0).toISOString();
      const e=new Date(y,m,day,endH,0,0).toISOString();
      return { id:uid(), title, description:"", startISO:s, endISO:e, ownerEmail:who.email, ownerName:who.name, location:loc||"", type:type||"Appointment" };
    }
    DATA.calendar=[
      ev(3,9,10,u[1],"Case intake - Sunrise","Room 3","Appointment"),
      ev(5,14,15,u[2],"Interview planning","Teams","Note"),
      ev(12,11,12,u[3],"Evidence review","Room 2","Appointment"),
    ];
    saveCalendar();
  }

  /* ===== Calendar utils ===== */
  const CAL={
    fmtDate(d){ const x=new Date(d); return x.toISOString().slice(0,10); },
    sameDay(a,b){ return CAL.fmtDate(a)===CAL.fmtDate(b); },
    addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; },
    monthGrid(year,month){
      const first=new Date(year,month,1);
      const start=CAL.addDays(first,-((first.getDay()+6)%7)); // Monday
      const weeks=[]; let cur=new Date(start);
      for(let w=0; w<6; w++){ const row=[]; for(let i=0;i<7;i++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(row); }
      return weeks;
    }
  };

  function Calendar(){
    const me = DATA.me || {email:"",role:""};
    const isAdmin = (me.role==="Admin");
    const calState = App.state.calendar;
    const ym = calState.ym|| (new Date()).toISOString().slice(0,7);
    const [yy,mm] = ym.split("-").map(x=>parseInt(x,10));
    const monthIndex = mm-1;
    const monthName = new Date(yy,monthIndex,1).toLocaleString(undefined,{month:"long", year:"numeric"});
    const weeks = CAL.monthGrid(yy, monthIndex);

    function eventsForDay(d){
      const dayISO = CAL.fmtDate(d);
      return (DATA.calendar||[]).filter(ev=>CAL.fmtDate(ev.startISO)===dayISO).sort((a,b)=>a.startISO.localeCompare(b.startISO));
    }

    const grid = weeks.map(week=>{
      const tds = week.map(d=>{
        const inMonth = (d.getMonth()===monthIndex);
        const today = CAL.sameDay(d, new Date());
        const evs = eventsForDay(d);
        const chips = evs.map(e=>`<div class="cal-ev" title="${e.title} (${new Date(e.startISO).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})">
          <span class="cal-ev-dot"></span>
          <span class="cal-ev-title" data-act="openEvent" data-arg="${e.id}">${e.title}</span>
          <button class="cal-ev-del" data-act="deleteEvent" data-arg="${e.id}" title="Delete">×</button>
        </div>`).join("");
        return `<div class="cal-day ${inMonth?'':'cal-other'} ${today?'cal-today':''}" data-act="pickDay" data-arg="${d.toISOString().slice(0,10)}">
            <div class="cal-date">${d.getDate()}</div>
            <div class="cal-evs">${chips||""}</div>
          </div>`;
      }).join("");
      return `<div class="cal-week">${tds}</div>`;
    }).join("");

    const toolbar = `<div class="cal-toolbar">
        <div class="left">
          <button class="btn light" data-act="calPrev">◀</button>
          <button class="btn light" data-act="calToday">Today</button>
          <button class="btn light" data-act="calNext">▶</button>
          <div class="cal-month">${monthName}</div>
        </div>
        <div class="right">
          <div class="cal-viewtabs">
            <div class="tab ${calState.view==='month'?'active':''}" data-act="calView" data-arg="month">Month</div>
            <div class="tab ${calState.view==='agenda'?'active':''}" data-act="calView" data-arg="agenda">Agenda</div>
          </div>
        </div>
      </div>`;

    const agenda = (()=>{
      const list = (DATA.calendar||[]).filter(ev=>{
        const d = new Date(ev.startISO);
        return (d.getMonth()===monthIndex && d.getFullYear()===yy);
      }).sort((a,b)=>a.startISO.localeCompare(b.startISO));

      const rows = list.map(e=>{
        const d=new Date(e.startISO), end=new Date(e.endISO);
        return `<tr>
          <td>${d.toLocaleDateString()}</td>
          <td>${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
          <td>${e.title}</td>
          <td>${e.location||''}</td>
          <td class="right">
            <button class="btn light" data-act="openEvent" data-arg="${e.id}">Open</button>
            <button class="btn light" data-act="deleteEvent" data-arg="${e.id}">Delete</button>
          </td>
        </tr>`;
      }).join("") || `<tr><td colspan="5" class="muted">No events this month.</td></tr>`;
      return `<div class="card"><h3 class="section-title">Agenda — ${monthName}</h3>
        <table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Location</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
    })();

    const form = (()=>{
      const selDate = calState.selectedDate || new Date().toISOString().slice(0,10);
      return `<div class="card"><h3 class="section-title">Add Event</h3>
        <div class="grid cols-3">
          <div><label>Title</label><input class="input" id="ev-title" placeholder="Appointment or note"></div>
          <div><label>Date</label><input class="input" id="ev-date" type="date" value="${selDate}"></div>
          <div><label>Type</label><select class="input" id="ev-type"><option>Appointment</option><option>Note</option></select></div>
          <div><label>Start</label><input class="input" id="ev-start" type="time" value="09:00"></div>
          <div><label>End</label><input class="input" id="ev-end" type="time" value="10:00"></div>
          <div><label>Location</label><input class="input" id="ev-loc" placeholder="Room/Zoom/etc."></div>
        </div>
        <div class="right" style="margin-top:8px"><button class="btn" data-act="createEvent">Add Event</button></div>
      </div>`;
    })();

    const monthGrid = `<div class="card"><div class="cal-wrap">${toolbar}
        <div class="cal-head">
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        <div class="cal-grid">${grid}</div>
      </div></div>`;

    const content = (calState.view==='agenda') ? (toolbar + agenda) : (monthGrid + form);
    return Shell(content, 'calendar');
  }

  /* Modal for opening & editing an event */
  function renderEventModal(ev){
    const d=new Date(ev.startISO), e=new Date(ev.endISO);
    const dateStr = ev.startISO.slice(0,10);
    const startStr = ev.startISO.slice(11,16);
    const endStr = ev.endISO.slice(11,16);
    const wrap = document.createElement("div");
    wrap.className="modal-backdrop";
    wrap.innerHTML = `<div class="modal">
      <header><h3>Edit event</h3><div class="sp"></div><button class="btn light" data-x="close">Close</button></header>
      <div class="grid cols-2">
        <div><label>Title</label><input class="input" id="mev-title" value="${esc(ev.title)}"></div>
        <div><label>Date</label><input class="input" id="mev-date" type="date" value="${dateStr}"></div>
        <div><label>Start</label><input class="input" id="mev-start" type="time" value="${startStr}"></div>
        <div><label>End</label><input class="input" id="mev-end" type="time" value="${endStr}"></div>
        <div><label>Location</label><input class="input" id="mev-loc" value="${esc(ev.location||'')}"></div>
        <div><label>Type</label><select class="input" id="mev-type"><option ${ev.type==='Appointment'?'selected':''}>Appointment</option><option ${ev.type==='Note'?'selected':''}>Note</option></select></div>
      </div>
      <footer>
        <button class="btn danger" data-x="delete">Delete</button>
        <button class="btn" data-x="save">Save</button>
      </footer>
    </div>`;
    function close(){ document.body.removeChild(wrap); }
    wrap.addEventListener("click", (e)=>{
      const tgt=e.target;
      if(tgt===wrap || (tgt.dataset && tgt.dataset.x==="close")) close();
      if(tgt.dataset && tgt.dataset.x==="save"){
        const t=(document.getElementById('mev-title')||{}).value||'Untitled';
        const d=(document.getElementById('mev-date')||{}).value||ev.startISO.slice(0,10);
        const s=(document.getElementById('mev-start')||{}).value||'09:00';
        const en=(document.getElementById('mev-end')||{}).value||'10:00';
        const loc=(document.getElementById('mev-loc')||{}).value||'';
        const typ=(document.getElementById('mev-type')||{}).value||'Appointment';
        ev.title=t; ev.location=loc; ev.type=typ;
        ev.startISO = d+"T"+s+":00"; ev.endISO = d+"T"+en+":00";
        saveCalendar(); App.set({}); close();
      }
      if(tgt.dataset && tgt.dataset.x==="delete"){
        DATA.calendar = (DATA.calendar||[]).filter(x=>x.id!==ev.id);
        saveCalendar(); App.set({}); close();
      }
    });
    document.body.appendChild(wrap);
  }
  window.renderEventModal = renderEventModal; // expose

  /* Render */
  function render(){
    const r=App.state.route, el=document.getElementById('app');
    document.getElementById('boot').textContent='Rendering '+r+'…';
    if(r==='calendar') el.innerHTML = Calendar();
    else el.innerHTML = Calendar();
    document.getElementById('boot').textContent='Ready ('+BUILD+')';
  }

  /* Handlers */
  document.addEventListener('click', e=>{
    const t=e.target.closest('[data-act]'); if(!t) return;
    const act=t.getAttribute('data-act'), arg=t.getAttribute('data-arg')||"";
    const S=App.state.calendar||{view:"month"};

    if(act==='route'){ App.set({route:arg}); return; }
    if(act==='calView'){ S.view=arg; saveCalState(); App.set({calendar:S}); return; }
    if(act==='calToday'){ const today=new Date(); const ym=today.toISOString().slice(0,7); S.ym=ym; S.selectedDate=today.toISOString().slice(0,10); saveCalState(); App.set({calendar:S}); return; }
    if(act==='calPrev' || act==='calNext'){
      const [yy,mm]= (S.ym||new Date().toISOString().slice(0,7)).split('-').map(x=>parseInt(x,10));
      let y=yy, m=mm-1; if(act==='calPrev'){ m--; } else { m++; }
      if(m<0){m=11;y--;} if(m>11){m=0;y++;}
      S.ym= `${y}-${String(m+1).padStart(2,'0')}`; saveCalState(); App.set({calendar:S}); return;
    }
    if(act==='pickDay'){ S.selectedDate=arg; saveCalState(); App.set({calendar:S});
      // quick add UX: prefill date in form and focus title
      setTimeout(()=>{ const ti=document.getElementById('ev-title'); if(ti) ti.focus(); }, 0);
      return;
    }
    if(act==='createEvent'){
      const title=(document.getElementById('ev-title')||{}).value||'Untitled';
      const date=(document.getElementById('ev-date')||{}).value||new Date().toISOString().slice(0,10);
      const type=(document.getElementById('ev-type')||{}).value||'Appointment';
      const start=(document.getElementById('ev-start')||{}).value||'09:00';
      const end=(document.getElementById('ev-end')||{}).value||'10:00';
      const loc=(document.getElementById('ev-loc')||{}).value||'';
      const ownerEmail=DATA.me.email, ownerName=DATA.me.name;
      const sISO = date+"T"+start+":00"; const eISO = date+"T"+end+":00";
      DATA.calendar.push({id:uid(), title, description:"", startISO:sISO, endISO:eISO, ownerEmail, ownerName, location:loc, type});
      saveCalendar(); alert('Event added'); App.set({}); return;
    }
    if(act==='deleteEvent'){ DATA.calendar=(DATA.calendar||[]).filter(ev=>ev.id!==arg); saveCalendar(); App.set({}); return; }
    if(act==='openEvent'){
      const ev=(DATA.calendar||[]).find(x=>x.id===arg);
      if(ev) renderEventModal(ev);
      return;
    }
  });

  document.addEventListener('DOMContentLoaded', ()=>{
    loadMe();
    loadCalState();
    loadCalendar();
    App.set({});
  });
})(); 
