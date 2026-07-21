/* ============================================================
   RAMA V1 · core/scenes.js — SCENE MANAGER
   Owns the Engine's update/render slots and delegates them to
   whichever scene is active. A scene is a plain object:

     { manifest?: {...AssetLoader manifest},   // optional, preloaded before onEnter
       onEnter(data, ctx): void,               // ctx = { engine, assets }
       onExit(): void,
       update(dt): void,
       render(ctx2d, alpha): void }

   Handles async asset loading between scenes (with a loading
   screen so the game is never a blank frozen frame — an audit
   lesson from the old game, which had no loading feedback),
   and clears the GameClock's pending timers on every transition
   so a stale scene's `after()` callback can never fire into the
   next scene (same class of bug the v1.x hotfix pass fixed).

   Emits on the global bus:
     'scene:loading' { key }
     'scene:ready'   { key }
     'scene:enter'   { key, data }
     'scene:exit'    { key }
     'scene:error'   { key, error }
============================================================ */
import { bus } from './events.js';

export class SceneManager {
  constructor(engine, assetLoader){
    this.engine = engine;
    this.assets = assetLoader;
    this._scenes = new Map();      // key -> scene definition
    this._current = null;
    this._currentKey = null;
    this._loading = false;
    this._loadingRender = (ctx, alpha, key) => this._defaultLoadingScreen(ctx, key);

    engine.setUpdate((dt) => { if(!this._loading && this._current) this._current.update(dt); });
    engine.setRender((ctx, alpha) => {
      if(this._loading){ this._loadingRender(ctx, alpha, this._pendingKey); return; }
      if(this._current) this._current.render(ctx, alpha);
    });
  }

  /* register a scene once; construct lazily per-goto if a factory fn is given
     so scenes can hold per-visit state without leaking across visits */
  register(key, sceneOrFactory){ this._scenes.set(key, sceneOrFactory); }

  setLoadingRenderer(fn){ this._loadingRender = fn; }

  async goto(key, data){
    const def = this._scenes.get(key);
    if(!def) throw new Error(`SceneManager: no scene registered for "${key}"`);
    const scene = typeof def === 'function' ? def() : def;

    /* exit the outgoing scene first — before any awaiting, so its update/render
       loop stops touching state immediately (no cross-scene frame bleed) */
    if(this._current){
      this._current.onExit?.();
      bus.emit('scene:exit', { key: this._currentKey });
    }
    this.engine.clock.clear();          // audit lesson: never let a stale timer fire into the new scene

    this._pendingKey = key;
    if(scene.manifest && Object.keys(scene.manifest).length){
      this._loading = true;
      bus.emit('scene:loading', { key });
      try{
        await this.assets.load(scene.manifest);
      } catch(err){
        bus.emit('scene:error', { key, error: err });    // AssetLoader itself is non-throwing per-asset,
      }                                                    // this catch guards unexpected loader failures
      bus.emit('scene:ready', { key });
      this._loading = false;
    }

    this._current = scene;
    this._currentKey = key;
    scene.onEnter?.(data, { engine: this.engine, assets: this.assets });
    bus.emit('scene:enter', { key, data });
  }

  get currentKey(){ return this._currentKey; }

  _defaultLoadingScreen(ctx, key){
    const { WIDTH: W, HEIGHT: H } = { WIDTH: ctx.canvas.width, HEIGHT: ctx.canvas.height };
    ctx.fillStyle = '#0b0714'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f2c14e'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`loading ${key ?? ''}…`, W / 2, H / 2);
  }
}
