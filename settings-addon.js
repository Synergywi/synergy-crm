(function(){
  'use strict';
  var SETTINGS_KEY='synergy_settings_v1';
  var SESSION_KEY='synergy_userSessions_v1';
  function migrateKeys(){
    try{
      var map = {};
      map[SETTINGS_KEY] = ['settings','app_settings','crm_settings'];
      map[SESSION_KEY]  = ['synergy_userSessions','userSessions','sessions'];
      for(var canon in map){
        if(!map.hasOwnProperty(canon)) continue;
        if(localStorage.getItem(canon)) continue;
        var sources = map[canon];
        for(var i=0;i<sources.length;i++){
          var v = localStorage.getItem(sources[i]);
          if(v && v.length>2){ localStorage.setItem(canon, v); break; }
        }
      }
    }catch(e){}
  }
  migrateKeys();
  function defaults(){
    return {
      org:{name:'Your Org',logo:'',color:'#1166cc',timezone:(Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'),weekStart:'Mon'},
      auth:{sessionTimeoutMins:60,require2fa:false,passwordPolicy:'standard'},
      roles:{Admin:{viewAll:true,editAll:true},Investigator:{viewAssigned:true,editAssigned:true},Reviewer:{viewAll:true,editAssigned:false}},
      cases:{idPattern:'INV-{YYYY}-{NNN}',statuses:['Planning','Investigation','Evidence Review','Closed'],sla:{triageHours:24}},
      comms:{method:'smtp',from:'noreply@example.com',replyTo:''},
      privacy:{redactPIIInExports:true,retention:{casesDays:1095,commsDays:365}},
      ui:{density:'comfortable',fontScale:1,darkMode:false},
      integrations:{drive:false,sharepoint:false,calendar:false}
    };
  }
  function loadSettings(){
    try{
      var base = defaults();
      var raw = localStorage.getItem(SETTINGS_KEY);
      if(!raw) return base;
      var obj = JSON.parse(raw||'{}')||{};
      for(var k in obj){
        if(!obj.hasOwnProperty(k)) continue;
        if(obj[k] && typeof obj[k]==='object'){
          var merged = {};
          var src = base[k]||{};
          for(var kk in src){ if(src.hasOwnProperty(kk)) merged[kk] = src[kk]; }
          for(var kk2 in obj[k]){ if(obj[k].hasOwnProperty(kk2)) merged[kk2] = obj[k][kk2]; }
          base[k] = merged;
        }else{
          base[k] = obj[k];
        }
      }
      return base;
    }catch(e){ return defaults(); }
  }
  function saveSettings(s){
    try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s||{})); }catch(e){}
  }
  function $(sel,root){ return (root||document).querySelector(sel); }
  function appEl(){ return $('#app') || $('.main') || $('main') || document.body; }
  function row(label, inputHtml){
    return '<div style="margin:10px 0"><label style="display:block;margin:0 0 6px 0;color:#6b7b8f;font-size:13px">'+label+'</label>'+inputHtml+'</div>';
  }
  function input(id,val,type){
    if(val==null) val='';
    type=type||'text';
    return '<input id="'+id+'" type="'+type+'" value="'+(val)+'" style="width:100%;padding:.5rem .6rem;border:1px solid #e6eef6;border-radius:8px">';
  }
  function select(id,opts,val){
    var html = '<select id="'+id+'" style="width:100%;padding:.5rem .6rem;border:1px solid #e6eef6;border-radius:8px">';
    for(var i=0;i<opts.length;i++){
      var opt = opts[i];
      var v = (typeof opt==='string')? opt : opt[0];
      var t = (typeof opt==='string')? opt : opt[1];
      var sel = (String(v)===String(val))? ' selected' : '';
      html += '<option value="'+v+'"'+sel+'>'+t+'</option>';
    }
    html += '</select>';
    return html;
  }
  function checkbox(id,checked,label){
    return '<label style="display:flex;align-items:center;gap:8px"><input id="'+id+'" type="checkbox" '+(checked?'checked':'')+'> <span>'+label+'</span></label>';
  }
  function renderSettings(){
    var s = (window.DATA&&DATA.settings) || loadSettings();
    try{ if(window.DATA) DATA.settings = s; }catch(e){}
    var h = '';
    h += '<section style="background:#fff;border:1px solid #e6eef6;border-radius:14px;padding:14px;margin:12px 0">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h +=   '<h2 style="margin:0;font-size:18px">System Settings</h2>';
    h +=   '<div><button data-act="set-close" style="margin-right:6px;padding:7px 12px;border-radius:8px;border:1px solid #cfe3f6;background:#eef5fb;cursor:pointer">Close</button>';
    h +=   '<button data-act="set-save" style="padding:7px 12px;border-radius:8px;border:0;background:#1166cc;color:#fff;cursor:pointer">Save</button></div>';
    h += '</div>';
    h += '<div style="display:grid;gap:12px;grid-template-columns:1fr 1fr">';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">Organization & Branding</h3>';
    h += row('Organization name', input('org-name', s.org.name));
    h += row('Primary color', input('org-color', s.org.color));
    h += row('Timezone', input('org-tz', s.org.timezone));
    h += row('Week starts on', select('org-week', ['Mon','Sun'], s.org.weekStart));
    h += '</div>';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">Security & Auth</h3>';
    h += row('Session timeout (mins)', input('auth-timeout', s.auth.sessionTimeoutMins, 'number'));
    h += row('', checkbox('auth-2fa', !!s.auth.require2fa, 'Require 2FA'));
    h += row('Password policy', select('auth-policy', ['standard','strong'], s.auth.passwordPolicy));
    h += '</div>';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">Case Settings</h3>';
    h += row('Case ID pattern', input('case-pattern', s.cases.idPattern));
    h += row('Default statuses (comma-separated)', input('case-statuses', (s.cases.statuses||[]).join(', ')));
    h += row('Triaged within (hours)', input('case-triage', s.cases.sla.triageHours, 'number'));
    h += '</div>';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">Communications</h3>';
    h += row('From address', input('comms-from', s.comms.from));
    h += row('Reply-to', input('comms-reply', s.comms.replyTo));
    h += '</div>';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">Privacy & Retention</h3>';
    h += row('', checkbox('pii-redact', !!s.privacy.redactPIIInExports, 'Redact PII in exports'));
    h += row('Case retention (days)', input('ret-cases', s.privacy.retention.casesDays, 'number'));
    h += row('Comms retention (days)', input('ret-comms', s.privacy.retention.commsDays, 'number'));
    h += '</div>';
    h += '<div style="border:1px solid #e6eef6;border-radius:12px;padding:12px"><h3 style="margin:0 0 8px 0;font-size:16px">UI</h3>';
    h += row('Density', select('ui-density', ['comfortable','compact'], s.ui.density));
    h += row('Font scale', input('ui-font', s.ui.fontScale, 'number'));
    h += row('', checkbox('ui-dark', !!s.ui.darkMode, 'Dark mode'));
    h += '</div>';
    h += '</div>';
    h += '</section>';
    appEl().innerHTML = h;
    var get = function(id){ var el=document.getElementById(id); return el?el.value:''; };
    var getn = function(id,def){ var n=parseFloat(get(id)||''); return isNaN(n)?def:n; };
    var getb = function(id){ var el=document.getElementById(id); return !!(el&&el.checked); };
    appEl().querySelector('[data-act="set-save"]').addEventListener('click', function(){
      s.org.name = get('org-name') || 'Your Org';
      s.org.color = get('org-color') || '#1166cc';
      s.org.timezone = get('org-tz') || 'UTC';
      s.org.weekStart = get('org-week') || 'Mon';
      s.auth.sessionTimeoutMins = parseInt(get('auth-timeout')||'60',10)||60;
      s.auth.require2fa = getb('auth-2fa');
      s.auth.passwordPolicy = get('auth-policy') || 'standard';
      s.cases.idPattern = get('case-pattern') || 'INV-{YYYY}-{NNN}';
      s.cases.statuses = (get('case-statuses')||'').split(',').map(function(x){return x.trim();}).filter(function(x){return !!x;});
      s.cases.sla.triageHours = parseInt(get('case-triage')||'24',10)||24;
      s.comms.from = get('comms-from') || '';
      s.comms.replyTo = get('comms-reply') || '';
      s.privacy.redactPIIInExports = getb('pii-redact');
      s.privacy.retention.casesDays = parseInt(get('ret-cases')||'1095',10)||1095;
      s.privacy.retention.commsDays = parseInt(get('ret-comms')||'365',10)||365;
      s.ui.density = get('ui-density') || 'comfortable';
      s.ui.fontScale = getn('ui-font', 1);
      s.ui.darkMode = getb('ui-dark');
      try{ if(window.DATA) DATA.settings = s; }catch(e){}
      saveSettings(s);
      alert('Settings saved');
    });
    appEl().querySelector('[data-act="set-close"]').addEventListener('click', function(){
      if(location.hash==='#settings'){ history.back(); }
      else { location.hash=''; }
    });
  }
  function addMenuItem(){
    var nav = document.querySelector('#nav') || document.querySelector('.nav') || document.querySelector('aside ul') || document.querySelector('nav ul');
    if(!nav){ return; }
    var exists = false;
    for(var i=0;i<nav.children.length;i++){
      var li = nav.children[i];
      if((li.textContent||'').toLowerCase().indexOf('system settings')>-1){ exists=true; break; }
    }
    if(exists) return;
    var li2 = document.createElement('li');
    li2.textContent = 'System Settings';
    li2.style.cursor = 'pointer';
    li2.addEventListener('click', function(ev){
      ev.preventDefault(); location.hash = '#settings'; renderSettings();
    });
    nav.appendChild(li2);
  }
  function onHash(){ if(location.hash==='#settings'){ renderSettings(); } }
  window.addEventListener('hashchange', onHash);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ addMenuItem(); onHash(); });
  }else{
    addMenuItem(); onHash();
  }
})();