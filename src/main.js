/* ============================================================
   RAMA V1 · main.js — PLAYABLE MOVEMENT DEMO
   Reprioritized milestone: Input + Physics + Camera + Player
   Controller pulled ahead of the module order so there is
   something to actually PLAY. Combat/enemies/Astra Wheel and
   the formal Scene Manager wiring return in later modules —
   this file will be replaced by a proper scene-driven boot
   once Module 3's SceneManager takes over the game's flow.

   Controls: <- -> move . Z / Space jump (+ wall-jump while
   clinging to a wall) . X roll/dash (also passes under low
   obstacles) . P pause . F3 debug HUD

   The previous Visual Target art demo is preserved at
   src/demos/visual-target-demo.js for reference.
============================================================ */
import { Engine }   from './core/engine.js';
import { CONFIG }   from './core/config.js';
import { InputSystem } from './core/input.js';
import { Camera }   from './core/camera.js';
import { buildRamaFrames, drawRama } from './art/rama.js';
import { buildForest, drawForest } from './art/forest.js';
import { LEVEL, GROUND_Y } from './game/forestLevel.js';
import { drawLevel } from './game/levelRender.js';
import { createPlayer, updatePlayer } from './game/player.js';

const cv = document.getElementById('game');
cv.width = CONFIG.WIDTH; cv.height = CONFIG.HEIGHT;
const engine = new Engine(cv);
const input  = new InputSystem();
const camera = new Camera();

const frames = buildRamaFrames();
const forest = buildForest();
const player = createPlayer();

engine.setUpdate((dt) => {
  updatePlayer(player, dt, input);
  camera.follow(player.x, dt, LEVEL.width);
});

engine.setRender((ctx, alpha) => {
  const camX = camera.interpolated(alpha);
  drawForest(ctx, forest, camX, engine.clock.t, { skipGround: true });
  drawLevel(ctx, LEVEL, camX);

  const px = player.x - camX, py = player.y;
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(px, py + 2, 10, 3, 0, 0, 7); ctx.fill();
  drawRama(ctx, frames, player.pose, player.fi, px, py, player.facing,
    player.rolling ? 1 - Math.max(0, player.rollT) / 0.3 : 0);

  ctx.fillStyle = 'rgba(232,224,208,.85)'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('RAMA V1 - FOREST OF TATAKA - PLAYABLE DEMO', CONFIG.WIDTH / 2, 16);
  ctx.font = '9px monospace';
  ctx.fillText('<- -> move . Z/Space jump (+wall-jump) . X roll/dash . P pause . F3 debug', CONFIG.WIDTH / 2, 350);

  if(engine.paused){
    ctx.fillStyle = 'rgba(8,5,14,.7)'; ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    ctx.fillStyle = '#f2c14e'; ctx.font = 'bold 18px monospace';
    ctx.fillText('PAUSED', CONFIG.WIDTH / 2, 180);
  }
});

addEventListener('keydown', e => {
  if(e.code === 'KeyP') engine.paused ? engine.resume() : engine.pause('user');
});
engine.start();
window.__V1 = { engine, input, camera, player, LEVEL, CONFIG };
