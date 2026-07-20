/* ============================================================
   RAMA V1 · core/debug.js
   Frame-time HUD (F3). Ring buffer of the last 120 frames:
   fps, worst frame, update-steps count. Zero cost when off.
============================================================ */
export class DebugHUD {
  constructor(){ this.visible = false; this._samples = new Float32Array(120);
    this._i = 0; this._steps = 0; }
  sample(frameMs, steps){
    this._samples[this._i = (this._i + 1) % 120] = frameMs;
    this._steps = steps;
  }
  draw(ctx, W){
    if(!this.visible) return;
    let sum = 0, worst = 0;
    for(const v of this._samples){ sum += v; if(v > worst) worst = v; }
    const avg = sum / 120;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(W - 148, 4, 144, 46);
    ctx.fillStyle = '#8fd07a'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`fps  ${(1000 / Math.max(avg, 0.01)).toFixed(1)}`, W - 140, 16);
    ctx.fillText(`avg  ${avg.toFixed(2)}ms  worst ${worst.toFixed(1)}`, W - 140, 28);
    ctx.fillText(`steps/frame ${this._steps}`, W - 140, 40);
    ctx.restore();
  }
}
