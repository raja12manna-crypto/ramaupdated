/* ============================================================
   RAMA — The Retro Game · input.js — keyboard, touch buttons, pointer (edge-based)
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Input (edge-based, never drops) ---------------- */
const KEYS={}, EDGE={};
const KEYMAP=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyS','KeyD',
  'KeyW','KeyB','Enter','Escape','KeyP','KeyF','KeyM','Space'];
addEventListener('keydown',e=>{ if(KEYMAP.includes(e.code)){ e.preventDefault();
  if(!KEYS[e.code])EDGE[e.code]=true; KEYS[e.code]=true; Audio2.unlock(); }});
addEventListener('keyup',e=>{ if(KEYMAP.includes(e.code)){ e.preventDefault(); KEYS[e.code]=false; }});
const held =k=>!!KEYS[k];
const tap  =k=>!!EDGE[k];
function clearEdges(){ for(const k in EDGE)EDGE[k]=false; POINTER.tapped=false; }
/* touch */
const isTouch = matchMedia('(pointer:coarse)').matches;
if(isTouch) document.body.classList.add('touch');
document.querySelectorAll('.tb').forEach(b=>{
  const k=b.dataset.k;
  const on=e=>{e.preventDefault(); if(!KEYS[k])EDGE[k]=true; KEYS[k]=true; b.classList.add('on'); Audio2.unlock();};
  const off=e=>{e.preventDefault(); KEYS[k]=false; b.classList.remove('on');};
  b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off);
  b.addEventListener('pointerleave',off); b.addEventListener('pointercancel',off);
});
const POINTER={x:0,y:0,tapped:false};
cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect();
  POINTER.x=(e.clientX-r.left)/r.width*640; POINTER.y=(e.clientY-r.top)/r.height*360;
  POINTER.tapped=true; Audio2.unlock(); });

