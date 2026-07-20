/* ============================================================
   RAMA — The Retro Game · state.js — G, P, NPCS, BIRDS + toast/grantEntry
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Game state ---------------- */
const G={ mode:'gate', room:null, camX:0, t:0,
  dlg:null, dlgLine:0, dlgChar:0, bookSel:0,
  toastMsg:'', toastT:0, objective:'Meet the people of Ayodhya',
  metCount:0 };
const P={ x:150, y:GROUND, vx:0, vy:0, dir:1, onG:true, walkT:0, name:'RAMA' };
let NPCS=[], BIRDS=[];

function toast(m){ G.toastMsg=m; G.toastT=3; }
/* pause-safe delayed calls: run on the GAME clock, frozen with the loop */
function after(sec,fn){ (G.timers=G.timers||[]).push({t:sec,fn}); }
function runTimers(dt){
  if(!G.timers||!G.timers.length)return;
  const due=[];
  for(const tm of G.timers){ tm.t-=dt; if(tm.t<=0)due.push(tm); }
  G.timers=G.timers.filter(tm=>tm.t>0);
  for(const tm of due)tm.fn();
}
function grantEntry(id){
  if(SAVE.entries.includes(id))return;
  SAVE.entries.push(id); SAVE.dharma+=10; persist();
  Audio2.dharma(); toast('✦ Book of Dharma — new entry!');
}

