/* ============================================================
   RAMA V1 · core/assets.js — ASSET LOADER
   Manifest-driven loading for images, JSON data, and audio.
   Everything else in the engine requests assets ONLY through
   this class — no raw `new Image()` scattered through gameplay
   code (spec requirement: "asset-driven, not hardcoded").

   Emits on the global bus:
     'assets:start'    { total }
     'assets:progress' { loaded, total, key, type }
     'assets:error'    { key, type, error }   (non-fatal — load continues)
     'assets:complete' { loaded, total, failed }
============================================================ */
import { bus } from './events.js';

export class AssetLoader {
  constructor(){
    this._cache = new Map();     // key -> loaded asset (Image | data | AudioBuffer)
    this._audioCtx = null;
  }

  /* manifest shape:
     { images: { key: url, ... },
       json:   { key: url, ... },
       audio:  { key: url, ... } }
     Returns a promise that resolves once every entry has settled
     (success OR failure — one bad asset never blocks the rest). */
  async load(manifest){
    const jobs = [];
    for(const [key, url] of Object.entries(manifest.images || {}))
      jobs.push(this._loadImage(key, url));
    for(const [key, url] of Object.entries(manifest.json || {}))
      jobs.push(this._loadJSON(key, url));
    for(const [key, url] of Object.entries(manifest.audio || {}))
      jobs.push(this._loadAudio(key, url));

    const total = jobs.length;
    let settled = 0, loaded = 0, failed = 0;   // loaded = successes only; settled = processed count
    bus.emit('assets:start', { total });

    await Promise.all(jobs.map(job => job.then(
      (ok) => { settled++; ok ? loaded++ : failed++;
        bus.emit('assets:progress', { settled, total, loaded, failed, key: ok?.key, type: ok?.type }); }
    )));

    bus.emit('assets:complete', { loaded, total, failed });
    return { loaded, total, failed };
  }

  _loadImage(key, url){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload  = () => { this._cache.set(key, img); resolve({ key, type: 'image' }); };
      img.onerror = (e) => { bus.emit('assets:error', { key, type: 'image', error: e });
        resolve(null); };                                   // swallow — non-fatal
      img.src = url;
    });
  }

  _loadJSON(key, url){
    return fetch(url).then(r => {
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).then(data => { this._cache.set(key, data); return { key, type: 'json' }; })
      .catch(err => { bus.emit('assets:error', { key, type: 'json', error: err }); return null; });
  }

  _loadAudio(key, url){
    if(!this._audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      this._audioCtx = AC ? new AC() : null;
    }
    if(!this._audioCtx) return Promise.resolve(null);        // no WebAudio — skip gracefully
    return fetch(url).then(r => r.arrayBuffer())
      .then(buf => this._audioCtx.decodeAudioData(buf))
      .then(decoded => { this._cache.set(key, decoded); return { key, type: 'audio' }; })
      .catch(err => { bus.emit('assets:error', { key, type: 'audio', error: err }); return null; });
  }

  get(key){ return this._cache.get(key); }
  has(key){ return this._cache.has(key); }

  /* Sprite-sheet helper: reads a frame rect out of a loaded sheet image.
     Sheets are uniform-grid, row = animation, column = frame (see
     docs/ASSET_SPECS.md for the exact grid every character must use). */
  drawFrame(ctx, key, col, row, fw, fh, x, y, flip=false){
    const img = this._cache.get(key);
    if(!img) return false;
    ctx.save();
    if(flip){ ctx.translate(Math.round(x) + fw, Math.round(y)); ctx.scale(-1, 1); }
    else ctx.translate(Math.round(x), Math.round(y));
    ctx.drawImage(img, col * fw, row * fh, fw, fh, 0, 0, fw, fh);
    ctx.restore();
    return true;
  }

  /* Frees everything — scene transitions between chapters call this
     to avoid holding onto assets the next scene doesn't need. */
  clear(){ this._cache.clear(); }
}

export const assets = new AssetLoader();     // shared singleton, like `bus`
