/* ============================================================
   RAMA V1 · scenes/title.js
   Title card: logo + "press to continue". Uses the same gold/
   dark-forest palette as the gate DOM so the transition from
   HTML gate to canvas feels seamless.
============================================================ */
import { CONFIG } from '../core/config.js';

export function createTitleScene({ onDone, input }){
  let t = 0, ready = false;
  return {
    onEnter(){ t = 0; ready = false; },
    update(dt){
      t += dt;
      if(t > 0.4) ready = true;   // brief pause before input registers (avoid instant skip)
      if(ready && (input.tap('confirm') || input.tap('jump'))) onDone();
    },
    render(ctx){
      const { WIDTH: W, HEIGHT: H } = CONFIG;
      const g = ctx.createRadialGradient(W/2, H*0.25, 20, W/2, H*0.25, W*0.7);
      g.addColorStop(0, '#1c3a24'); g.addColorStop(0.6, '#0d1d12'); g.addColorStop(1, '#0b0714');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f2c14e';
      ctx.font = 'bold 42px monospace';
      ctx.save();
      ctx.shadowColor = 'rgba(242,193,78,.5)'; ctx.shadowBlur = 18 + Math.sin(t*1.5)*4;
      ctx.fillText('RAMA', W/2, H*0.36);
      ctx.restore();
      ctx.font = '11px monospace'; ctx.fillStyle = '#e8e0d0';
      ctx.fillText('THE RETRO GAME', W/2, H*0.36 + 26);

      if(ready && Math.sin(t*4) > -0.2){
        ctx.font = '10px monospace'; ctx.fillStyle = '#8f86a8';
        ctx.fillText('press Z / SPACE to continue', W/2, H*0.72);
      }
    },
  };
}
