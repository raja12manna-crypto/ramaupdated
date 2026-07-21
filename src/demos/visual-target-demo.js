/* ============================================================
   RAMA V1 · main.js — VISUAL TARGET DEMO (Module 1.5)
   Sequence on the game clock: idle 3s → bow-draw 1.8s (flare)
   → run with parallax scroll.  Proves: art direction, frame
   pre-rendering, parallax pipeline, interpolated camera.
   Replaced by Scene Manager boot in Module 3.
============================================================ */
import { Engine }   from './core/engine.js';
import { CONFIG }   from './core/config.js';
import { buildRamaFrames, drawRama } from './art/rama.js';
import { buildForest, drawForest, GROUND } from './art/forest.js';

const cv = document.getElementById('game');
cv.width = CONFIG.WIDTH; cv.height = CONFIG.HEIGHT;
const engine = new Engine(cv);

const frames = buildRamaFrames();
const forest = buildForest();

const S = { phase:'idle', animT:0, camX:0, pCamX:0, flare:0 };
engine.clock.after(3.0, () => { S.phase='bow'; S.animT=0; });
engine.clock.after(4.8, () => { S.phase='run'; S.animT=0; });

engine.setUpdate((dt) => {
  S.animT += dt;
  S.pCamX = S.camX;
  if(S.phase==='run') S.camX += 118*dt;
  if(S.phase==='bow') S.flare = Math.min(1, S.flare + dt*1.2);
  else S.flare = Math.max(0, S.flare - dt*2);
});

engine.setRender((ctx, alpha) => {
  const cam = S.pCamX + (S.camX - S.pCamX) * alpha;   // interpolated camera
  drawForest(ctx, forest, cam, engine.clock.t);
  const rx = CONFIG.WIDTH * 0.5, ry = GROUND;
  let pose='idle', fi=0;
  if(S.phase==='idle'){ pose='idle'; fi = Math.floor(S.animT*2)%2; }
  if(S.phase==='bow'){  pose='bow';  fi = Math.min(2, Math.floor(S.animT/0.5)); }
  if(S.phase==='run'){  pose='run';  fi = Math.floor(S.animT*10)%6; }
  /* soft ground shadow */
  ctx.fillStyle='rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(rx, ry+3, 18, 4, 0, 0, 7); ctx.fill();
  drawRama(ctx, frames, pose, fi, rx, ry, 1);
  /* divine flare during full draw */
  if(S.flare>0){
    ctx.save(); ctx.globalCompositeOperation='lighter';
    ctx.fillStyle='rgba(248,200,104,'+(0.28*S.flare)+')';
    ctx.beginPath(); ctx.arc(rx+16, ry-40, 26*S.flare, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle='rgba(232,224,208,.85)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('RAMA V1 · VISUAL TARGET — FOREST OF TATĀKĀ', CONFIG.WIDTH/2, 20);
  ctx.fillText('P pause · F3 debug', CONFIG.WIDTH/2, 348);
  if(engine.paused){
    ctx.fillStyle='rgba(8,5,14,.7)'; ctx.fillRect(0,0,CONFIG.WIDTH,CONFIG.HEIGHT);
    ctx.fillStyle='#f2c14e'; ctx.font='bold 18px monospace';
    ctx.fillText('PAUSED', CONFIG.WIDTH/2, 180);
  }
});

addEventListener('keydown', e => {
  if(e.code==='KeyP') engine.paused ? engine.resume() : engine.pause('user');
});
engine.start();
window.__V1 = { engine, S, CONFIG };
