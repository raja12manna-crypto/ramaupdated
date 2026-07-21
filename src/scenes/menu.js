/* ============================================================
   RAMA V1 · scenes/menu.js
   Main Menu: New Game / Continue / Settings. Continue only
   appears once there's real progress (SAVE.bestX > 0) — no
   dead-end option pointing at nothing.
============================================================ */
import { CONFIG } from '../core/config.js';
import { makeMenuNav } from '../core/menuNav.js';

export function createMenuScene({ SAVE, onNewGame, onContinue, onSettings, input }){
  let nav, items;
  return {
    onEnter(){
      items = SAVE.bestX > 0
        ? [['New Game', onNewGame], ['Continue', onContinue], ['Settings', onSettings]]
        : [['New Game', onNewGame], ['Settings', onSettings]];
      nav = makeMenuNav(items.length);
    },
    update(dt){
      nav.update(input);
      if(input.tap('confirm') || input.tap('jump')) items[nav.sel][1]();
    },
    render(ctx){
      const { WIDTH: W, HEIGHT: H } = CONFIG;
      ctx.fillStyle = '#0b0714'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f2c14e'; ctx.font = 'bold 20px monospace';
      ctx.fillText('RAMA', W/2, H*0.24);
      ctx.font = '9px monospace'; ctx.fillStyle = '#8f86a8';
      ctx.fillText('FOREST OF TATĀKĀ · MOVEMENT DEMO', W/2, H*0.24 + 18);

      items.forEach(([label], i) => {
        const y = H*0.48 + i*32;
        const active = i === nav.sel;
        ctx.font = active ? 'bold 14px monospace' : '13px monospace';
        ctx.fillStyle = active ? '#f2c14e' : '#c8c0d4';
        ctx.fillText((active ? '▸ ' : '') + label + (active ? ' ◂' : ''), W/2, y);
      });

      ctx.font = '9px monospace'; ctx.fillStyle = '#6b5f8a';
      ctx.fillText('▲▼ select · Z/SPACE confirm', W/2, H*0.9);
    },
  };
}
