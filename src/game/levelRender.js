/* ============================================================
   RAMA V1 · game/levelRender.js
   Draws the LEVEL's solid platform geometry using the sampled
   Forest-of-Tatākā palette — this IS the visible ground/walls/
   steps, so what you see always matches what you collide with
   (deliberate fix for a mismatch class of bug: decorative-only
   ground art that doesn't line up with real platform edges).
============================================================ */
import { PAL } from '../art/palette.js';

export function drawLevel(ctx, level, camX){
  for(const p of level.platforms){
    const x = Math.round(p.x - camX);
    if(x + p.w < 0 || x > 640) continue;                // off-screen cull
    if(p.type === 'wall'){
      ctx.fillStyle = PAL.trunk; ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = PAL.trunkHi; ctx.fillRect(x, p.y, 3, p.h);
      for(let i=0; i<p.h; i+=14) ctx.fillRect(x+2, p.y+i+4, p.w-4, 3);   // vine texture
    } else if(p.type === 'overhang'){
      ctx.fillStyle = PAL.stone; ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = PAL.moss; ctx.fillRect(x, p.y + p.h - 4, p.w, 4);  // moss drip underside
      for(let i=0;i<p.w;i+=10) ctx.fillRect(x+i, p.y+p.h-6, 2, 6);
    } else {
      ctx.fillStyle = PAL.stone; ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = PAL.moss; ctx.fillRect(x, p.y, p.w, 5);
      ctx.fillStyle = PAL.mossHi; ctx.fillRect(x, p.y, p.w, 2);
      for(let i=8; i<p.w-8; i+=26) ctx.fillRect(x+i, p.y+8, 12, 3);      // stone seams
    }
  }
}
