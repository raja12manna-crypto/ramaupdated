/* ============================================================
   RAMA — The Retro Game · player.js — movement, physics, room simulation
   Classic script; shares global scope. Load order matters.
============================================================ */
/* ---------------- Update ---------------- */
function updatePlay(dt){
  const r=G.room;
  if(G.lockT)G.lockT=Math.max(0,G.lockT-dt);
  /* movement */
  const sp=120;
  let mx=0;
  if(held('ArrowLeft')){mx=-1;P.dir=-1;}
  if(held('ArrowRight')){mx=1;P.dir=1;}
  P.x+=mx*sp*dt;
  if(mx&&P.onG){ P.walkT+=dt*9; if(((P.walkT|0)%2===0)&&Math.random()<.08)Audio2.stepSfx(); }
  /* jump */
  if((tap('ArrowUp')||tap('Space'))&&P.onG){ P.vy=-360; P.onG=false; Audio2.tone(300,.14,'square',.05,240); }
  if(!P.onG){ P.vy+=1100*dt; P.y+=P.vy*dt;
    if(P.y>=GROUND){P.y=GROUND;P.vy=0;P.onG=true;} }
  /* room edges → transitions */
  if(P.x<20){ if(r.exits.left){ enterRoom(r.exits.left.room,r.exits.left.x); return; }
    if(r.lockLeft&&!G.lockT){ toast(r.lockLeft); G.lockT=2.5; } P.x=20; }
  if(P.x>r.w-20){ if(r.exits.right){ enterRoom(r.exits.right.room,r.exits.right.x); return; } P.x=r.w-20; }
  /* golden deer chase */
  if(G.chase&&G.roomId==='deer_woods')updateChase(dt);
  /* the empty hut */
  checkAbduction();
  /* exile summons */
  if(SAVE.flags.trained&&!SAVE.flags.exiled&&G.roomId==='palace_court'&&P.x<520){
    startExileScene(); return;
  }
  /* camera */
  const target=Math.max(0,Math.min(P.x-W/2,r.w-W));
  G.camX+=(target-G.camX)*Math.min(1,dt*8);
  /* NPC wander */
  for(const n of NPCS){
    n.wt-=dt;
    if(n.kid){ n.x+=Math.sin(G.t*2+n.wx)*40*dt; n.dir=Math.sin(G.t*2+n.wx)>0?1:-1; }
    else if(n.wt<=0){ n.wt=2+Math.random()*4;
      const d=(Math.random()*60-30); n.tx=Math.max(n.wx-50,Math.min(n.wx+50,n.x+d)); }
    if(n.tx!==undefined&&Math.abs(n.tx-n.x)>2&&!n.guru){
      n.dir=n.tx>n.x?1:-1; n.x+=n.dir*22*dt; }
  }
  /* birds startle */
  for(const b of BIRDS){
    if(!b.fly&&Math.abs(P.x-b.x)<44){ b.fly=1; b.vx=(b.x<P.x?-1:1)*(60+Math.random()*60);
      b.vy=-120-Math.random()*80; Audio2.chirp(); }
    if(b.fly){ b.x+=b.vx*dt; b.y+=b.vy*dt; b.vy-=40*dt; }
  }
  /* musician proximity: soft veena notes */
  for(const n of NPCS) if(n.music&&Math.abs(P.x-n.x)<130&&Math.random()<dt*1.2)
    Audio2.tone(392*Math.pow(2,Audio2.RAGA[(Math.random()*7)|0]/12),.4,'triangle',.03);
  /* temple bell interact zone handled via nearest interactable */
  /* interact */
  const near=nearestInteract();
  if(tap('KeyA')&&near){ startInteract(near); }
  if(tap('KeyS')){ G.mode='book'; Audio2.uiA(); }
}
