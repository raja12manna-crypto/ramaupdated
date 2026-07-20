/* ============================================================
   RAMA — The Retro Game · main.js — boot, login gate, public RAMA namespace
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Boot & login gate ---------------- */
const gate=document.getElementById('gate'), gbtn=document.getElementById('gbtn'),
      gerr=document.getElementById('gerr'), devEnter=document.getElementById('devEnter'),
      cfgNote=document.getElementById('cfgNote'), who=document.getElementById('who');
function startGame(user){
  Cloud.user=user;
  localLoad();
  const go=()=>{
    gate.style.display='none';
    const pos=SAVE.pos&&ROOMS[SAVE.pos.room]?SAVE.pos:{room:'palace_court',x:ROOMS.palace_court.spawn};
    if(SAVE.flags.ch2done){
      G.followers=[{c:'#3a8a4a',off:34}];
      pos.room='panchavati'; pos.x=ROOMS.panchavati.spawn;
      G.objective='Chapter 3 — the road south to Kishkindha (coming soon)';
    }
    else if(SAVE.flags.ch1done){
      G.followers=[{c:'#e0a030',off:30,female:true},{c:'#3a8a4a',off:58}];
      const ch2rooms=['forest_path','ganga_bank','panchavati'];
      if(!ch2rooms.includes(pos.room)){
        pos.room=SAVE.flags.crossed?'panchavati':'forest_path';
        pos.x=ROOMS[pos.room].spawn;
      }
      G.objective=SAVE.flags.crossed?'Something golden glints near the shrine...'
        :(SAVE.talked.guha?'Board Guha\'s boat — cross the Ganga':'Walk the forest road — find the Ganga (east)');
    }
    else if(SAVE.flags.trained)G.objective='Return to the palace (far west)';
    else if(SAVE.flags.guruMet)G.objective='Speak to the Guru again — the bow calls';
    else if(SAVE.flags.met5)G.objective='Find Guru Vashishtha — training grounds, far east';
    enterRoom(pos.room,pos.x);
    G.mode='play';
    Audio2.unlock(); Audio2.play(SAVE.flags.ch1done?'forest':'ayodhya');
  };
  if(user){ Cloud.load(user.uid).then(cloudSave=>{
      if(cloudSave&&cloudSave.v===1&&(cloudSave.dharma||0)>=(SAVE.dharma||0)){
        const base=DEFAULT_SAVE(); for(const k in SAVE)delete SAVE[k];
        Object.assign(SAVE,base,cloudSave); }
      go();
    }); } else go();
}
Cloud.init();
if(Cloud.offline){
  devEnter.style.display='block'; cfgNote.style.display='block';
  gbtn.addEventListener('click',()=>{ gerr.style.display='block';
    gerr.textContent='Firebase keys not pasted yet — use offline dev mode below, or send Claude your firebaseConfig.'; });
  devEnter.addEventListener('click',()=>startGame(null));
}else{
  gbtn.addEventListener('click',()=>{ Cloud.signIn().catch(e=>{
    gerr.style.display='block'; gerr.textContent='Sign-in failed: '+(e&&e.message||e); }); });
  Cloud.onAuth(u=>{ if(u){ who.style.display='block';
      who.textContent='🙏 '+(u.displayName||'Pilgrim'); startGame(u); } });
}
requestAnimationFrame(frame);
/* debug hook */
window.__DBG={G,P,SAVE,enterRoom,Audio2,Cloud,startGame,startTraining,finishTraining,startExileScene,beginExileWalk,endChapter,get NPCS(){return NPCS}};

/* ---------------- Public namespace ---------------- */
window.RAMA = {
  version:'1.2-chapter2b',
  G, P, get SAVE(){return SAVE;}, get NPCS(){return NPCS;},
  Cloud, Audio2, Assets,
  enterRoom, startGame, startTraining, finishTraining,
  startExileScene, beginExileWalk, endChapter, startChapter2, startCrossing,
  startDeerScene, startJatayu, endChapter2, postCh2, grantEntry, toast
};
