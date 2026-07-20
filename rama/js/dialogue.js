/* ============================================================
   RAMA — The Retro Game · dialogue.js — dialog & cutscene systems
   Classic script; shares global scope. Load order matters.
============================================================ */
function updateDialog(dt){
  const full=G.dlg.page[1];
  if(G.dlgChar<full.length){ G.dlgChar=Math.min(full.length,G.dlgChar+dt*46);
    if(tap('KeyA')||POINTER.tapped){G.dlgChar=full.length;} return; }
  if(tap('KeyA')||POINTER.tapped){
    const grant=G.dlg.page[2], wasTrain=G.dlg.train;
    if(grant&&grant.startsWith('entry:'))grantEntry(grant.slice(6));
    G.dlg=null; Audio2.uiB();
    if(wasTrain){ startTraining(); return; }
    G.mode='play';
  }
}
/* ---------------- Archery training: stillness of mind ---------------- */
function drawDialog(){
  const p=G.dlg.page;
  miniFrame(30,H-104,W-60,86);
  ctx.textAlign='left'; ctx.fillStyle='#f2c14e'; ctx.font='bold 11px monospace';
  ctx.fillText(p[0],46,H-84);
  ctx.fillStyle='#f2ecd8'; ctx.font='11px monospace';
  const words=p[1].slice(0,G.dlgChar|0).split(' ');
  let line='',ly=H-66;
  for(const w2 of words){ if(ctx.measureText(line+w2).width>W-130){
      ctx.fillText(line,46,ly); ly+=15; line=''; } line+=w2+' '; }
  ctx.fillText(line,46,ly);
  if((G.dlgChar|0)>=p[1].length&&Math.sin(G.t*6)>0){
    ctx.fillStyle='#f2c14e'; ctx.textAlign='right'; ctx.fillText('A ▸',W-44,H-28); }
}
function drawCut(){
  const p=G.cut.pages[G.cut.i];
  miniFrame(30,H-104,W-60,86);
  ctx.textAlign='left'; ctx.fillStyle='#f2c14e'; ctx.font='bold 11px monospace';
  ctx.fillText(p[0],46,H-84);
  ctx.fillStyle='#f2ecd8'; ctx.font='11px monospace';
  const words=p[1].slice(0,G.dlgChar|0).split(' ');
  let line='',ly=H-66;
  for(const w2 of words){ if(ctx.measureText(line+w2).width>W-130){
      ctx.fillText(line,46,ly); ly+=15; line=''; } line+=w2+' '; }
  ctx.fillText(line,46,ly);
  if((G.dlgChar|0)>=p[1].length&&Math.sin(G.t*6)>0){
    ctx.fillStyle='#f2c14e'; ctx.textAlign='right'; ctx.fillText('A ▸',W-44,H-28); }
}
function startCutscene(pages,cb){ G.cut={pages,i:0,cb}; G.dlgChar=0; G.mode='cutscene'; }
function updateCutscene(dt){
  const p=G.cut.pages[G.cut.i], full=p[1];
  if(G.dlgChar<full.length){ G.dlgChar=Math.min(full.length,G.dlgChar+dt*46);
    if(tap('KeyA')||POINTER.tapped)G.dlgChar=full.length; return; }
  if(tap('KeyA')||POINTER.tapped){
    G.cut.i++; G.dlgChar=0; Audio2.uiB();
    if(G.cut.i>=G.cut.pages.length){ const cb=G.cut.cb; G.cut=null; G.mode='play'; cb&&cb(); }
  }
}
/* ---------------- Exile sequence ---------------- */
