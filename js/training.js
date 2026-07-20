/* ============================================================
   RAMA — The Retro Game · training.js — the Bow of Stillness
   Classic script; shares global scope. Load order matters.
============================================================ */
function startTraining(){
  G.train={hits:0,need:5,amp:60,sway:0,still:0,shotT:0,msg:'',msgT:0,arrow:null};
  G.mode='train'; P.x=200; P.dir=1; Audio2.play('dusk');
}
function updateTrain(dt){
  const T=G.train;
  /* stillness: not touching movement keys shrinks the sway */
  const moving=held('ArrowLeft')||held('ArrowRight');
  T.still=moving?0:Math.min(3,T.still+dt);
  T.amp=60-T.still*16;               /* 60 → 12 px sway */
  T.sway=Math.sin(G.t*2.6)*T.amp;
  if(T.msgT>0)T.msgT-=dt;
  if(T.arrow){ T.arrow.x+=T.arrow.vx*dt;
    if(T.arrow.x>T.arrow.tx){ /* resolve */
      const off=Math.abs(T.arrow.off);
      if(off<14){ T.hits++; Audio2.tone(880,.2,'square',.08,220); Audio2.noise(.06,.06,3000);
        T.msg=['Center!','Steady hand!','The guru nods.','Like breathing.','Perfect stillness.'][T.hits-1]||'Hit!';
      } else { T.msg=off<30?'So close — breathe, be still…':'The arrow chased. Let the target come.'; Audio2.uiB(); }
      T.msgT=1.6; T.arrow=null;
      if(T.hits>=T.need){ setTimeout(()=>finishTraining(),900); }
    } }
  else if(tap('KeyA')){ T.arrow={x:P.x+16,tx:470,vx:520,off:T.sway}; Audio2.tone(520,.1,'square',.06,-180); }
  if(tap('Escape')||tap('KeyP')){ G.mode='play'; G.train=null; Audio2.play('ayodhya'); }
}
function finishTraining(){
  if(SAVE.flags.trained)return;
  SAVE.flags.trained=1; SAVE.dharma+=25; persist();
  grantEntry('first_bow');
  G.objective='Return to the palace — the King calls';
  G.mode='play'; Audio2.play('ayodhya');
  G.dlg={npc:{id:'guru'},page:['Guru Vashishtha','Enough. The bow knows you now. Go — a messenger came from the palace. Your father calls for you, Rama.']};
  G.dlgChar=0; G.mode='dialog';
}
function drawTrain(){
  const th=THEMES.train; drawSky(th); drawDecor(); drawGround(th);
  drawHuman(px(260),GROUND,1,'#f2e0c0','#d8a878',0,{old:true});
  drawHuman(px(P.x),P.y,1,'#3a58c8','#c89060',0,{crown:true,bow:true});
  const T=G.train, tx=px(470), ty=GROUND-92;
  /* target */
  ctx.fillStyle='#f8f0e0';ctx.beginPath();ctx.arc(tx,ty,22,0,7);ctx.fill();
  ctx.fillStyle='#e05555';ctx.beginPath();ctx.arc(tx,ty,14,0,7);ctx.fill();
  ctx.fillStyle='#f8f0e0';ctx.beginPath();ctx.arc(tx,ty,6,0,7);ctx.fill();
  R(tx-4,ty+22,8,70,'#6a4a2a');
  /* aim marker sways vertically over target */
  const ay=ty+T.sway;
  ctx.strokeStyle='#f2c14e';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(tx,ay,26,0,7);ctx.stroke();
  R(tx-30,ay,8,2,'#f2c14e'); R(tx+22,ay,8,2,'#f2c14e');
  /* arrow in flight */
  if(T.arrow){ R(px(T.arrow.x),ty+T.arrow.off-1,16,2,'#e8e0c8'); }
  /* stillness meter */
  ctx.textAlign='left'; ctx.font='bold 10px monospace'; ctx.fillStyle='#e8e0d0';
  ctx.fillText('STILLNESS',24,52);
  R(24,58,120,8,'rgba(255,255,255,.15)'); R(24,58,120*(T.still/3),8,'#8fd07a');
  ctx.fillStyle='#f2c14e'; ctx.fillText('TARGETS  '+T.hits+' / '+T.need,24,84);
  ctx.textAlign='center'; ctx.fillStyle='rgba(232,224,208,.8)'; ctx.font='10px monospace';
  ctx.fillText('Stand still to steady the aim · A to loose · Esc to stop',W/2,H-14);
  if(T.msgT>0){ ctx.fillStyle='#f2c14e'; ctx.font='bold 12px monospace';
    ctx.fillText(T.msg,W/2,120); }
}

