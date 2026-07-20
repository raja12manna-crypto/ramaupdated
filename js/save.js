/* ============================================================
   RAMA — The Retro Game · save.js — SAVE state, localStorage + cloud persist
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Save state ---------------- */
const DEFAULT_SAVE = ()=>({
  chapter:1, dharma:0,
  flags:{},           // story/quest flags
  talked:{},          // npc id -> times
  entries:[],         // Book of Dharma entry ids
  pos:null,           // {room,x}
  v:1
});
let SAVE = DEFAULT_SAVE();
function localLoad(){ try{ const d=JSON.parse(localStorage.getItem('rama_v1'));
  if(d&&d.v===1){ const base=DEFAULT_SAVE(); for(const k in SAVE)delete SAVE[k];
    Object.assign(SAVE,base,d); } }catch(e){} }
function persist(){
  try{ localStorage.setItem('rama_v1',JSON.stringify(SAVE)); }catch(e){}
  if(Cloud.user) Cloud.save(Cloud.user.uid,SAVE);
}

