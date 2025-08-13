(function(){
  function fmtDate(d){
    var y = d.getFullYear();
    var m = String(d.getMonth()+1); if(m.length<2) m = "0"+m;
    var day = String(d.getDate()); if(day.length<2) day = "0"+day;
    return y + "-" + m + "-" + day;
  }
  function monthRange(d){
    var start = new Date(d.getFullYear(), d.getMonth(), 1);
    var end = new Date(d.getFullYear(), d.getMonth()+1, 0);
    return {from: fmtDate(start), to: fmtDate(end)};
  }
  function qs(id){ return document.getElementById(id); }
  function setMsg(t){ var el = qs("tb-msg"); if(el) el.textContent = t; }

  function onReady(){
    // Default dates: this month
    var rng = monthRange(new Date());
    if(qs("tb-from") && !qs("tb-from").value) qs("tb-from").value = rng.from;
    if(qs("tb-to") && !qs("tb-to").value) qs("tb-to").value = rng.to;

    // Wire buttons
    var btnS = qs("tb-summary");
    var btnD = qs("tb-detailed");
    function getRange(){
      return {from: qs("tb-from").value || rng.from, to: qs("tb-to").value || rng.to};
    }
    if(btnS){
      btnS.addEventListener("click", function(){
        var r = getRange();
        if(typeof window.exportTimesheetRangeSummary === "function"){
          try{ window.exportTimesheetRangeSummary(r.from, r.to); setMsg("Exporting summary for " + r.from + " to " + r.to + "..."); }
          catch(e){ setMsg("Summary export error: " + (e && e.message ? e.message : e)); }
        }else{
          setMsg("Summary exporter not found.");
        }
      });
    }
    if(btnD){
      btnD.addEventListener("click", function(){
        var r = getRange();
        if(typeof window.exportTimesheetRangeDetailed === "function"){
          try{ window.exportTimesheetRangeDetailed(r.from, r.to); setMsg("Exporting detailed for " + r.from + " to " + r.to + "..."); }
          catch(e){ setMsg("Detailed export error: " + (e && e.message ? e.message : e)); }
        }else{
          setMsg("Detailed exporter not found.");
        }
      });
    }

    // Boot badge flip
    var boot = document.getElementById("boot");
    if(boot) boot.textContent = "Ready";
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", onReady);
  }else{
    onReady();
  }
})();
