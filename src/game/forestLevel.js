/* ============================================================
   RAMA V1 · game/forestLevel.js
   A single side-scrolling stage through the Forest of Tatākā,
   built as pure data (spec requirement: content stays JSON-
   shaped, never hardcoded into gameplay logic).

   Layout (left → right):
     ground → gap (jump) → ground → pit (wall-jump shaft up,
     elevated walkway, descending steps back down) → ground →
     low stone lintel (must roll under) → ground → end dais
============================================================ */
export const GROUND_Y = 300;

export const LEVEL = {
  width: 1720,
  spawn: { x: 100, y: GROUND_Y },
  platforms: [
    { x: 0,    y: 300, w: 380,  h: 60,  type: 'ground' },
    // gap 380–460: requires a jump
    { x: 450,  y: 300, w: 310,  h: 60,  type: 'ground' },   // gap shortened 80->70px (see below)
    // pit 760–880: no floor — must climb the wall-jump shaft (a proper
    // narrow corridor: 40px interior gap crosses reliably in one push-off)
    { x: 790,  y: 126, w: 20,   h: 174, type: 'wall'   },   // shaft left wall
    { x: 850,  y: 126, w: 20,   h: 174, type: 'wall'   },   // shaft right wall
    { x: 790,  y: 126, w: 80,   h: 14,  type: 'ground' },   // shaft-top cap / landing
    { x: 870,  y: 126, w: 250,  h: 14,  type: 'ground' },   // elevated walkway
    { x: 1120, y: 170, w: 80,   h: 14,  type: 'ground' },   // descending steps
    { x: 1200, y: 214, w: 80,   h: 14,  type: 'ground' },
    { x: 1280, y: 258, w: 80,   h: 14,  type: 'ground' },
    { x: 1360, y: 300, w: 200,  h: 60,  type: 'ground' },   // back to ground level
    { x: 1420, y: 265, w: 60,   h: 25,  type: 'overhang' }, // must ROLL under this
    { x: 1560, y: 300, w: 160,  h: 60,  type: 'ground' },   // end dais
  ],
};
