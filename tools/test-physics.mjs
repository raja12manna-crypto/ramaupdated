import { resolve, GRAVITY, MAX_FALL } from '../src/core/physics.js';

let pass = 0, fail = 0;
const ok = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL'), name); cond ? pass++ : fail++; };

/* 1. falling onto a ground platform stops and sets onGround */
{
  const e = { x: 100, y: 0, vx: 0, vy: 0, width: 14, height: 30 };
  const platforms = [{ x: 0, y: 300, w: 500, h: 60 }];
  for(let i=0;i<200;i++) resolve(e, 1/60, platforms);
  ok('1 lands on ground, y snaps to 300', e.y === 300);
  ok('2 onGround true after landing', e.onGround === true);
  ok('3 vy resets to 0 on landing', e.vy === 0);
}

/* 2. falls through a gap (no platform) — never stops */
{
  const e = { x: 400, y: 0, vx: 0, vy: 0, width: 14, height: 30 };
  const platforms = [{ x: 0, y: 300, w: 380, h: 60 }];   // gap starts at x=380
  for(let i=0;i<120;i++) resolve(e, 1/60, platforms);
  ok('4 falls through a gap (y > 300)', e.y > 300);
  ok('5 terminal velocity clamps at MAX_FALL', e.vy === MAX_FALL);
}

/* 3. horizontal wall blocks movement + sets wallRight (continuous press,
      as a real held-direction input would drive every frame) */
{
  const e = { x: 750, y: 300, vx: 0, vy: 0, width: 14, height: 30 };
  const platforms = [
    { x: 0, y: 300, w: 900, h: 60 },          // ground — keeps entity grounded
    { x: 790, y: 126, w: 20, h: 174 },        // shaft wall
  ];
  let sawWallFlag = false;
  for(let i=0;i<40;i++){ e.vx = 200; resolve(e, 1/60, platforms); if(e.wallRight) sawWallFlag = true; }
  ok('6 stopped by wall (x <= wall face)', e.x <= 790 - 7 + 0.01);
  ok('7 wallRight flag set while pressing into the wall', sawWallFlag === true);
  ok('8 vx zeroed on wall contact', e.vx === 0);
}

/* 4. rolling (short hitbox) clears an overhang a standing hitbox cannot —
      both approach horizontally from outside, as they would in real play */
{
  const overhang = { x: 500, y: 265, w: 60, h: 25 };       // bottom at y=290
  const ground = { x: 0, y: 300, w: 1000, h: 60 };
  const platforms = [ground, overhang];
  const standing = { x: 460, y: 300, vx: 0, vy: 0, width: 14, height: 34 };
  const rolling  = { x: 460, y: 300, vx: 0, vy: 0, width: 14, height: 8  };
  for(let i=0;i<60;i++){ standing.vx = 200; resolve(standing, 1/60, platforms); }
  for(let i=0;i<60;i++){ rolling.vx  = 200; resolve(rolling,  1/60, platforms); }
  ok('9 standing height IS blocked before reaching the overhang', standing.x < 500);
  ok('10 rolling height passes UNDER the overhang (x advances past 560)', rolling.x > 560);
}

/* 5. jump arc: upward velocity decelerates under gravity every step */
{
  const e = { x: 100, y: 300, vx: 0, vy: -360, width: 14, height: 30 };
  const v0 = e.vy;
  resolve(e, 1/60, []);
  ok('11 gravity reduces upward speed each step', e.vy > v0);
  ok('12 gravity matches GRAVITY*dt exactly (no platforms)', Math.abs(e.vy - (v0 + GRAVITY/60)) < 0.001);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
