/* ============================================================
   RAMA V1 · game/player.js — PLAYER CONTROLLER
   Reads InputSystem, drives Physics, owns the animation state
   machine. Tuned for readable, Contra-ish weight: fast
   acceleration, snappy jump, committed roll/dash.

   States: idle · run · jump · fall · wallcling · roll
============================================================ */
import { resolve } from '../core/physics.js';
import { LEVEL, GROUND_Y } from './forestLevel.js';

const MOVE_SPEED    = 150;
const ACCEL         = 1100;
const AIR_ACCEL     = 700;
const FRICTION      = 1300;
const JUMP_VEL       = -390;   // more hangtime -> forgiving gap-clearing window
const WALL_SLIDE_MAX = 80;
const WALL_JUMP_VX   = 230;
const WALL_JUMP_VY   = -340;
const WALL_LOCKOUT   = 0.16;     // s — brief control-lock after a wall-jump, Nintendo-style commit
const DASH_SPEED     = 340;
const DASH_TIME      = 0.3;      // travel ~102px — clears the 60px overhang with real margin
                                   // on both sides, so height never reverts mid-obstacle
const DASH_COOLDOWN  = 0.45;
const STAND_H = 34, ROLL_H = 8, WIDTH = 14;
const LAND_FLASH = 0.12;         // s of 'land' pose after touching down from a real fall

export function createPlayer(){
  return {
    x: LEVEL.spawn.x, y: LEVEL.spawn.y, vx: 0, vy: 0,
    width: WIDTH, height: STAND_H,
    onGround: true, wallLeft: false, wallRight: false,   // spawn point is always solid ground by design
    facing: 1, pose: 'idle', animT: 0, fi: 0,
    rolling: false, rollT: 0, dashCd: 0,
    wallLock: 0, wasFalling: false, landT: 0,
  };
}

export function updatePlayer(p, dt, input, camXHint){
  const prevY = p.y;
  const fallingBefore = p.vy > 40 && !p.onGround;

  p.dashCd = Math.max(0, p.dashCd - dt);
  p.wallLock = Math.max(0, p.wallLock - dt);
  p.landT = Math.max(0, p.landT - dt);

  /* — roll/dash — */
  if(p.rolling){
    p.rollT -= dt;
    if(p.rollT <= 0){ p.rolling = false; p.height = STAND_H; }
  } else if(input.tap('dash') && p.onGround && p.dashCd <= 0){
    p.rolling = true; p.rollT = DASH_TIME; p.dashCd = DASH_COOLDOWN;
    p.height = ROLL_H;
    p.vx = DASH_SPEED * p.facing;
  }

  /* — horizontal movement (skipped mid-roll: the dash owns vx) — */
  if(!p.rolling && p.wallLock <= 0){
    let move = 0;
    if(input.held('left'))  move -= 1;
    if(input.held('right')) move += 1;
    if(move !== 0) p.facing = move;
    const accel = p.onGround ? ACCEL : AIR_ACCEL;
    const target = move * MOVE_SPEED;
    if(move !== 0){
      p.vx += Math.sign(target - p.vx) * Math.min(Math.abs(target - p.vx), accel * dt);
    } else if(p.onGround){
      p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), FRICTION * dt);
    }
  }

  /* — wall interaction (before jump handling, so a jump this frame can react to it) — */
  const pressingIntoWall = (p.wallLeft && input.held('left')) || (p.wallRight && input.held('right'));
  const clinging = !p.onGround && pressingIntoWall && !p.rolling;
  if(clinging) p.vy = Math.min(p.vy, WALL_SLIDE_MAX);

  /* — jump / wall-jump — */
  if(input.tap('jump')){
    if(clinging){
      p.vy = WALL_JUMP_VY;
      p.vx = WALL_JUMP_VX * (p.wallLeft ? 1 : -1);       // push off away from the wall
      p.facing = p.wallLeft ? 1 : -1;
      p.wallLock = WALL_LOCKOUT;
    } else if(p.onGround){
      p.vy = JUMP_VEL;
    }
  }

  /* — physics step — */
  resolve(p, dt, LEVEL.platforms);
  if(p.onGround){ p.rolling && p.rollT <= 0 && (p.height = STAND_H); }

  /* landing flash: only for a real fall, not every ground tick */
  if(p.onGround && fallingBefore) p.landT = LAND_FLASH;

  /* fell into a pit — respawn (no lives system yet; tech-demo behavior) */
  if(p.y > 420){
    p.x = LEVEL.spawn.x; p.y = LEVEL.spawn.y; p.vx = 0; p.vy = 0;
    p.rolling = false; p.height = STAND_H;
  }

  /* — animation state selection — */
  p.animT += dt;
  if(p.rolling)                       p.pose = 'roll';
  else if(clinging)                   p.pose = 'wallcling';
  else if(p.landT > 0)                p.pose = 'land';
  else if(!p.onGround && p.vy < -20)  p.pose = 'jump';
  else if(!p.onGround && p.vy > 20)   p.pose = 'fall';
  else if(Math.abs(p.vx) > 15)        p.pose = 'run';
  else                                 p.pose = 'idle';

  const speedFactor = p.pose === 'run' ? Math.max(0.6, Math.abs(p.vx) / MOVE_SPEED) : 1;
  p.fi = Math.floor(p.animT * (p.pose === 'run' ? 10 : 6) * speedFactor);
}
