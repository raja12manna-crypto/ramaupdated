/* ============================================================
   RAMA V1 · core/physics.js — PHYSICS
   Pure logic, zero DOM dependency (testable directly in Node).
   AABB entity vs. static-rect platform list. Feet-anchored
   entities: (x,y) is bottom-center; box is derived from
   width/height each resolve so an entity can change hitbox
   height at runtime (e.g. standing vs. rolling under a ledge).
============================================================ */
export const GRAVITY   = 1400;   // px/s²
export const MAX_FALL  = 620;    // px/s terminal velocity

export function box(e){
  return { x: e.x - e.width / 2, y: e.y - e.height, w: e.width, h: e.height };
}
function overlap(a, b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function vOverlapDepth(a, b){
  return Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
}
/* Below this many px of vertical overlap, an X-axis hit is treated as an
   incidental corner graze (e.g. a standing hitbox brushing the corner
   where a staircase step meets the ground at a shared x-boundary) and
   ignored — rather than a genuine sideways obstruction. A deliberate
   low-ceiling obstacle (sized to block standing height, requiring a
   roll) overlaps far deeper than this and still blocks correctly;
   real walls (tall shaft pillars) overlap almost the player's full
   height and are never near this threshold either. */
const SEAM_TOLERANCE = 10;

/* Moves `e` by its velocity this step and resolves collisions against
   `platforms` (array of {x,y,w,h}) axis-separated (X then Y — standard
   and avoids tunneling corner cases at the speeds this game uses).
   Sets e.onGround / e.wallLeft / e.wallRight for the caller's state
   machine (player.js) to read this frame. */
export function resolve(e, dt, platforms){
  e.onGround = false; e.wallLeft = false; e.wallRight = false;

  /* — Y axis first — */
  e.vy = Math.min(e.vy + GRAVITY * dt, MAX_FALL);
  e.y += e.vy * dt;
  for(const p of platforms){
    const b = box(e);
    if(!overlap(b, p)) continue;
    if(e.vy > 0){ e.y = p.y; e.onGround = true; }
    else if(e.vy < 0){ e.y = p.y + p.h + e.height; }
    e.vy = 0;
  }

  /* — X axis second — using the now-settled Y. Resolving Y first means a
     falling entity that's about to LAND on a platform's top gets that
     landing locked in before the X-check ever runs — so a jump arc that
     grazes just over a platform's near edge lands cleanly instead of
     being caught by the platform's side as a false wall hit. The depth
     threshold below remains as a second-layer safety net for genuine
     corner grazes (e.g. a staircase seam) that Y-first alone doesn't
     cover, since it can't help two platforms at different heights that
     are directly adjacent in X. */
  e.x += e.vx * dt;
  for(const p of platforms){
    const b = box(e);
    if(!overlap(b, p)) continue;
    if(vOverlapDepth(b, p) < SEAM_TOLERANCE) continue;   // shallow corner graze — ignore
    if(e.vx > 0){ e.x = p.x - e.width / 2; e.wallRight = true; }
    else if(e.vx < 0){ e.x = p.x + p.w + e.width / 2; e.wallLeft = true; }
    e.vx = 0;
  }
}
