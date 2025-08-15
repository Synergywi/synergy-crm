(function(){
  // Lightweight toolbar shim so we don't break the rest of the app.
  // Expose a simple pub/sub for buttons if the host doesn't provide one.
  if (!window.SynergyBus){
    const listeners = {};
    window.SynergyBus = {
      on(evt, cb){ (listeners[evt] ||= []).push(cb); },
      emit(evt, data){ (listeners[evt]||[]).forEach(f=>f(data)); }
    };
  }
})();