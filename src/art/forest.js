/* ============================================================
   RAMA V1 · art/forest.js — FOREST OF TATĀKĀ
   4 parallax layers pre-rendered to offscreen canvases at boot
   (audit lesson: never repaint static art per frame).
   Depths: far 0.12 · mid 0.35 · ground 1.0 · foreground 1.45
   Dynamic overlays: swaying god rays, drifting fireflies,
   dust motes — the reference board's "HD-2D lighting" read.
============================================================ */
import { PAL } from './palette.js';
import { CONFIG } from '../core/config.js';

const W = CONFIG.WIDTH, H = CONFIG.HEIGHT, GROUND = 300;

function layer(w, h, paint){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const R = (x,y,ww,hh,col)=>{ g.fillStyle=col; g.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh)); };
  const disc=(x,y,r,col)=>{ g.fillStyle=col; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); };
  paint(g,R,disc); return c;
}
/* deterministic pseudo-random (stable art every boot) */
function rng(seed){ let a=seed>>>0; return()=>{a=(a*1664525+1013904223)>>>0; return a/4294967296;}; }

export function buildForest(){
  const L = {};
  /* — FAR: depth haze, temple, distant canopy — */
  L.far = layer(1280, H, (g,R,disc)=>{
    const gr=g.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,PAL.skyTop); gr.addColorStop(1,PAL.skyBot);
    g.fillStyle=gr; g.fillRect(0,0,1280,H);
    const r=rng(11);
    for(let i=0;i<46;i++){ const x=r()*1280, y=40+r()*180;
      disc(x,y,18+r()*30,PAL.farLeaf); }
    /* ruined temple silhouette (reference panel 1) */
    R(760,150,120,150,PAL.temple); R(790,110,60,44,PAL.temple);
    R(806,88,28,26,PAL.temple); R(814,80,12,10,PAL.templeHi);
    R(760,150,120,4,PAL.templeHi); R(790,110,60,3,PAL.templeHi);
    for(let i=0;i<4;i++)R(772+i*28,210,10,90,'#161208');
    /* giant mossy stone head, half-buried (board detail) */
    R(180,220,64,80,PAL.temple); R(192,236,40,10,PAL.templeHi);
    R(196,258,12,8,'#161208'); R(220,258,12,8,'#161208');
    R(180,220,64,6,PAL.moss);
  });
  /* — MID: great trunks + dense leaf clusters + vines — */
  L.mid = layer(1600, H, (g,R,disc)=>{
    const r=rng(23);
    for(let i=0;i<9;i++){
      const x=60+i*175+r()*40, w=26+r()*18;
      R(x,60,w,GROUND-60,PAL.trunk); R(x,60,5,GROUND-60,PAL.trunkHi);
      R(x-14,GROUND-24,w+28,24,PAL.trunk);                     /* root flare */
      for(let v=0;v<3;v++){ const vx=x+r()*w;                  /* vines */
        R(vx,60,2,60+r()*90,PAL.leafD); }
      for(let b=0;b<7;b++){                                    /* canopy blobs */
        const bx=x-40+r()*(w+80), by=30+r()*90;
        disc(bx,by,24+r()*22,[PAL.leafD,PAL.leafM,PAL.leafL][b%3]);
      }
      disc(x+w/2, 46, 20, PAL.leafLit);                        /* lit crown */
      R(x-30+r()*60, 120+r()*40, 8, 3, PAL.leafGold);          /* gold-lit sprigs */
    }
  });
  /* — GROUND: stone path, moss lip, ferns — */
  L.ground = layer(320, H-GROUND+40, (g,R)=>{
    R(0,40,320,H-GROUND,PAL.stone);
    R(0,40,320,6,PAL.moss); R(0,40,320,2,PAL.mossHi);
    const r=rng(37);
    for(let i=0;i<10;i++)R(r()*320,52+r()*30,10+r()*14,3,'#20201a');
    for(let i=0;i<6;i++){ const x=r()*320;                     /* ferns above lip */
      R(x,26,2,16,PAL.fern); R(x-5,28,5,2,PAL.fernHi); R(x+2,24,6,2,PAL.fernHi);
      R(x-3,33,4,2,PAL.fern); R(x+2,31,5,2,PAL.fern); }
  });
  /* — FOREGROUND: passing leaf silhouettes (fastest layer) — */
  L.fg = layer(960, H, (g,R,disc)=>{
    const r=rng(53);
    for(let i=0;i<7;i++){ const x=r()*960;
      disc(x, r()<0.5? 20+r()*40 : H-30-r()*30, 34+r()*30, PAL.fgLeaf); }
  });
  /* fireflies state */
  L.flies=[]; const r=rng(77);
  for(let i=0;i<12;i++)L.flies.push({x:r()*W, y:120+r()*150, p:r()*6.3, s:.4+r()*.8});
  return L;
}

function tile(ctx, img, offX, y){
  const w=img.width;
  let x = -(offX % w); if(x>0) x-=w;
  for(; x<W; x+=w) ctx.drawImage(img, Math.round(x), y);
}

export function drawForest(ctx, L, camX, t, opts={}){
  tile(ctx, L.far,    camX*0.12, 0);
  /* god rays — additive, gently swaying (reference lighting) */
  ctx.save(); ctx.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){
    const sway=Math.sin(t*0.4+i*2.1)*18;
    const rx=(140+i*210 - camX*0.12)%(W+240)-60+sway;
    const grd=ctx.createLinearGradient(rx,0,rx+90,GROUND);
    grd.addColorStop(0,'rgba(232,200,106,0.16)');
    grd.addColorStop(1,'rgba(232,200,106,0)');
    ctx.fillStyle=grd;
    ctx.beginPath();
    ctx.moveTo(rx,0); ctx.lineTo(rx+46,0);
    ctx.lineTo(rx+120,GROUND); ctx.lineTo(rx+40,GROUND);
    ctx.closePath(); ctx.fill();
    /* dust motes inside the beam */
    for(let m=0;m<4;m++){
      const my=(t*14+m*77+i*130)%GROUND;
      ctx.fillStyle='rgba(240,220,150,'+(0.22*Math.sin(my/GROUND*3.14))+')';
      ctx.fillRect(rx+30+((m*37+i*19)%70)+my*0.24, my, 2, 2);
    }
  }
  ctx.restore();
  tile(ctx, L.mid,    camX*0.35, 0);
  if(!opts.skipGround) tile(ctx, L.ground, camX*1.0, GROUND-40);
  /* fireflies between ground and foreground */
  for(const f of L.flies){
    const fx=((f.x - camX*0.9)%(W+40)+(W+40))%(W+40)-20;
    const fy=f.y+Math.sin(t*f.s+f.p)*14;
    const tw=0.4+0.6*Math.max(0,Math.sin(t*2.2+f.p*3));
    ctx.fillStyle='rgba(248,232,160,'+(tw*0.9)+')';
    ctx.fillRect(fx,fy,2,2);
    ctx.fillStyle='rgba(248,232,160,'+(tw*0.25)+')';
    ctx.fillRect(fx-1,fy-1,4,4);
  }
  tile(ctx, L.fg,     camX*1.45, 0);
  /* bottom vignette for depth */
  const vg=ctx.createLinearGradient(0,H-70,0,H);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=vg; ctx.fillRect(0,H-70,W,70);
}
export { GROUND };
