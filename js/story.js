/* ============================================================
   RAMA — The Retro Game · story.js — exile sequence & chapter ending
   Classic script; shares global scope. Load order matters.
============================================================ */
function startExileScene(){
  SAVE.flags.exiled=1; persist();
  startCutscene([
    ['Royal Messenger','Prince... the King is broken with grief. Queen Kaikeyi has claimed her two boons of old.'],
    ['Royal Messenger','Bharata shall be crowned. And you... you are asked to dwell in the forest. Fourteen years.'],
    ['Rama','Then my father\'s word shall not be broken by his son. Tell the King his Rama goes gladly.'],
    ['Rama','Sita walks with me. Lakshmana will not stay. We leave before the sun climbs.']
  ], beginExileWalk);
}
function beginExileWalk(){
  grantEntry('exile_dharma');
  enterRoom('market_street',60);
  G.mode='exile'; G.exT=0;
  G.followers=[{c:'#e0a030',off:30,female:true},{c:'#3a8a4a',off:58}];
  /* citizens line the street */
  NPCS=[];
  const lines=['Come back to us, Prince!','May the forest be kind...','Ayodhya will keep your lamp lit.',
    'Fourteen winters... we will count them.','Jai Shri Rama!','The city weeps today.'];
  for(let i=0;i<8;i++){
    NPCS.push({id:'cit'+i,x:180+i*120,y:GROUND,dir:-1,c:['#c05a3a','#7a5ab0','#5a7a5a','#b08a5a'][i%4],
      wx:180+i*120, farewell:lines[i%lines.length], wave:Math.random()*6});
  }
  Audio2.play('dusk');
  G.objective='Walk east. Do not look back.';
}
function updateExile(dt){
  G.exT+=dt;
  P.dir=1; P.x+=52*dt; P.walkT=G.t*9;
  const r=G.room;
  const target=Math.max(0,Math.min(P.x-W/2,r.w-W));
  G.camX+=(target-G.camX)*Math.min(1,dt*8);
  if(P.x>r.w-70) endChapter();
}
function endChapter(){
  if(!SAVE.flags.ch1done){ SAVE.flags.ch1done=1; SAVE.chapter=2; persist();
    if(Cloud.user)Cloud.submitScore(Cloud.user.uid,Cloud.user.displayName,
      Cloud.user.photoURL,SAVE.dharma);
  }
  G.lb=null;
  if(!Cloud.offline)Cloud.top(5).then(r=>{G.lb=r;});
  G.mode='ending'; Audio2.stop();
  Audio2.tone(293,.8,'triangle',.07); setTimeout(()=>Audio2.tone(440,1.2,'triangle',.06),300);
}
function updateEnding(){
  if(tap('KeyA')||POINTER.tapped){
    if(SAVE.flags.ch2done)postCh2(); else startChapter2();
  }
}
/* ---------------- Chapter 2 · the forest & the Ganga ---------------- */
function startChapter2(){
  SAVE.chapter=2; SAVE.flags.ch2started=1; persist();
  G.followers=[{c:'#e0a030',off:30,female:true},{c:'#3a8a4a',off:58}];
  enterRoom('forest_path', ROOMS.forest_path.spawn);
  G.mode='play';
  G.objective='Walk the forest road — find the Ganga (east)';
  Audio2.play('forest');
}
function startCrossing(){
  SAVE.flags.boarded=1; persist();
  G.boat={x:120, done:false, glideV:0, lines:[
    'Guha: "Lean into her current — she carries friends gently."',
    'Sita: "Carry us home again, Mother, when the years are done."',
    'Lakshmana: "Fourteen years... I will count them on my bowstring."'],
    lineIx:0, lineT:3.4};
  G.mode='boat';
  Audio2.play('dusk');
  toast('A · row');
}
function updateBoat(dt){
  const b=G.boat;
  b.glideV=Math.max(0,b.glideV-28*dt);
  if(tap('KeyA')||POINTER.tapped){
    b.glideV=64; Audio2.noise(.12,.05,900); Audio2.tone(140,.18,'sine',.05,-30);
  }
  b.x+=(12+b.glideV)*dt;
  b.lineT-=dt;
  if(b.lineT<=0&&b.lineIx<b.lines.length-1){ b.lineIx++; b.lineT=3.4; }
  if(b.x>=520&&!b.done){
    b.done=true;
    startCutscene([
      ['Guha, King of the Nishadas','The far shore, brother. My kingdom ends where your legend begins.'],
      ['Rama','No kingdom ends between friends, Guha. When fourteen years are spent, this river will hear my thanks again.']
    ],()=>{ grantEntry('ganga_cross');
      SAVE.flags.crossed=1; persist();
      G.followers=[{c:'#e0a030',off:30,female:true},{c:'#3a8a4a',off:58}];
      enterRoom('panchavati', ROOMS.panchavati.spawn);
      G.mode='play';
      G.objective='Rest at the parnashala — the Golden Deer awaits (next update)';
      Audio2.play('forest');
    });
  }
}
function drawBoat(){
  const th=THEMES.ganga;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,th.skyA); g.addColorStop(.7,th.skyB);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=th.sun; ctx.beginPath(); ctx.arc(W-120,70,26,0,7); ctx.fill();
  /* far shore approaches as boat progresses */
  const prog=Math.min(1,G.boat.x/520);
  ctx.fillStyle=th.far;
  R(W-60-prog*140,164,260,40,th.far);
  ctx.fillStyle='#1e4426';
  ctx.beginPath();ctx.arc(W-30-prog*140,168,26,0,7);ctx.arc(W+20-prog*140,172,30,0,7);ctx.fill();
  /* water */
  ctx.fillStyle='#2a4a7a'; R(0,200,W,H-200,'#2a4a7a');
  for(let i=0;i<22;i++){ const wx=(i*47+G.t*22)%(W+40)-20;
    R(wx,214+(i%6)*22+Math.sin(G.t*1.6+i)*2,34,2,'rgba(220,240,255,.2)'); }
  /* boat */
  const bx=110+prog*260, by=252+Math.sin(G.t*1.7)*3;
  ctx.fillStyle='#6a4426';
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+150,by);ctx.lineTo(bx+128,by+26);ctx.lineTo(bx+20,by+26);ctx.closePath();ctx.fill();
  R(bx+14,by-6,124,7,'#8a5c34');
  /* oar sweep */
  const oa=Math.sin(G.t*3+(G.boat.glideV>10?2.4:0))* .5;
  ctx.strokeStyle='#8a5c34'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(bx+128,by-2); ctx.lineTo(bx+128+Math.cos(1.1+oa)*34, by-2+Math.sin(1.1+oa)*34); ctx.stroke();
  /* passengers: Guha rowing, Rama, Sita, Lakshmana */
  drawHuman(bx+126,by-2,1,'#7a4a2a','#b07848',G.t*6,{});
  drawHuman(bx+52,by-4,1,'#3a58c8','#c89060',0,{crown:true,bow:true});
  drawHuman(bx+80,by-4,1,'#e0a030','#c89060',0,{hair:'#100a06'});
  drawHuman(bx+30,by-4,1,'#3a8a4a','#c89060',0,{});
  /* floating line */
  const b=G.boat;
  ctx.textAlign='center'; ctx.font='10px monospace';
  ctx.fillStyle='rgba(242,236,216,'+(0.55+0.45*Math.sin(G.t*2))+')';
  ctx.fillText(b.lines[b.lineIx],W/2,120);
  ctx.fillStyle='#f2c14e'; ctx.font='bold 10px monospace';
  if(Math.sin(G.t*5)>-.2)ctx.fillText('A · row across the Ganga',W/2,H-26);
}
function drawEnding(){
  ctx.fillStyle='rgba(8,5,14,.94)'; ctx.fillRect(0,0,W,H);
  miniFrame(90,30,W-180,H-60);
  ctx.textAlign='center';
  const ec=G.endCard||{title:'THUS BEGINS THE EXILE',
    sub1:'Fourteen years. One promise. Three walked out of the city',
    sub2:'— and the city\'s heart walked with them.', foot:'CHAPTER 1 COMPLETE'};
  ctx.fillStyle='#f2c14e'; ctx.font='bold 18px monospace';
  ctx.fillText(ec.title,W/2,66);
  ctx.fillStyle='#e8e0d0'; ctx.font='10px monospace';
  ctx.fillText(ec.sub1,W/2,92);
  ctx.fillText(ec.sub2,W/2,106);
  ctx.fillStyle='#f2c14e'; ctx.font='bold 14px monospace';
  ctx.fillText(ec.foot,W/2,138);
  ctx.fillStyle='#8fd07a'; ctx.font='bold 12px monospace';
  ctx.fillText('DHARMA  '+SAVE.dharma,W/2,160);
  if(G.lb&&G.lb.length){
    ctx.fillStyle='#f2c14e'; ctx.font='bold 10px monospace';
    ctx.fillText('— PILGRIMS OF THE WORLD —',W/2,186);
    G.lb.forEach((e,i)=>{ ctx.fillStyle=i===0?'#f2c14e':'#e8e0d0'; ctx.font='10px monospace';
      ctx.fillText((i+1)+'.  '+(e.name||'Pilgrim')+'  ·  '+e.score,W/2,202+i*14); });
  } else if(Cloud.offline){
    ctx.fillStyle='#8f86a8'; ctx.font='9px monospace';
    ctx.fillText('(connect Firebase to join the world leaderboard)',W/2,190);
  }
  ctx.fillStyle='#f2c14e'; ctx.font='bold 11px monospace';
  if(Math.sin(G.t*4)>-.3)ctx.fillText('A · return to Ayodhya',W/2,H-48);
}
