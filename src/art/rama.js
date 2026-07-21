/* ============================================================
   RAMA V1 · art/rama.js
   Parametric pixel-painted Rama, pre-rendered to offscreen
   frames at boot (zero per-frame paint cost).
   Poses: idle×2 · run×6 · bow×3.  Design grid 26×36 @2px.
   Reference: saffron dhoti, blue sash, topknot+gold band,
   bow slung on back (drawn forward in bow pose).
   Swap-in path: replace buildFrames() output with real sprite
   sheets via the Asset Loader (Module 2) — same draw API.
============================================================ */
import { PAL } from './palette.js';

const PXS = 2, GW = 26, GH = 36;                 // grid → 52×72 px frames

function frame(paint){
  const c = document.createElement('canvas');
  c.width = GW * PXS; c.height = GH * PXS;
  const g = c.getContext('2d');
  const R = (x, y, w, h, col) => { g.fillStyle = col;
    g.fillRect(x * PXS, y * PXS, w * PXS, h * PXS); };
  /* outlined rect: 1px amber-outline backing (reference ink style) */
  const O = (x, y, w, h, col) => { R(x-.5, y-.5, w+1, h+1, PAL.outline); R(x, y, w, h, col); };
  paint(R, O);
  return c;
}

/* shared body painter; params animate limbs/props */
function body(R, O, p){
  const { legA=0, legB=0, armF=0, armB=0, bob=0, sashW=0,
          bowBack=true, bowFront=0, lean=0, crouch=0 } = p;
  const bx = lean;                                    // torso lean (run)
  const cb = bob + crouch;                             // crouch pushes torso down
  /* back arm */
  O(6+bx+armB, 15+cb, 3, 8, PAL.skinSh);
  /* bow slung on back */
  if(bowBack){
    R(4+bx, 9+bob, 2, 17, PAL.bowSh); R(4+bx, 9+bob, 1, 17, PAL.bow);
  }
  /* legs (dhoti covers thigh, skin shin) */
  O(9+bx+legA, 24, 4, 6, PAL.dhotiSh); O(9+bx+legA*2, 29, 3, 6, PAL.skinSh);
  O(14+bx+legB, 24, 4, 6, PAL.dhoti);  O(14+bx+legB*2, 29, 3, 6, PAL.skin);
  /* feet */
  R(8+bx+legA*2, 34, 5, 2, PAL.outline); R(14+bx+legB*2, 34, 5, 2, PAL.outline);
  /* dhoti */
  O(8+bx, 18+cb, 11, 7, PAL.dhoti);
  R(8+bx, 18+cb, 11, 2, PAL.dhotiHi);
  R(8+bx, 23+cb, 11, 2, PAL.dhotiSh);
  /* torso */
  O(9+bx, 10+cb, 9, 9, PAL.skin);
  R(9+bx, 10+cb, 9, 2, PAL.skinHi);
  /* blue sash across chest → flutter tail */
  R(9+bx, 12+cb, 9, 2, PAL.sash);
  R(7+bx-sashW, 14+cb, 3+sashW, 2, PAL.sashSh);
  /* front arm */
  O(16+bx+armF, 14+cb, 3, 8, PAL.skin);
  /* head */
  O(10+bx, 2+cb, 8, 8, PAL.skin);
  R(10+bx, 2+cb, 8, 3, PAL.hair);
  R(12+bx, 0+cb, 4, 3, PAL.hair);                  /* topknot */
  R(11+bx, 4+cb, 7, 1, PAL.band);                  /* gold band */
  R(15+bx, 6+cb, 1, 1, PAL.outline);               /* eye */
  R(10+bx, 8+cb, 8, 1, PAL.skinSh);
  /* bow drawn forward */
  if(bowFront > 0){
    const d = bowFront;                              /* 1..3 draw stage */
    R(20+bx, 4, 2, 24, PAL.bow); R(20+bx, 4, 1, 24, PAL.bowSh);
    R(20+bx - d*2, 15, d*2, 1, PAL.string);          /* string pulled */
    R(20+bx, 4, 1, 1, PAL.string); R(20+bx, 27, 1, 1, PAL.string);
    if(d >= 2){ R(14+bx - d, 15, 8+d, 1, PAL.bow);   /* arrow shaft */
      R(21+bx, 14, 2, 3, PAL.arrowTip); }
  }
}

export function buildRamaFrames(){
  const F = { idle: [], run: [], bow: [], jump: [], fall: [], land: [], wallcling: [], roll: [] };
  F.idle.push(frame((R,O)=>body(R,O,{bob:0, sashW:0})));
  F.idle.push(frame((R,O)=>body(R,O,{bob:1, sashW:1})));
  const runCycle = [
    { legA:-3, legB: 3, armF: 2, armB:-2 }, { legA:-1, legB: 1, armF: 1, armB:-1 },
    { legA: 1, legB:-1, armF:-1, armB: 1 }, { legA: 3, legB:-3, armF:-2, armB: 2 },
    { legA: 1, legB:-1, armF:-1, armB: 1 }, { legA:-1, legB: 1, armF: 1, armB:-1 },
  ];
  for(const c of runCycle)
    F.run.push(frame((R,O)=>body(R,O,{ ...c, lean:1, bob:(c.legA===3||c.legA===-3)?0:1, sashW:2 })));
  for(let d=1; d<=3; d++)
    F.bow.push(frame((R,O)=>body(R,O,{ bowBack:false, bowFront:d, armF:2, sashW:1 })));
  /* jump: legs tucked, arms up-and-out, torso raised */
  F.jump.push(frame((R,O)=>body(R,O,{ legA:-2, legB:2, armF:-3, armB:3, bob:-2, sashW:2 })));
  /* fall: legs apart bracing for landing, arms out for balance */
  F.fall.push(frame((R,O)=>body(R,O,{ legA:2, legB:-2, armF:2, armB:-2, bob:1, sashW:1 })));
  /* land: wide crouch absorbing impact */
  F.land.push(frame((R,O)=>body(R,O,{ legA:3, legB:-3, armF:1, armB:-1, crouch:3, sashW:3 })));
  /* wall-cling: pressed sideways against a wall, back-hand gripping upward
     — drawn facing AWAY from the wall (drawRama flips per which wall it is) */
  F.wallcling.push(frame((R,O)=>body(R,O,{ legA:-2, legB:1, armB:-4, armF:1, bob:0, sashW:0 })));
  /* roll: 3-frame tuck, rendered with an extra squash/rotate at draw time
     (see drawRama) so a compact grid can still read as a spin */
  for(let i=0;i<3;i++)
    F.roll.push(frame((R,O)=>body(R,O,{ legA:2-i, legB:-2+i, armF:-2, armB:2, crouch:4, sashW:2 })));
  return F;
}

export function drawRama(ctx, frames, pose, fi, x, y, facing=1, rollT=0){
  const list = frames[pose];
  const f = list[fi % list.length];
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if(facing < 0) ctx.scale(-1, 1);
  if(pose === 'roll'){
    /* fake a tucked spin: squash vertically, stretch horizontally, rotate
       continuously with rollT (0..1 progress) — cheap, reads well at 52x72 */
    ctx.translate(0, -f.height * 0.35);
    ctx.rotate(rollT * Math.PI * 2 * facing);
    ctx.scale(1.25, 0.62);
    ctx.drawImage(f, -f.width/2, -f.height * 0.65);
  } else {
    ctx.drawImage(f, -f.width/2, -f.height);
  }
  ctx.restore();
}
