/* ============================================================
   RAMA V1 · scenes/game.js
   Wraps the Forest of Tatākā movement demo as a Scene. This is
   the same logic that was previously wired directly in main.js
   (Modules 4–7's playable milestone) — now formalized behind
   the Scene Manager (Module 3) instead of being hand-rolled.
============================================================ */
import { CONFIG } from '../core/config.js';
import { Camera } from '../core/camera.js';
import { buildRamaFrames, drawRama } from '../art/rama.js';
import { buildForest, drawForest } from '../art/forest.js';
import { LEVEL } from '../game/forestLevel.js';
import { drawLevel } from '../game/levelRender.js';
import { createPlayer, updatePlayer } from '../game/player.js';

export function createGameScene({ SAVE, persist, onPause, input }){
  let frames, forest, player, camera, saveT;
  return {
    onEnter(mode){    // mode: 'new' | 'continue'
      frames = frames || buildRamaFrames();     // pre-rendered art is reusable across re-entries
      forest = forest || buildForest();
      player = createPlayer();
      camera = new Camera();
      saveT = 0;
      if(mode === 'continue' && SAVE.bestX > LEVEL.spawn.x){
        player.x = Math.min(SAVE.bestX, LEVEL.width - 200);
      }
    },
    update(dt){
      if(input.tap('back')){ onPause(); return; }
      updatePlayer(player, dt, input);
      camera.follow(player.x, dt, LEVEL.width);
      if(player.x > SAVE.bestX) SAVE.bestX = Math.round(player.x);
      if(!SAVE.reachedEnd && player.x >= LEVEL.width - 100) SAVE.reachedEnd = true;
      SAVE.playTimeSec += dt;
      saveT += dt;
      if(saveT > 2){ saveT = 0; persist(); }
    },
    render(ctx, alpha){
      const camX = camera.interpolated(alpha);
      drawForest(ctx, forest, camX, performance.now()/1000, { skipGround: true });
      drawLevel(ctx, LEVEL, camX);
      const px = player.x - camX, py = player.y;
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath(); ctx.ellipse(px, py + 2, 10, 3, 0, 0, 7); ctx.fill();
      drawRama(ctx, frames, player.pose, player.fi, px, py, player.facing,
        player.rolling ? 1 - Math.max(0, player.rollT) / 0.3 : 0);
      ctx.fillStyle = 'rgba(232,224,208,.85)'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('RAMA V1 · FOREST OF TATĀKĀ', CONFIG.WIDTH / 2, 16);
      ctx.font = '9px monospace';
      ctx.fillText('← → move · Z/Space jump · X roll/dash · ESC pause', CONFIG.WIDTH / 2, 350);
    },
    get player(){ return player; },
  };
}
