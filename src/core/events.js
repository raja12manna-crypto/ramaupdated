/* ============================================================
   RAMA V1 · core/events.js
   Minimal synchronous event bus. Systems communicate through
   events instead of hard references — the backbone of the
   component architecture required by the production spec.
============================================================ */
export class EventBus {
  constructor(){ this._map = new Map(); }
  on(type, fn){
    if(!this._map.has(type)) this._map.set(type, new Set());
    this._map.get(type).add(fn);
    return () => this.off(type, fn);          // unsubscribe handle
  }
  off(type, fn){ this._map.get(type)?.delete(fn); }
  emit(type, payload){
    this._map.get(type)?.forEach(fn => fn(payload));
  }
}
export const bus = new EventBus();            // global bus instance
