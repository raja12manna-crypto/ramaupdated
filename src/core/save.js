/* ============================================================
   RAMA V1 · core/save.js
   Local + cloud persistence. Local always works (offline-first);
   cloud sync layers on top automatically once signed in (see
   core/firebase.js). Shape is intentionally minimal for the
   current movement-demo milestone — grows as real progression
   (chapters, unlocks, weapons) lands in later modules.
============================================================ */
import { Cloud } from './firebase.js';

const KEY = 'rama_v1_save';

export const DEFAULT_SAVE = () => ({
  v: 1,
  bestX: 0,          // furthest x reached in the current stage
  reachedEnd: false,  // cleared the Forest of Tatākā demo stage
  playTimeSec: 0,
});

export let SAVE = DEFAULT_SAVE();

export function localLoad(){
  try{
    const raw = JSON.parse(localStorage.getItem(KEY));
    if(raw && raw.v === 1){
      const base = DEFAULT_SAVE();
      for(const k in SAVE) delete SAVE[k];
      Object.assign(SAVE, base, raw);
    }
  }catch(e){}
}

export function persist(){
  try{ localStorage.setItem(KEY, JSON.stringify(SAVE)); }catch(e){}
  Cloud.save(SAVE);
}

/* Cloud save wins only if it represents more progress than local —
   never silently overwrite a further-along local run with a stale
   cloud snapshot from another device. */
export async function cloudMerge(uid){
  const remote = await Cloud.load(uid);
  if(remote && remote.v === 1 && (remote.bestX || 0) >= (SAVE.bestX || 0)){
    const base = DEFAULT_SAVE();
    for(const k in SAVE) delete SAVE[k];
    Object.assign(SAVE, base, remote);
  }
}
