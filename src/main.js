/* ============================================================
   RAMA V1 · main.js — BOOT & SCENE FLOW
   Required Google login -> Title -> Lore -> Main Menu
   (New Game / Continue / Settings) -> Forest of Tatākā.
   Scene transitions are owned by core/scenes.js (Module 3),
   finally wired in for real instead of the direct hand-rolled
   loop used during the earlier playable-movement milestone.
============================================================ */
import { Engine }   from './core/engine.js';
import { CONFIG }   from './core/config.js';
import { InputSystem } from './core/input.js';
import { AssetLoader } from './core/assets.js';
import { SceneManager } from './core/scenes.js';
import { Cloud } from './core/firebase.js';
import { SAVE, localLoad, persist, cloudMerge, DEFAULT_SAVE } from './core/save.js';
import { createTitleScene } from './scenes/title.js';
import { createLoreScene } from './scenes/lore.js';
import { createMenuScene } from './scenes/menu.js';
import { createSettingsScene } from './scenes/settings.js';
import { createGameScene } from './scenes/game.js';

const cv = document.getElementById('game');
cv.width = CONFIG.WIDTH; cv.height = CONFIG.HEIGHT;
const engine = new Engine(cv);
const input  = new InputSystem();
input.bindTouchButtons(document.getElementById('tcL'));
input.bindTouchButtons(document.getElementById('tcR'));
if(matchMedia('(pointer:coarse)').matches) document.body.classList.add('touch');

const assets = new AssetLoader();
const sm = new SceneManager(engine, assets);

/* ---------------- Scene graph ---------------- */
const gameScene = createGameScene({
  SAVE, persist, input,
  onPause: () => sm.goto('menu'),
});
sm.register('title', () => createTitleScene({ input, onDone: () => sm.goto('lore') }));
sm.register('lore',  () => createLoreScene({ input, onDone: () => sm.goto('menu') }));
sm.register('menu',  () => createMenuScene({
  SAVE, input,
  onNewGame: () => { Object.assign(SAVE, DEFAULT_SAVE()); persist(); sm.goto('game', 'new'); },
  onContinue: () => sm.goto('game', 'continue'),
  onSettings: () => sm.goto('settings'),
}));
sm.register('settings', () => createSettingsScene({ input, onBack: () => sm.goto('menu') }));
sm.register('game', () => gameScene);
/* SceneManager (Module 3) already owns engine.setUpdate/setRender — each
   scene closes over `input` itself, so no extra wiring is needed here. */

addEventListener('keydown', e => {
  if(e.code === 'KeyP' && sm.currentKey === 'game') engine.paused ? engine.resume() : engine.pause('user');
});

/* ---------------- Boot: required Google login ---------------- */
const gate = document.getElementById('gate'), gbtn = document.getElementById('gbtn'),
      gerr = document.getElementById('gerr'), cfgNote = document.getElementById('cfgNote'),
      who = document.getElementById('who'), devEnter = document.getElementById('devEnter');

function enterGame(){
  gate.style.display = 'none';
  engine.start();
  sm.goto('title');
}

Cloud.init();
localLoad();

if(Cloud.offline){
  /* No Firebase configured yet — dev fallback so the game remains testable.
     Real deployments with a config paste in core/firebase.js get the full
     required-login gate below instead. */
  cfgNote.style.display = 'block';
  devEnter.style.display = 'block';
  gbtn.addEventListener('click', () => {
    gerr.style.display = 'block';
    gerr.textContent = 'Firebase not configured — use offline dev mode below, or paste your firebaseConfig.';
  });
  devEnter.addEventListener('click', enterGame);
} else {
  devEnter.style.display = 'none';
  Cloud.onAuth(u => {
    if(u){
      who.style.display = 'block';
      who.textContent = '🙏 ' + (u.displayName || 'Pilgrim');
      cloudMerge(u.uid).then(enterGame);
    }
  });
  gbtn.addEventListener('click', () => {
    Cloud.signIn().catch(e => {
      gerr.style.display = 'block';
      gerr.textContent = 'Sign-in failed: ' + (e && e.message || e);
    });
  });
}

addEventListener('beforeunload', () => { persist(); Cloud.flush(); });
document.addEventListener('visibilitychange', () => {
  if(document.hidden){ persist(); Cloud.flush(); }
});

window.__V1 = { engine, input, sm, SAVE, Cloud, CONFIG, gameScene, enterGame };
