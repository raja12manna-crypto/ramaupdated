/* ============================================================
   RAMA V1 · core/config.js
   Global engine constants. Gameplay tuning will migrate to
   /data/*.json once the Asset Loader (Module 2) exists.
============================================================ */
export const CONFIG = {
  /* internal resolution — HD-2D pixel canvas, scaled to fit */
  WIDTH: 640,
  HEIGHT: 360,
  /* simulation */
  DT: 1 / 60,            // fixed timestep (s)
  MAX_FRAME: 0.1,        // spiral-of-death clamp (s)
  MAX_STEPS: 6,          // hard cap on catch-up steps per frame
  /* debug */
  DEBUG_KEY: 'F3',
};
