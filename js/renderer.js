/* ============================================================
   RAMA — The Retro Game · renderer.js — canvas, scaling, draw primitives (+asset hooks)
   Classic script; shares global scope. Load order matters.
============================================================ */
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
/* ---------------- Canvas scaling ---------------- */
function fit(){
  const w=innerWidth,h=innerHeight, a=640/360;
  let cw=w, ch=w/a; if(ch>h){ ch=h; cw=h*a; }
  cv.style.width=cw+'px'; cv.style.height=ch+'px';
}
addEventListener('resize',fit); fit();
ctx.imageSmoothingEnabled=false;

/* ---------------- Render helpers ---------------- */
function px(x){ return Math.round(x-G.camX); }
function R(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function drawSky(th){
  if(Assets.drawBG(G.roomId, G.camX, ctx)) return;   /* PNG background if provided */
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,th.skyA); g.addColorStop(.75,th.skyB);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  /* sun */
  ctx.fillStyle=th.sun; ctx.beginPath(); ctx.arc(W-110-G.camX*.05,84,30,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.12)';
  for(let i=0;i<3;i++){ const cx=((i*260+80)-G.camX*.1)%(W+160)-80;
    R(cx,50+i*26,68,8,'rgba(255,240,220,.14)'); R(cx+18,44+i*26,40,8,'rgba(255,240,220,.11)'); }
  /* far skyline */
  ctx.fillStyle=th.far;
  for(let i=0;i<10;i++){ const bx=((i*130)-G.camX*.25)%(G.room.w+200)-100;
    const bh=60+((i*53)%50); R(bx,GROUND-90-bh*.4,70,90+bh*.4,th.far);
    R(bx+22,GROUND-104-bh*.4,26,18,th.far); }
}
function drawGround(th){
  R(0,GROUND,W,H-GROUND,th.ground);
  R(0,GROUND,W,4,th.groundD);
  for(let i=0;i<20;i++){ const gx=(i*53-G.camX)%(W+60)-30;
    R(gx,GROUND+10+(i*17)%40,10,3,th.groundD); }
}
function drawDecor(){
  const th=THEMES[G.room.theme];
  for(const d of G.room.decor){
    const t=d[0],x=px(d[1]);
    if(x<-200||x>W+200)continue;
    if(t==='palace'){ R(x,GROUND-170,d[2]+140,170,'#8a5c34');
      R(x-10,GROUND-186,d[2]+160,20,'#f2c14e');
      for(let i=0;i<5;i++){R(x+16+i*(d[2]+100)/4,GROUND-150,14,40,'#4a2e18');}
      R(x+30,GROUND-230,d[2]+80,50,'#a06a3c'); R(x+60,GROUND-252,d[2]+20,24,'#f2c14e'); }
    if(t==='pillar'){ R(x,GROUND-120,18,120,'#c8a060'); R(x-4,GROUND-130,26,12,'#f2c14e'); }
    if(t==='banner'){ R(x,GROUND-140,4,140,'#6a4a2a');
      R(x+4,GROUND-136,26,34,'#e05555'); R(x+4,GROUND-102,26,6,'#f2c14e'); }
    if(t==='lamp'){ R(x,GROUND-70,6,70,'#4a3a24'); R(x-6,GROUND-84,18,14,'#f2c14e');
      ctx.fillStyle='rgba(242,193,78,.16)';ctx.beginPath();ctx.arc(x+3,GROUND-77,26+Math.sin(G.t*6)*3,0,7);ctx.fill(); }
    if(t==='gate'){ R(x,GROUND-160,90,160,'#8a5c34'); R(x+22,GROUND-120,46,120,'#241430');
      R(x-8,GROUND-176,106,20,'#f2c14e'); }
    if(t==='house'){ R(x,GROUND-110,140,110,d[2]);
      R(x-8,GROUND-126,156,18,'#3a2a1a'); R(x+20,GROUND-80,26,34,'#241430');
      R(x+84,GROUND-88,30,24,'#f8e8c0'); R(x+84,GROUND-88,30,24,'rgba(0,0,0,.15)'); R(x+86,GROUND-86,26,20,'#f8e8c0'); }
    if(t==='awn'){ for(let i=0;i<5;i++)R(x+i*22,GROUND-118,20,10,i%2?d[2]:'#f8f0e0'); }
    if(t==='stall'){ R(x,GROUND-60,90,60,'#7a5230'); R(x-8,GROUND-96,106,12,'#e05555');
      R(x-8,GROUND-84,106,6,'#f2c14e'); R(x+10,GROUND-50,18,10,'#e07a2a');
      R(x+36,GROUND-50,18,10,'#8fd07a'); R(x+62,GROUND-50,18,10,'#f2c14e'); }
    if(t==='temple'){ R(x,GROUND-190,220,190,'#f0e0c0');
      R(x+70,GROUND-260,80,80,'#f0e0c0'); R(x+92,GROUND-292,36,36,'#f2c14e');
      R(x+104,GROUND-306,12,18,'#f2c14e'); R(x+94,GROUND-120,32,120,'#5a3a1a');
      R(x-12,GROUND-196,244,10,'#f2c14e'); }
    if(t==='bellpost'){ R(x,GROUND-110,6,110,'#6a4a2a'); R(x-20,GROUND-112,46,8,'#6a4a2a');
      R(x-4,GROUND-104,14,18,'#f2c14e'); R(x+1,GROUND-86,4,6,'#c89a30'); }
    if(t==='tree'){ R(x,GROUND-90,14,90,'#5a3a22');
      ctx.fillStyle='#3a6a3a';ctx.beginPath();ctx.arc(x+7,GROUND-104,38,0,7);ctx.fill();
      ctx.fillStyle='#4a8a4a';ctx.beginPath();ctx.arc(x-12,GROUND-92,24,0,7);ctx.arc(x+28,GROUND-94,26,0,7);ctx.fill(); }
    if(t==='ghatsteps'){ for(let i=0;i<4;i++)R(x-i*14,GROUND-14*(4-i)+14*i? GROUND-42+i*14 : GROUND-42+i*14,120+i*28,14,'#b0a080'); }
    if(t==='bigtree'){ R(x,GROUND-150,22,150,'#3a2818');
      ctx.fillStyle='#1e4426';ctx.beginPath();ctx.arc(x+11,GROUND-168,54,0,7);ctx.fill();
      ctx.fillStyle='#2a5a34';ctx.beginPath();ctx.arc(x-20,GROUND-150,36,0,7);ctx.arc(x+42,GROUND-152,38,0,7);ctx.fill();
      ctx.fillStyle='#3a7a44';ctx.beginPath();ctx.arc(x+11,GROUND-186,30,0,7);ctx.fill(); }
    if(t==='rock'){ R(x,GROUND-26,44,26,'#5a5a62'); R(x+8,GROUND-38,26,14,'#6a6a72');
      R(x+12,GROUND-30,10,4,'#7a7a82'); }
    if(t==='shrine'){ R(x,GROUND-54,34,54,'#8a6a4a'); R(x-6,GROUND-64,46,12,'#f2c14e');
      R(x+11,GROUND-44,12,18,'#241430'); R(x+13,GROUND-40,8,6,'#f2c14e');
      ctx.fillStyle='rgba(242,193,78,.13)';ctx.beginPath();ctx.arc(x+17,GROUND-38,20+Math.sin(G.t*4)*3,0,7);ctx.fill(); }
    if(t==='hut'){ R(x,GROUND-84,120,84,'#8a6a42');
      ctx.fillStyle='#5a4426';ctx.beginPath();ctx.moveTo(x-16,GROUND-84);ctx.lineTo(x+60,GROUND-128);ctx.lineTo(x+136,GROUND-84);ctx.closePath();ctx.fill();
      R(x+16,GROUND-58,26,58,'#38240f'); R(x+70,GROUND-64,32,26,'#f8e8c0');
      for(let i=0;i<6;i++)R(x-14+i*26,GROUND-88,20,5,'#6a8a4a'); }
    if(t==='boat'){ ctx.fillStyle='#6a4426';
      ctx.beginPath();ctx.moveTo(x,GROUND+18);ctx.lineTo(x+96,GROUND+18);ctx.lineTo(x+82,GROUND+34);ctx.lineTo(x+14,GROUND+34);ctx.closePath();ctx.fill();
      R(x+10,GROUND+14,76,6,'#8a5c34'); R(x+44,GROUND-20,5,38,'#8a5c34'); }
    if(t==='targetpost'){ R(x,GROUND-80,8,80,'#6a4a2a');
      ctx.fillStyle='#f8f0e0';ctx.beginPath();ctx.arc(x+4,GROUND-92,16,0,7);ctx.fill();
      ctx.fillStyle='#e05555';ctx.beginPath();ctx.arc(x+4,GROUND-92,10,0,7);ctx.fill();
      ctx.fillStyle='#f8f0e0';ctx.beginPath();ctx.arc(x+4,GROUND-92,4,0,7);ctx.fill(); }
  }
  /* wide water for ganga rooms */
  if(G.room.water!==undefined){
    ctx.fillStyle='#2a4a7a'; R(0,GROUND+14,W,H-GROUND-14,'#2a4a7a');
    for(let i=0;i<16;i++){ const wx=(i*61-G.camX*.9)%(W+40)-20;
      R(wx,GROUND+22+(i%4)*9+Math.sin(G.t*1.8+i)*2,30,2,'rgba(220,240,255,.22)'); }
  }
  /* river strip on riverside */
  if(G.roomId==='riverside'){
    ctx.fillStyle='#3a6a9a'; R(0,GROUND+26,W,H-GROUND-26,'#3a6a9a');
    for(let i=0;i<14;i++){ const wx=(i*57-G.camX*.9)%(W+40)-20;
      R(wx,GROUND+34+(i%3)*10+Math.sin(G.t*2+i)*2,26,2,'rgba(255,255,255,.25)'); }
  }
}
/* ---------------- Characters (paper-doll v2) ---------------- */
function drawHuman(x,y,dir,c,skin,walkT,opts){
  opts=opts||{};
  const bob=Math.sin(walkT)*1.5, leg=Math.sin(walkT)*4;
  ctx.save(); ctx.translate(Math.round(x),Math.round(y)); ctx.scale(dir,1);
  R(-5,-4,10,3,'rgba(0,0,0,.25)');
  R(-4,-14+bob*0,4,12,skin); R(0,-14,4,12,skin);                    /* legs base */
  R(-4,-14,4,12- Math.max(0,leg),skin); R(0,-14,4,12-Math.max(0,-leg),skin);
  R(-6,-30+bob,12,17,c);                                            /* torso/dhoti */
  R(-6,-19+bob,12,3,'#f2c14e');                                     /* belt */
  R(-8,-29+bob,3,10,skin); R(5,-29+bob,3,10,skin);                  /* arms */
  R(-5,-40+bob,10,11,skin);                                         /* head */
  R(-5,-42+bob,10,4,opts.hair||'#241a10');                          /* hair */
  if(opts.crown)R(-5,-44+bob,10,3,'#f2c14e');
  if(opts.old)R(-5,-31+bob,10,3,'#e8e0d0');
  R(0,-37+bob,2,2,'#241a10');                                       /* eye */
  if(opts.bow){ ctx.strokeStyle='#8a5a2b'; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.arc(-7,-24+bob,9,1.8,4.5); ctx.stroke(); }
  if(opts.veena){ R(6,-26+bob,3,14,'#8a5a2b'); ctx.fillStyle='#b07a3a';
    ctx.beginPath();ctx.arc(7,-12+bob,5,0,7);ctx.fill(); }
  ctx.restore();
}
function drawBird(b){
  const x=px(b.x),y=b.y-6;
  R(x-3,y-3,7,5,'#e8e8f0'); R(x+3,y-2,3,2,'#f2c14e');
  const w=Math.sin(G.t*(b.fly?26:4))*3;
  R(x-4,y-3-w,4,2,'#c8c8d8'); R(x+1,y-3+w,4,2,'#c8c8d8');
}
/* ---------------- HUD, dialogue, book ---------------- */
function miniFrame(x,y,w,h){
  ctx.fillStyle='rgba(10,6,18,.88)'; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#f2c14e'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,w-2,h-2);
  ctx.fillStyle='#f2c14e';
  [[x-1,y-1],[x+w-5,y-1],[x-1,y+h-5],[x+w-5,y+h-5]].forEach(p=>R(p[0],p[1],6,6,'#f2c14e'));
}
