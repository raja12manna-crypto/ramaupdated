/* ============================================================
   RAMA — The Retro Game · world.js — room entry & transitions
   Classic script; shares global scope. Load order matters.
============================================================ */
function enterRoom(id,px){
  const r=ROOMS[id]; G.room=r; G.roomId=id;
  P.x=px!==undefined?px:r.spawn; P.y=GROUND; P.vy=0;
  NPCS=(r.npcs||[]).map(n=>({...n, y:GROUND, dir:1, wt:Math.random()*3, wx:n.x }));
  BIRDS=[]; for(let i=0;i<(r.birds||0);i++)
    BIRDS.push({x:120+Math.random()*(r.w-240), y:GROUND, fly:0, vx:0, vy:0});
  SAVE.pos={room:id,x:P.x}; persist();
}

