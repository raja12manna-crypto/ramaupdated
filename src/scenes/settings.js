/* ============================================================
   RAMA V1 · scenes/settings.js
   Movement & Combos reference — Tekken-3-style move list.
   Grows automatically as new abilities/combos land in later
   modules; static text list for now (movement-only slice).
============================================================ */
import { CONFIG } from '../core/config.js';

const MOVES = [
  ['◀ ▶', 'Move'],
  ['Z / SPACE', 'Jump'],
  ['Z / SPACE (vs wall)', 'Wall-jump'],
  ['X', 'Roll / Dash'],
  ['P', 'Pause'],
  ['F3', 'Debug HUD'],
];

export function createSettingsScene({ onBack, input }){
  return {
    onEnter(){},
    update(dt){ if(input.tap('back') || input.tap('confirm')) onBack(); },
    render(ctx){
      const { WIDTH: W, HEIGHT: H } = CONFIG;
      ctx.fillStyle = '#0b0714'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#f2c14e'; ctx.font = 'bold 15px monospace';
      ctx.fillText('MOVEMENT & CONTROLS', W/2, H*0.16);

      ctx.textAlign = 'left'; ctx.font = '11px monospace';
      MOVES.forEach(([keys, desc], i) => {
        const y = H*0.3 + i*24;
        ctx.fillStyle = '#f2c14e'; ctx.fillText(keys, 90, y);
        ctx.fillStyle = '#c8c0d4'; ctx.fillText(desc, 320, y);
      });

      ctx.textAlign = 'center'; ctx.font = '9px monospace'; ctx.fillStyle = '#6b5f8a';
      ctx.fillText('More moves & combos appear here as they unlock', W/2, H*0.82);
      ctx.fillText('ESC or Z/SPACE to go back', W/2, H*0.9);
    },
  };
}
