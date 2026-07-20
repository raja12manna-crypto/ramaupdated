/* ============================================================
   RAMA — The Retro Game · npcs.js — interaction targeting & dispatch
   Classic script; shares global scope. Load order matters.
============================================================ */
function nearestInteract(){
  let best=null,bd=48;
  for(const n of NPCS){ const d=Math.abs(P.x-n.x); if(d<bd){bd=d;best={type:'npc',n};} }
  if(G.roomId==='temple_square'){ const d=Math.abs(P.x-560);
    if(d<40&&(!best||d<bd))best={type:'bell'}; }
  if(G.roomId==='panchavati'&&SAVE.flags.crossed&&!SAVE.flags.ch2done&&!G.postDeer){
    const d=Math.abs(P.x-560);
    if(d<56&&(!best||d<bd))best={type:'deer'};
  }
  if(G.roomId==='ganga_bank'&&(SAVE.talked.guha||0)>=1&&!SAVE.flags.crossed){
    const d=Math.abs(P.x-600);
    if(d<52&&(!best||d<bd))best={type:'boat'};
  }
  return best;
}
function startInteract(it){
  if(it.type==='boat'){ startCrossing(); return; }
  if(it.type==='deer'){ startDeerScene(); return; }
  if(it.type==='bell'){ Audio2.bell(); toast('🔔 The bell clears the mind…');
    if(!SAVE.flags.bell){SAVE.flags.bell=1;SAVE.dharma+=5;persist();} return; }
  const n=it.n, lines=DIALOGS[n.id]||[];
  const t=(SAVE.talked[n.id]||0);
  const li=Math.min(t,lines.length-1);
  G.dlg={ npc:n, page:lines[li] }; G.dlgChar=0; G.mode='dialog'; Audio2.uiA();
  if(!SAVE.talked[n.id]){ G.metCount++;
    if(!SAVE.flags.met5 && Object.keys(SAVE.talked).length+1>=5){
      SAVE.flags.met5=1; G.objective='Find Guru Vashishtha — training grounds, far east';
      toast('Objective updated'); }
  }
  SAVE.talked[n.id]=t+1; persist();
  if(n.id==='guha'&&SAVE.talked.guha===1&&!SAVE.flags.crossed){
    G.objective='Board Guha\'s boat — cross the Ganga'; }
  if(n.guru&&!SAVE.flags.guruMet){ SAVE.flags.guruMet=1;
    G.objective='Speak again with the Guru — begin training'; }
  else if(n.guru&&SAVE.flags.guruMet&&!SAVE.flags.trained){
    G.dlg={npc:n,page:['Guru Vashishtha','Take the bow, Rama. Five targets. Remember — stillness first, arrow after. Move nothing but the breath.'],train:true}; }
}
