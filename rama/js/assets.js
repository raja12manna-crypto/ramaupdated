/* ============================================================
   RAMA — The Retro Game · assets.js — Asset Manager (sprite sheets & PNG backgrounds)
   Classic script; shares global scope. Load order matters.
============================================================ */
/* Drop PNGs into assets/ and register below (or call RAMA.Assets.load).
   Nothing registered = procedural art. Pixel-identical fallback. */
const Assets={
  images:{}, pending:0,
  load(manifest,onDone){
    const keys=Object.keys(manifest||{});
    if(!keys.length){ onDone&&onDone(); return; }
    this.pending=keys.length;
    keys.forEach(k=>{
      const im=new Image();
      im.onload=()=>{ this.images[k]=im; if(--this.pending===0)onDone&&onDone(); };
      im.onerror=()=>{ if(--this.pending===0)onDone&&onDone(); };
      im.src=manifest[k];
    });
  },
  has(k){ return !!this.images[k]; },
  /* Room background: register key  bg_<roomId>  (e.g. bg_market_street).
     Recommended size: <room width> x 360 px. Replaces the sky layer only. */
  drawBG(roomId,camX,ctx){
    const im=this.images['bg_'+roomId];
    if(!im) return false;
    ctx.drawImage(im, -Math.round(camX*0.5)%im.width, 0);
    return true;
  },
  /* Sprite-sheet helper for future actors */
  drawSprite(ctx,key,frame,x,y,fw,fh,flip){
    const im=this.images[key]; if(!im) return false;
    ctx.save();
    if(flip){ ctx.translate(Math.round(x)+fw,Math.round(y)); ctx.scale(-1,1); }
    else ctx.translate(Math.round(x),Math.round(y));
    ctx.drawImage(im, frame*fw,0,fw,fh, 0,0,fw,fh);
    ctx.restore(); return true;
  }
};
