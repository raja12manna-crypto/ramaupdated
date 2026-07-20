/* ============================================================
   RAMA V1 · core/engine.js — THE HEARTBEAT
   Fixed-timestep simulation (60 Hz) + interpolated rendering.

   Responsibilities (and nothing more — see spec Rule 1):
     · deterministic update loop with catch-up + spiral guard
     · render callback with interpolation alpha (smoothness)
     · pause/resume lifecycle + auto-pause on tab hide
     · canvas bootstrap, crisp integer-aware scaling, letterbox
     · frame instrumentation feeding DebugHUD (F3)

   Emits on the global bus:
     'engine:pause' | 'engine:resume' | 'engine:step' (dt)
============================================================ */
import { CONFIG } from './config.js';
import { GameClock } from './clock.js';
import { DebugHUD } from './debug.js';
import { bus } from './events.js';

export class Engine {
  constructor(canvas){
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;    // pixel-art fidelity
    this.clock = new GameClock();
    this.debug = new DebugHUD();
    this.paused = false;
    this._update = () => {};
    this._render = () => {};
    this._acc = 0;
    this._last = 0;
    this._raf = 0;
    this._steps = 0;

    /* --- display scaling: fit viewport, prefer integer scale --- */
    this._fit = () => {
      const a = CONFIG.WIDTH / CONFIG.HEIGHT;
      let w = innerWidth, h = innerHeight;
      let cw = w, ch = w / a;
      if(ch > h){ ch = h; cw = h * a; }
      const intScale = Math.max(1, Math.floor(cw / CONFIG.WIDTH));
      if(cw / CONFIG.WIDTH - intScale < 0.35){   // snap to integer scale when close
        cw = CONFIG.WIDTH * intScale; ch = CONFIG.HEIGHT * intScale;
      }
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
    };
    addEventListener('resize', this._fit); this._fit();

    /* --- audit lesson: freeze EVERYTHING when the tab hides --- */
    document.addEventListener('visibilitychange', () => {
      if(document.hidden) this.pause('hidden');
    });

    /* --- F3 debug toggle (debug tooling lives with the core) --- */
    addEventListener('keydown', e => {
      if(e.code === CONFIG.DEBUG_KEY){ e.preventDefault();
        this.debug.visible = !this.debug.visible; }
    });
  }

  setUpdate(fn){ this._update = fn; }
  setRender(fn){ this._render = fn; }

  start(){
    this._last = performance.now();
    const loop = (now) => {
      this._raf = requestAnimationFrame(loop);
      const frameStart = performance.now();
      let raw = (now - this._last) / 1000;
      this._last = now;
      if(raw > CONFIG.MAX_FRAME) raw = CONFIG.MAX_FRAME;   // spiral guard
      if(!this.paused){
        this._acc += raw;
        this._steps = 0;
        while(this._acc >= CONFIG.DT && this._steps < CONFIG.MAX_STEPS){
          this.clock.tick(CONFIG.DT);
          this._update(CONFIG.DT);
          bus.emit('engine:step', CONFIG.DT);
          this._acc -= CONFIG.DT;
          this._steps++;
        }
        if(this._steps === CONFIG.MAX_STEPS) this._acc = 0;  // drop backlog, never death-spiral
      }
      /* alpha ∈ [0,1): how far between sim states we are — renderers
         may interpolate positions with it for Nintendo-smooth motion */
      const alpha = this.paused ? 0 : this._acc / CONFIG.DT;
      this._render(this.ctx, alpha);
      this.debug.sample(performance.now() - frameStart, this._steps);
      this.debug.draw(this.ctx, CONFIG.WIDTH);
    };
    this._raf = requestAnimationFrame(loop);
  }

  pause(reason){
    if(this.paused) return;
    this.paused = true;
    bus.emit('engine:pause', { reason });
  }
  resume(){
    if(!this.paused) return;
    this.paused = false;
    this._last = performance.now();            // no catch-up burst after pause
    this._acc = 0;
    bus.emit('engine:resume', {});
  }
  stop(){ cancelAnimationFrame(this._raf); }
}
