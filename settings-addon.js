(function(){
  // Safe, non-invasive helper: if user enters #settings, let app route handle it.
  function onHash(){ try{ if(location.hash==='#settings' && window.App && typeof App.set==='function'){ App.set({route:'settings'}); } }catch(e){} }
  window.addEventListener('hashchange', onHash);
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', onHash); } else { onHash(); }
})();