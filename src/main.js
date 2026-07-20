/* ============================================================
   RAMA V1 · main.js — Module 1 smoke demo
   A bouncing orb proves: fixed timestep, interpolation alpha,
   game-clock timers, pause/resume, tab-hide freeze, F3 HUD.
   This file will be replaced by the Scene Manager boot in M3.
============================================================ */
import { Engine } from './core/engine.js';
import { CONFIG } from './core/config.js';
import { bus } from './core/events.js';

const cv = document.getElementById('game');
cv.width = CONFIG.WIDTH; cv.height = CONFIG.HEIGHT;
const engine = new Engine(cv);

/* demo state: previous+current positions for interpolation */
const orb = { x: 80, y: 180, px: 80, py: 180, vx: 190, vy: 140, r: 10 };
let pulse = 0;

engine.clock.after(2, () => { pulse = 1; });                 // game-clock proof
engine.clock.after(4, () => { engine.clock.after(1, () => pulse = 2); }); // nesting proof

engine.setUpdate((dt) => {
  orb.px = orb.x; orb.py = orb.y;
  orb.x += orb.vx * dt; orb.y += orb.vy * dt;
  if(orb.x < orb.r || orb.x > CONFIG.WIDTH - orb.r)  orb.vx *= -1;
  if(orb.y < orb.r || orb.y > CONFIG.HEIGHT - orb.r) orb.vy *= -1;
});

engine.setRender((ctx, alpha) => {
  ctx.fillStyle = '#0b0714';
  ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
  /* interpolated draw position — the "Nintendo smoothness" primitive */
  const ix = orb.px + (orb.x - orb.px) * alpha;
  const iy = orb.py + (orb.y - orb.py) * alpha;
  ctx.fillStyle = ['#f2c14e', '#8fd07a', '#e05555'][pulse];
  ctx.beginPath(); ctx.arc(ix, iy, orb.r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(232,224,208,.8)'; ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RAMA V1 · CORE ENGINE ONLINE', CONFIG.WIDTH / 2, 24);
  ctx.fillText(`clock ${engine.clock.t.toFixed(1)}s · P pause · F3 debug`, CONFIG.WIDTH / 2, 344);
  if(engine.paused){
    ctx.fillStyle = 'rgba(8,5,14,.7)'; ctx.fillRect(0,0,CONFIG.WIDTH,CONFIG.HEIGHT);
    ctx.fillStyle = '#f2c14e'; ctx.font = 'bold 18px monospace';
    ctx.fillText('PAUSED', CONFIG.WIDTH / 2, 180);
  }
});

/* temporary demo key (real Input System arrives in Module 4) */
addEventListener('keydown', e => {
  if(e.code === 'KeyP') engine.paused ? engine.resume() : engine.pause('user');
});
bus.on('engine:pause',  ({reason}) => console.log('[engine] paused:', reason));
bus.on('engine:resume', () => console.log('[engine] resumed'));

engine.start();
window.__V1 = { engine, orb, CONFIG };   // test hook (stripped in Polish, M18)
