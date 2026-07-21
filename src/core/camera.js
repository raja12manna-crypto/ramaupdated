/* ============================================================
   RAMA V1 · core/camera.js — CAMERA
   Horizontal side-scroll follow with smoothing, clamped to
   level bounds. Exposes both current and previous-frame x so
   the renderer can interpolate (matches the Engine's alpha
   pattern from Module 1 — smooth motion independent of FPS).
============================================================ */
import { CONFIG } from './config.js';

export class Camera {
  constructor(){ this.x = 0; this.px = 0; }

  follow(targetX, dt, levelWidth, smoothing = 8){
    this.px = this.x;
    const desired = Math.max(0, Math.min(targetX - CONFIG.WIDTH / 2, Math.max(0, levelWidth - CONFIG.WIDTH)));
    this.x += (desired - this.x) * Math.min(1, dt * smoothing);
  }

  interpolated(alpha){ return this.px + (this.x - this.px) * alpha; }
}
