/* ============================================================
   RAMA — The Retro Game · book.js — Book of Dharma UI
   Classic script; shares global scope. Load order matters.
============================================================ */
function drawBook(){
  ctx.fillStyle='rgba(8,5,14,.92)'; ctx.fillRect(0,0,W,H);
  miniFrame(60,26,W-120,H-52);
  ctx.textAlign='center'; ctx.fillStyle='#f2c14e'; ctx.font='bold 15px monospace';
  ctx.fillText('✦ BOOK OF DHARMA ✦',W/2,52);
  ctx.font='9px monospace'; ctx.fillStyle='#8f86a8';
  ctx.fillText(SAVE.entries.length+' / '+Object.keys(ENTRIES).length+' entries   ·   Dharma '+SAVE.dharma,W/2,68);
  if(!SAVE.entries.length){
    ctx.fillStyle='#e8e0d0'; ctx.font='11px monospace';
    ctx.fillText('The pages are empty. Speak with the people of Ayodhya.',W/2,150);
  } else {
    G.bookSel=((G.bookSel%SAVE.entries.length)+SAVE.entries.length)%SAVE.entries.length;
    SAVE.entries.forEach((id,i)=>{
      ctx.textAlign='left'; ctx.font='10px monospace';
      ctx.fillStyle=i===G.bookSel?'#f2c14e':'#b8b0c8';
      ctx.fillText((i===G.bookSel?'▸ ':'  ')+ENTRIES[id].title,84,92+i*16);
    });
    const e=ENTRIES[SAVE.entries[G.bookSel]];
    ctx.fillStyle='#f2c14e'; ctx.font='bold 11px monospace';
    ctx.fillText(e.title,300,96);
    ctx.fillStyle='#e8e0d0'; ctx.font='10px monospace';
    const words=e.text.split(' '); let line='',ly=114;
    for(const w2 of words){ if(ctx.measureText(line+w2).width>240){
        ctx.fillText(line,300,ly); ly+=14; line=''; } line+=w2+' '; }
    ctx.fillText(line,300,ly);
  }
  ctx.textAlign='center'; ctx.fillStyle='#8f86a8'; ctx.font='10px monospace';
  ctx.fillText('▲▼ browse   ·   S / A close',W/2,H-38);
}
function updateBook(){
  if(SAVE.entries.length){
    if(tap('ArrowUp'))  {G.bookSel--;Audio2.uiB();}
    if(tap('ArrowDown')){G.bookSel++;Audio2.uiB();}
  }
  if(tap('KeyS')||tap('KeyA')||tap('Escape')||POINTER.tapped){ G.mode='play'; Audio2.uiB(); }
}
