/* ============================================================
   RAMA — The Retro Game · story2.js — Chapter 2B
   The Golden Deer · The Abduction · Jatayu's Stand
   Classic script; shares global scope. Load order matters.
============================================================ */

/* ---------------- The Golden Deer ---------------- */
function startDeerScene(){
  startCutscene([
    ['Sita','Rama — look! There, by the shrine... a deer of GOLD. Have the gods sent us a wonder?'],
    ['Lakshmana','No deer wears gold, brother. This forest lies. I feel a rakshasa\'s breath in this.'],
    ['Rama','Then I will bring the truth back on an arrow. Lakshmana — whatever you hear, whatever cries out — guard her with your life.'],
  ],()=>{
    G.followers=null;
    G.chase={dx:260,vx:0,pauseT:0,burstT:0,cornered:false};
    enterRoom('deer_woods',80);
    G.mode='play';
    G.objective='Catch the golden deer!';
  });
}
function updateChase(dt){
  const c=G.chase, r=G.room; if(!c)return;
  const dist=c.dx-P.x;
  if(c.cornered){ 
    if(Math.abs(P.x-c.dx)<150) startDeerAim();
    return;
  }
  if(c.pauseT>0){ c.pauseT-=dt; c.vx=0; }
  else if(c.burstT>0){ c.burstT-=dt; c.vx=265; }
  else if(dist<120){ c.burstT=.7; }
  else if(dist>300 && Math.random()<dt*.8){ c.pauseT=.55; }
  else c.vx=150;
  c.dx+=c.vx*dt;
  if(c.dx>=r.w-170){ c.dx=r.w-170; c.cornered=true; toast('The deer is cornered — approach and be still'); }
}
function drawDeer(x,y,cornered,t){
  const bob=Math.sin(t*7)*(cornered?1:3);
  R(x-2,y-4,26,3,'rgba(0,0,0,.25)');
  R(x,y-22+bob,24,12,'#e8b83a');            /* body */
  R(x+20,y-30+bob,9,10,'#e8b83a');          /* head */
  R(x+22,y-38+bob,2,9,'#c89020'); R(x+27,y-38+bob,2,9,'#c89020');  /* antlers */
  R(x+21,y-40+bob,6,2,'#c89020');
  R(x+26,y-27+bob,2,2,'#241a10');           /* eye */
  R(x+2,y-10+bob,3,10,'#c89020'); R(x+9,y-10+bob,3,10,'#c89020');
  R(x+16,y-10+bob,3,10,'#c89020');          /* legs */
  R(x-3,y-20+bob,4,5,'#f2d878');            /* tail */
  /* sparkle */
  for(let i=0;i<3;i++){
    const sx=x+6+((t*40+i*37)%36), sy=y-34+((t*26+i*23)%20);
    if(Math.sin(t*8+i*2)>0.3)R(sx,sy,2,2,'#fff2b0');
  }
}
/* ---------------- Deer aim (the Bow of Stillness, remembered) ---------------- */
function startDeerAim(){
  G.daim={still:0,t:0}; G.mode='deeraim';
  toast('Be still... as the Guru taught');
}
function updateDeerAim(dt){
  const a=G.daim; a.t+=dt;
  const moving=held('ArrowLeft')||held('ArrowRight');
  a.still=moving?0:Math.min(3,a.still+dt);
  if(tap('Escape')||tap('KeyS')){ G.mode='play'; return; }
  if(tap('KeyA')||POINTER.tapped){
    const amp=60-(a.still/3)*48;
    const off=Math.sin(a.t*2.6)*amp;
    if(Math.abs(off)<14){
      Audio2.tone(880,.12,'square',.07,300); Audio2.tone(520,.4,'triangle',.06,-80);
      G.chase=null;
      startCutscene([
        ['—','The arrow flies true. The golden hide ripples... and TEARS — the deer\'s shape boils away like mist.'],
        ['Maricha','Rrraaa... the mortal shoots well... Ravana\'s bait is spent...'],
        ['Maricha (in Rama\'s stolen voice)','"HAAA SITA! HAAA LAKSHMANA! HELP ME!"'],
        ['Rama','...That was MY voice. Thrown across the forest. — SITA.'],
      ],()=>{
        grantEntry('golden_maya');
        G.postDeer=true; G.mode='play';
        G.objective='RUN. Back to Panchavati — WEST!';
        Audio2.play('dusk');
      });
    }else{
      Audio2.tone(180,.15,'sawtooth',.05,-60);
      toast('The gold flickers — almost illusion... it BOLTS!');
      G.chase.cornered=false; G.chase.dx=Math.max(120,P.x-240); G.chase.burstT=.9;
      G.mode='play';
    }
  }
}
function drawDeerAimOverlay(){
  const a=G.daim;
  const amp=60-(a.still/3)*48;
  const off=Math.sin(a.t*2.6)*amp;
  ctx.fillStyle='rgba(8,5,14,.35)'; ctx.fillRect(0,0,W,H);
  miniFrame(W/2-150,64,300,84);
  ctx.textAlign='center'; ctx.fillStyle='#f2c14e'; ctx.font='bold 11px monospace';
  ctx.fillText('STILL THE MIND',W/2,88);
  R(W/2-120,100,240,8,'#241430');
  R(W/2-14,100,28,8,'rgba(242,193,78,.5)');
  R(W/2-2+off,95,4,18,'#f8f0e0');
  ctx.fillStyle='#8fd07a'; ctx.font='9px monospace';
  ctx.fillText('stillness '+Math.round(a.still/3*100)+'%   ·   A loose   ·   S lower bow',W/2,138);
}
/* ---------------- The empty hut ---------------- */
function checkAbduction(){
  if(G.postDeer&&G.roomId==='panchavati'&&!G.abductionPlayed){
    G.abductionPlayed=true;
    startCutscene([
      ['—','The parnashala stands open. The cook-fire still breathes. A single garland lies broken on the threshold.'],
      ['Rama','Sita? ...SITA!'],
      ['Lakshmana','Brother— forgive me— she heard your voice cry for help— she commanded me— she SWORE at me to go—'],
      ['—','High above the treeline: a scream, thin as a kite-string, trailing SOUTH. And a shadow with ten crowns dragging the sky behind it.'],
      ['Rama','...Then something in the sky is already fighting for her. LOOK—'],
    ], startJatayu);
  }
}
/* ---------------- Jatayu's Stand (playable · unwinnable · unforgettable) ---------------- */
function startJatayu(){
  G.jat={y:170,vy:0,cd:0,swoop:0,swoopHit:false,inv:0,hits:0,bolts:[],t:0,boltT:1.4,finalT:0,final:false};
  G.jatBG=true;
  G.mode='jatayu';
  G.objective='JATAYU — strike the chariot! (▲ climb · A talon-strike)';
  Audio2.play('dusk');
  toast('You are JATAYU, king of eagles');
}
function updateJatayu(dt){
  const j=G.jat; j.t+=dt;
  if(j.final){ j.finalT+=dt; return; }
  /* flight */
  if(held('ArrowUp')||held('Space'))j.vy-=760*dt;
  j.vy+=420*dt; j.vy=Math.max(-250,Math.min(250,j.vy));
  j.y+=j.vy*dt;
  if(j.y<64){j.y=64;j.vy=0;} if(j.y>302){j.y=302;j.vy=0;}
  if(j.inv>0)j.inv-=dt;
  if(j.cd>0)j.cd-=dt;
  /* swoop strike */
  if((tap('KeyA')||POINTER.tapped)&&j.cd<=0){ j.swoop=.34; j.cd=1.05; j.swoopHit=false;
    Audio2.noise(.1,.05,1400); }
  const chY=150+Math.sin(j.t*.7)*40;
  if(j.swoop>0){
    j.swoop-=dt;
    if(!j.swoopHit&&Math.abs(j.y-chY)<46){
      j.swoopHit=true; j.hits++;
      Audio2.tone(220,.2,'sawtooth',.09,-80); Audio2.tone(980,.1,'square',.06);
      toast(['Wood splinters from the chariot!','A wheel-guard tears away!','The pushpaka LURCHES — Sita\'s voice: "JATAYU!"'][Math.min(2,j.hits-1)]);
      if(j.hits>=3){
        j.final=true;
        setTimeout(()=>{
          startCutscene([
            ['Ravana','Enough. Old bird — you fought gods in your youth. You should have remembered how that ended.'],
            ['—','The blade of Chandrahasa flashes once. A wing folds the wrong way. The sky lets go of its king.'],
            ['Jatayu','(falling) ...I could not stop him... but I could SLOW him... every wound I gave... buys the ground a footprint...'],
            ['—','Below, two brothers run beneath the falling star of feathers. They reach him as the light goes long.'],
            ['Jatayu','Rama... south... he flew SOUTH... Ravana... king of LANKA... find her... I kept my eyes open... as long as... I...'],
            ['Rama','Rest, noblest of wings. You did not fail her. You are the first of her army.'],
          ], endChapter2);
        }, 900);
      }
    }
  }
  /* Ravana's bolts */
  j.boltT-=dt;
  if(j.boltT<=0){ j.boltT=2.0; j.bolts.push({x:452,y:chY+6,vx:-262}); }
  for(const bl of j.bolts){ bl.x+=bl.vx*dt; }
  j.bolts=j.bolts.filter(bl=>bl.x>-30);
  if(j.inv<=0)for(const bl of j.bolts){
    if(bl.x<176&&bl.x>112&&Math.abs(bl.y-j.y)<28){
      j.inv=1.1; j.vy=200; Audio2.tone(140,.25,'sawtooth',.08,-50);
      toast('Dark fire sears a wing — climb!'); break;
    }
  }
}
function drawJatayu(){
  const j=G.jat;
  /* burning sunset sky */
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#2a1030'); g.addColorStop(.5,'#a03a2a'); g.addColorStop(1,'#e8862a');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#f8d8a0'; ctx.beginPath(); ctx.arc(W-140,240,34,0,7); ctx.fill();
  /* streaking clouds (speed illusion) */
  for(let i=0;i<9;i++){
    const cx=W-((j.t*180+i*130)%(W+180))+40;
    R(cx,50+(i*37)%230,90,5,'rgba(255,230,200,.16)');
    R(cx+20,56+(i*37)%230,50,4,'rgba(255,230,200,.10)');
  }
  /* far treeline scrolling below */
  for(let i=0;i<14;i++){
    const tx=W-((j.t*120+i*70)%(W+90))+20;
    ctx.fillStyle='#3a1c18';ctx.beginPath();ctx.arc(tx,336,26,0,7);ctx.fill();
  }
  const chY=150+Math.sin(j.t*.7)*40, flin=j.swoopHit&&j.swoop>0?6:0;
  /* Pushpaka chariot */
  const cx2=440+flin;
  R(cx2-30,chY+14,120,14,'#c89020');
  R(cx2-22,chY+28,104,6,'#8a5c14');
  R(cx2-38,chY+18,12,8,'#e8b83a'); R(cx2+86,chY+18,14,8,'#e8b83a');
  R(cx2-10,chY-18,80,32,'#e8b83a');
  R(cx2-16,chY-26,92,10,'#f2c878');
  /* Ravana silhouette + crowns */
  R(cx2+34,chY-14,16,26,'#38102a');
  for(let i=0;i<5;i++)R(cx2+30+i*5,chY-20,3,7,'#f2c14e');
  /* Sita — small gold figure reaching back */
  R(cx2+2,chY-10,9,20,'#e0a030'); R(cx2+3,chY-16,7,7,'#c89060');
  R(cx2-4,chY-8,7,3,'#c89060');
  /* bolts */
  for(const bl of j.bolts){
    ctx.fillStyle='#4a1060';ctx.beginPath();ctx.arc(bl.x,bl.y,7,0,7);ctx.fill();
    ctx.fillStyle='#a040d0';ctx.beginPath();ctx.arc(bl.x,bl.y,4,0,7);ctx.fill();
  }
  /* JATAYU */
  const jx=140+(j.swoop>0?60*(1-j.swoop/.34):0);
  const jy=j.final?Math.min(320,j.y+j.finalT*90):j.y;
  const flap=Math.sin(j.t*(j.final?4:14))*14;
  const blink=j.inv>0&&Math.sin(j.t*24)>0;
  if(!blink){
    ctx.fillStyle='#6a3c1a';
    ctx.beginPath();ctx.moveTo(jx-34,jy-flap);ctx.lineTo(jx+6,jy-6);ctx.lineTo(jx-10,jy+8);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(jx-30,jy+flap+8);ctx.lineTo(jx+8,jy+2);ctx.lineTo(jx-8,jy+12);ctx.closePath();ctx.fill();
    R(jx-8,jy-8,36,18,'#8a5426');
    R(jx+24,jy-12,14,12,'#8a5426');
    R(jx+36,jy-8,8,5,'#f2c14e');
    R(jx+30,jy-9,3,3,'#241a10');
    R(jx-6,jy+8,8,6,'#f2c14e'); R(jx+8,jy+9,8,6,'#f2c14e');
    if(j.final)for(let i=0;i<4;i++)
      R(jx-20+i*12,jy-26-((j.finalT*60+i*17)%50),4,6,'rgba(138,84,38,.7)');
  }
  /* HUD */
  ctx.textAlign='left'; ctx.font='bold 10px monospace';
  ctx.fillStyle='rgba(10,6,18,.55)'; ctx.fillRect(0,0,W,24);
  ctx.fillStyle='#f2c14e'; ctx.fillText('JATAYU\'S STAND',8,15);
  for(let i=0;i<3;i++)
    R(200+i*20,7,14,10, i<j.hits?'#f2c14e':'rgba(255,255,255,.18)');
  ctx.textAlign='right'; ctx.fillStyle='#e8e0d0';
  ctx.fillText('▲ climb · A talon-strike',W-8,15);
  if(!j.final){
    ctx.textAlign='center'; ctx.fillStyle='rgba(242,236,216,.75)'; ctx.font='9px monospace';
    ctx.fillText('Strike the chariot when your height matches it. Dodge the dark fire.',W/2,H-10);
  }
}
/* ---------------- Chapter 2 end ---------------- */
function endChapter2(){
  if(!SAVE.flags.ch2done){
    SAVE.flags.ch2done=1; SAVE.chapter=3;
    SAVE.dharma += 15 + (G.jat?G.jat.hits*10:0);
    persist();
    if(Cloud.user)Cloud.submitScore(Cloud.user.uid,Cloud.user.displayName,Cloud.user.photoURL,SAVE.dharma);
  }
  grantEntry('jatayu_gift');
  G.jatBG=false; G.postDeer=false;
  G.lb=null;
  if(!Cloud.offline)Cloud.top(5).then(r=>{G.lb=r;});
  G.endCard={title:'THE SKY REMEMBERS', sub1:'He could not stop the chariot. He never believed he could.',
    sub2:'He fought so the ground would know which way to run.', foot:'CHAPTER 2 COMPLETE'};
  G.mode='ending'; Audio2.stop();
  Audio2.tone(246,.9,'triangle',.07); setTimeout(()=>Audio2.tone(329,1.3,'triangle',.06),350);
}
function postCh2(){
  G.followers=[{c:'#3a8a4a',off:34}];   /* Lakshmana alone — Sita is gone */
  enterRoom('panchavati', ROOMS.panchavati.spawn);
  G.mode='play';
  G.objective='Chapter 3 — the road south to Kishkindha (coming soon)';
  Audio2.play('forest');
}
