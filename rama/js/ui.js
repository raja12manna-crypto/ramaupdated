/* ============================================================
   RAMA — The Retro Game · ui.js — HUD, pause screen
   Classic script; shares global scope. Load order matters.
============================================================ */
function drawHUD(){
  ctx.textAlign='left'; ctx.font='bold 10px monospace';
  ctx.fillStyle='rgba(10,6,18,.6)'; ctx.fillRect(0,0,W,24);
  ctx.fillStyle='#f2c14e'; ctx.fillText(SAVE.chapter>=3?'CH.3  THE SEARCH':SAVE.chapter>=2?'CH.2  THE FOREST':'CH.1  AYODHYA',8,15);
  ctx.fillStyle='#e8e0d0'; ctx.fillText('◆ '+G.objective,110,15);
  ctx.textAlign='right';
  ctx.fillStyle='#f2c14e'; ctx.fillText('DHARMA '+SAVE.dharma+(Audio2.muted?'  🔇':''),W-8,15);
  ctx.textAlign='center'; ctx.fillStyle='rgba(232,224,208,.7)'; ctx.font='9px monospace';
  ctx.fillText(G.room.label,W/2,GROUND+52>H-8?H-4:H-6);
  const near=nearestInteract();
  if(near&&G.mode==='play'){
    const nx=near.type==='bell'?px(560):near.type==='boat'?px(600):near.type==='deer'?px(560):px(near.n.x);
    ctx.fillStyle='#f2c14e'; ctx.font='bold 10px monospace';
    if(Math.sin(G.t*6)>-.3)ctx.fillText('A',nx,GROUND-58);
  }
  if(G.toastT>0){ ctx.fillStyle='rgba(242,193,78,'+Math.min(1,G.toastT)+')';
    ctx.font='bold 11px monospace'; ctx.fillText(G.toastMsg,W/2,44); }
}
function drawPauseScr(){
  ctx.fillStyle='rgba(8,5,14,.8)';ctx.fillRect(0,0,W,H);
  ctx.textAlign='center'; ctx.fillStyle='#f2c14e'; ctx.font='bold 26px monospace';
  ctx.fillText('PAUSED',W/2,150);
  ctx.fillStyle='#e8e0d0'; ctx.font='11px monospace';
  ctx.fillText('P resume · M mute · F fullscreen',W/2,190);
}
function updatePause(){
  if(tap('KeyA')||tap('Enter')||tap('KeyP')||POINTER.tapped){ G.mode='play'; Audio2.resume(); }
}

/* ---------------- Cutscenes ---------------- */
