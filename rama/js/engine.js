/* ============================================================
   RAMA — The Retro Game · engine.js — fixed-timestep loop & mode dispatch
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Frame loop (fixed timestep) ---------------- */
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    if(G.mode==='play')G.mode='pause';
    Audio2.pause();
    Cloud.flush&&Cloud.flush();
  }
});
addEventListener('beforeunload',()=>{ Cloud.flush&&Cloud.flush(); });
let acc=0,lastT=performance.now();
function frame(now){
  const raw=Math.min((now-lastT)/1000,.1); lastT=now; acc+=raw;
  const DT=1/60;
  while(acc>=DT){
    if(G.mode!=='pause')G.t+=DT;
    if(G.mode!=='pause'&&G.mode!=='gate')runTimers(DT);
    if(tap('KeyM')){Audio2.muted=!Audio2.muted;}
    if(tap('KeyF')){ if(!document.fullscreenElement)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
      else document.exitFullscreen(); }
    if((tap('KeyP')||tap('Escape'))&&(G.mode==='play')){G.mode='pause';Audio2.pause();}
    else if(G.mode==='play')updatePlay(DT);
    else if(G.mode==='dialog')updateDialog(DT);
    else if(G.mode==='book')updateBook();
    else if(G.mode==='pause')updatePause();
    else if(G.mode==='train')updateTrain(DT);
    else if(G.mode==='boat')updateBoat(DT);
    else if(G.mode==='deeraim')updateDeerAim(DT);
    else if(G.mode==='jatayu')updateJatayu(DT);
    else if(G.mode==='cutscene')updateCutscene(DT);
    else if(G.mode==='exile')updateExile(DT);
    else if(G.mode==='ending')updateEnding();
    if(G.toastT>0)G.toastT-=DT;
    clearEdges();
    acc-=DT;
  }
  /* render */
  if((G.mode==='jatayu'||(G.jatBG&&G.mode==='cutscene'))&&G.jat){ drawJatayu(); if(G.mode==='cutscene'&&G.cut)drawCut(); }
  else if(G.mode==='boat'&&G.boat){ drawBoat(); }
  else if(G.mode==='train'&&G.train){ drawTrain(); }
  else if(G.mode!=='gate'&&G.room){
    const th=THEMES[G.room.theme];
    drawSky(th); drawDecor(); drawGround(th);
    for(const b of BIRDS)drawBird(b);
    for(const n of NPCS)
      drawHuman(px(n.x),n.y,n.dir,n.c,'#d8a878',n.kid?G.t*10:(Math.abs((n.tx||n.x)-n.x)>2?G.t*8:0),
        {old:n.guru||n.id==='sita_hint',veena:n.music,hair:n.kid?'#3a2a10':undefined});
    drawHuman(px(P.x),P.y,P.dir,'#3a58c8','#c89060',
      (held('ArrowLeft')||held('ArrowRight'))&&P.onG?G.t*11:0,{crown:true,bow:true});
    /* the golden deer */
    if(G.chase&&G.roomId==='deer_woods')drawDeer(px(G.chase.dx),GROUND,G.chase.cornered,G.t);
    if(G.roomId==='panchavati'&&SAVE.flags.crossed&&!SAVE.flags.ch2done&&!G.postDeer)
      drawDeer(px(548),GROUND,true,G.t);
    /* exile followers + farewells */
    if(G.followers)G.followers.forEach(f=>{
      drawHuman(px(P.x-f.off),GROUND,1,f.c,'#c89060',G.t*9,{hair:f.female?'#100a06':undefined});
    });
    if(G.mode==='exile')for(const n of NPCS){
      if(Math.abs(n.x-P.x)<170&&n.farewell){
        ctx.textAlign='center'; ctx.font='8px monospace';
        ctx.fillStyle='rgba(242,236,216,'+(0.5+0.5*Math.sin(G.t*2+n.wave))+')';
        ctx.fillText(n.farewell,px(n.x),GROUND-64-Math.sin(G.t*1.5+n.wave)*3);
      }
    }
    drawHUD();
    if(G.mode==='dialog')drawDialog();
    if(G.mode==='cutscene'&&G.cut)drawCut();
    if(G.mode==='book')drawBook();
    if(G.mode==='pause')drawPauseScr();
    if(G.mode==='deeraim')drawDeerAimOverlay();
    if(G.mode==='ending')drawEnding();
  }
  requestAnimationFrame(frame);
}

