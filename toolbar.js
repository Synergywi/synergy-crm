(function(){
  function fmt(d){var y=d.getFullYear(),m=('0'+(d.getMonth()+1)).slice(-2),da=('0'+d.getDate()).slice(-2);return y+'-'+m+'-'+da;}
  function monthRange(){var n=new Date();return {from:fmt(new Date(n.getFullYear(),n.getMonth(),1)), to:fmt(new Date(n.getFullYear(),n.getMonth()+1,0))};}
  function el(id){return document.getElementById(id);}
  function onReady(){
    var r=monthRange(); if(el('tb-from')&&!el('tb-from').value) el('tb-from').value=r.from; if(el('tb-to')&&!el('tb-to').value) el('tb-to').value=r.to;
    function getR(){return {from:el('tb-from').value||r.from, to:el('tb-to').value||r.to};}
    var s=el('tb-summary'); if(s){s.addEventListener('click',function(){var rg=getR(); if(typeof window.exportTimesheetRangeSummary==='function'){try{window.exportTimesheetRangeSummary(rg.from,rg.to);}catch(e){}}});}
    var d=el('tb-detailed'); if(d){d.addEventListener('click',function(){var rg=getR(); if(typeof window.exportTimesheetRangeDetailed==='function'){try{window.exportTimesheetRangeDetailed(rg.from,rg.to);}catch(e){}}});}
    var b=document.getElementById('boot'); if(b){b.textContent='Ready (clean)';}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', onReady); else onReady();
})();