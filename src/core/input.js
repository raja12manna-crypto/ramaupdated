/* ============================================================
   RAMA V1 · core/input.js — INPUT SYSTEM
   Edge-based (tap vs held) keyboard input, mapped to named
   actions so gameplay code never checks raw key codes.
   Edges are cleared once per fixed simulation step via the
   'engine:step' event — guaranteed to run AFTER that step's
   update (see engine.js emit order), so no input is ever
   dropped or double-consumed across frames.
============================================================ */
import { bus } from './events.js';

const ACTIONS = {
  left:  ['ArrowLeft'],
  right: ['ArrowRight'],
  down:  ['ArrowDown'],
  jump:  ['Space', 'KeyZ'],
  dash:  ['KeyX'],
};
const ALL_CODES = new Set(Object.values(ACTIONS).flat());

export class InputSystem {
  constructor(){
    this._keys = {};
    this._edge = {};
    addEventListener('keydown', (e) => {
      if(ALL_CODES.has(e.code)){ e.preventDefault();
        if(!this._keys[e.code]) this._edge[e.code] = true;
        this._keys[e.code] = true; }
    });
    addEventListener('keyup', (e) => {
      if(ALL_CODES.has(e.code)) this._keys[e.code] = false;
    });
    bus.on('engine:step', () => { this._edge = {}; });
  }
  held(action){ return (ACTIONS[action] || []).some(c => this._keys[c]); }
  tap(action){  return (ACTIONS[action] || []).some(c => this._edge[c]); }
}
