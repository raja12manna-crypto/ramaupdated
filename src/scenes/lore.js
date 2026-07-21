/* ============================================================
   RAMA V1 · scenes/lore.js
   A short lore card before the Main Menu. Typewriter text,
   same tone as the story documents this project is built from.
============================================================ */
import { CONFIG } from '../core/config.js';

const LORE_TEXT =
  "Long ago, in the kingdom of Ayodhya, a prince named Rama walked " +
  "the path of dharma. Beyond the city's edge, the Forest of Tatakā " +
  "waits — ancient, watchful, and guarded by a fury older than the trees themselves.";

export function createLoreScene({ onDone, input }){
  let charT = 0, ready = false;
  return {
    onEnter(){ charT = 0; ready = false; },
    update(dt){
      charT = Math.min(LORE_TEXT.length, charT + dt * 28);
      if(charT >= LORE_TEXT.length) ready = true;
      if(input.tap('confirm') || input.tap('jump')){
        if(charT < LORE_TEXT.length){ charT = LORE_TEXT.length; return; }   // skip typewriter first
        onDone();
      }
    },
    render(ctx){
      const { WIDTH: W, HEIGHT: H } = CONFIG;
      ctx.fillStyle = '#0b0714'; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#f2c14e'; ctx.font = 'bold 12px monospace';
      ctx.fillText('✦', W/2, H*0.28);

      const shown = LORE_TEXT.slice(0, Math.floor(charT));
      ctx.font = '12px monospace'; ctx.fillStyle = '#e8e0d0'; ctx.textAlign = 'left';
      const words = shown.split(' '); let line = '', y = H*0.4, lh = 20;
      const maxW = W - 140;
      for(const w of words){
        const test = line + w + ' ';
        if(ctx.measureText(test).width > maxW){ ctx.fillText(line, 70, y); y += lh; line = w + ' '; }
        else line = test;
      }
      ctx.fillText(line, 70, y);

      if(charT >= LORE_TEXT.length && Math.sin(performance.now()/300) > -0.2){
        ctx.textAlign = 'center'; ctx.font = '10px monospace'; ctx.fillStyle = '#8f86a8';
        ctx.fillText('press Z / SPACE to continue', W/2, H*0.86);
      }
    },
  };
}
