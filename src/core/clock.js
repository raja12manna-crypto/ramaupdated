/* ============================================================
   RAMA V1 · core/clock.js
   The GAME clock — advances only when the simulation steps.
   All delayed calls run here, never on wall-clock setTimeout.
   (Audit lesson from v1.x: wall-clock timers fire into wrong
   states across pause / tab-hide. This class makes that
   impossible by construction.)
============================================================ */
export class GameClock {
  constructor(){
    this.t = 0;              // total simulated seconds
    this.scale = 1;          // hitstop / slow-mo hook for Combat (Module 8)
    this._timers = [];
  }
  /* schedule fn after `sec` simulated seconds */
  after(sec, fn){ this._timers.push({ t: sec, fn }); }
  /* advance one fixed step; fires due timers in order */
  tick(dt){
    const d = dt * this.scale;
    this.t += d;
    if(this._timers.length === 0) return;
    const due = [];
    for(const tm of this._timers){ tm.t -= d; if(tm.t <= 0) due.push(tm); }
    this._timers = this._timers.filter(tm => tm.t > 0);
    for(const tm of due) tm.fn();
  }
  clear(){ this._timers.length = 0; }          // scene transitions call this
}
