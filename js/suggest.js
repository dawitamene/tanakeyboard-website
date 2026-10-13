/* Talks to the Amharic suggestion engine worker (engine/<version>/worker.mjs). One request of
   each kind is in flight at a time; a newer request replaces any that has not been sent yet. */
(function(){
  'use strict';

  function supported(){
    return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined' &&
      typeof DecompressionStream !== 'undefined' && typeof TransformStream !== 'undefined';
  }

  function create(workerUrl, onStatus){
    var worker = null;
    var nextId = 1;
    var lanes = {};
    var waiting = {};

    function ensureStarted(){
      if(worker) return;
      try {
        worker = new Worker(workerUrl, { type: 'module' });
      } catch (error) {
        onStatus({ state: 'failed', message: String(error) });
        return;
      }
      onStatus({ state: 'loading', loaded: 0, total: 0 });
      worker.onmessage = function(event){
        var message = event.data;
        if(message.type === 'progress') onStatus({ state: 'loading', loaded: message.loaded, total: message.total });
        else if(message.type === 'ready') onStatus({ state: 'ready' });
        else if(message.type === 'error' && !message.id) onStatus({ state: 'failed', message: message.message });
        else if(message.type === 'result' || message.type === 'error') settle(message);
      };
      worker.onerror = function(event){
        onStatus({ state: 'failed', message: event.message || 'worker error' });
      };
      worker.postMessage({ type: 'start' });
    }

    function settle(message){
      var entry = waiting[message.id];
      if(!entry) return;
      delete waiting[message.id];
      var lane = lanes[entry.kind];
      lane.busy = false;
      if(message.type === 'error'){
        onStatus({ state: 'failed', message: message.message });
        entry.reject(new Error(message.message));
      } else {
        entry.resolve(message.value);
      }
      if(lane.pending){
        var next = lane.pending;
        lane.pending = null;
        send(entry.kind, next);
      }
    }

    function send(kind, item){
      var id = nextId++;
      lanes[kind].busy = true;
      waiting[id] = { kind: kind, resolve: item.resolve, reject: item.reject };
      var payload = Object.assign({ id: id, type: kind }, item.payload);
      worker.postMessage(payload);
    }

    function request(kind, payload){
      ensureStarted();
      if(!worker) return Promise.reject(new Error('engine unavailable'));
      var lane = lanes[kind] || (lanes[kind] = { busy: false, pending: null });
      return new Promise(function(resolve, reject){
        var item = { payload: payload, resolve: resolve, reject: reject };
        if(lane.busy){
          if(lane.pending) lane.pending.reject(new Error('superseded'));
          lane.pending = item;
        } else {
          send(kind, item);
        }
      });
    }

    return { start: ensureStarted, request: request };
  }

  window.AddiyonSuggest = { supported: supported, create: create };
})();
