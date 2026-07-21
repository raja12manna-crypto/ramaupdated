/* ============================================================
   RAMA V1 · core/input.js — INPUT SYSTEM
   Edge-based (tap vs held) input from keyboard AND touch
   buttons, both mapped to the same named actions so gameplay
   code never checks raw key codes or DOM elements. Edges are
   cleared once per fixed simulation step via the 'engine:step'
   event — guaranteed to run AFTER that step's update (see
   engine.js emit order), so no input is ever dropped or
   double-consumed across frames.
============================================================ */
import { bus } from './events.js';

const ACTIONS = {
  left:  ['ArrowLeft'],
  right: ['ArrowRight'],
  up:    ['ArrowUp'],
  down:  ['ArrowDown'],
  jump:  ['Space', 'KeyZ'],
  dash:  ['KeyX'],
  confirm: ['Space', 'KeyZ', 'Enter'],
  back:    ['Escape'],
};
const ALL_CODES = new Set(Object.values(ACTIONS).flat());

export class InputSystem {
  constructor(){
    this._keys = {};
    this._edge = {};
    this._touch = {};       // action -> bool, set by touch buttons
    addEventListener('keydown', (e) => {
      if(ALL_CODES.has(e.code)){ e.preventDefault();
        if(!this._keys[e.code]) this._edge[e.code] = true;
        this._keys[e.code] = true; }
    });
    addEventListener('keyup', (e) => {
      if(ALL_CODES.has(e.code)) this._keys[e.code] = false;
    });
    bus.on('engine:step', () => { this._edge = {}; this._touchEdge = {}; });
  }
  held(action){
    return this._touch[action] || (ACTIONS[action] || []).some(c => this._keys[c]);
  }
  tap(action){
    return (this._touchEdge && this._touchEdge[action]) || (ACTIONS[action] || []).some(c => this._edge[c]);
  }
  /* Wire on-screen buttons: element must have data-action="jump" etc. */
  bindTouchButtons(container){
    if(!container) return;
    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      const on = (e) => { e.preventDefault();
        if(!this._touch[action]) (this._touchEdge ||= {})[action] = true;
        this._touch[action] = true; btn.classList.add('on'); };
      const off = (e) => { e.preventDefault(); this._touch[action] = false; btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointerleave', off);
      btn.addEventListener('pointercancel', off);
    });
  }
}
