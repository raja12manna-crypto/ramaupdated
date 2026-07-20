# RAMA — The Retro Game
### Modular architecture · v1.0

Live the Ramayana. Walk the streets of Ayodhya, learn the bow, and take the road of exile.

---

## Running the game

- **Double-click `index.html`** — works directly from disk (classic scripts, no server needed).
- **GitHub Pages / any static host** — upload the whole folder as-is.
- **Firebase (Google login + cloud saves + world leaderboard)** — paste your config into
  **`js/firebase.js`** (one place only, clearly marked). Until then the game runs in
  offline dev mode with local saves.

Old saves carry over automatically (same `rama_v1` localStorage key).

---

## Project structure

```
rama/
├── index.html            Shell: DOM (login gate, canvas, touch controls) + ordered script tags
├── css/
│   └── style.css         All styles
├── js/
│   ├── firebase.js       ⭐ FIREBASE_CONFIG + Cloud adapter (auth, saves, leaderboard)
│   ├── config.js         Global constants (W, H, GROUND)
│   ├── save.js           SAVE state · localStorage + debounced cloud persist
│   ├── audio.js          Chiptune-raga engine (tanpura drone, tabla, melodies, SFX)
│   ├── assets.js         ⭐ Asset Manager — sprite sheets & PNG backgrounds (see below)
│   ├── renderer.js       Canvas, scaling, draw primitives (sky/decor/humans/birds/frames)
│   ├── input.js          Keyboard + touch buttons + pointer (edge-based, drop-proof)
│   ├── data/
│   │   ├── themes.js     Room color palettes
│   │   ├── entries.js    Book of Dharma content
│   │   ├── dialogs.js    Every NPC conversation
│   │   └── rooms.js      World graph: rooms, decor, NPC spawns, exits
│   ├── state.js          G (game state), P (player), NPCS, BIRDS, toast, grantEntry
│   ├── world.js          enterRoom — room entry & transitions
│   ├── player.js         Movement, physics, per-frame room simulation
│   ├── npcs.js           Interaction targeting & dispatch
│   ├── dialogue.js       Dialog & cutscene systems (typewriter, pages, callbacks)
│   ├── training.js       The Bow of Stillness minigame
│   ├── book.js           Book of Dharma UI
│   ├── ui.js             HUD, pause screen
│   ├── story.js          Exile sequence & chapter ending
│   ├── engine.js         Fixed-timestep loop & mode dispatch
│   └── main.js           Boot, login gate, publishes window.RAMA
└── assets/
    ├── sprites/          Character/NPC sprite sheets (PNG)
    ├── backgrounds/      Full-room background paintings (PNG)
    ├── music/            (future) recorded/streamed music
    ├── sfx/              (future) sample-based sound effects
    └── ui/               (future) dialogue frames, icons, fonts
```

### Why classic scripts instead of ES modules?
So the game runs from a double-click (`file://`) with zero tooling. All files share one
global scope; **script order in `index.html` is the dependency graph — don't reorder it.**
The public surface is exposed as **`window.RAMA`** (open DevTools and try
`RAMA.enterRoom('riverside')`).

---

## How to add things

### A new room
1. `js/data/rooms.js` — add a key: `w`, `theme`, `label`, `decor[]`, `npcs[]`,
   `exits:{left/right:{room,x}}`, `spawn`.
2. Wire a neighbour's `exits` to point at it. Done — transitions are automatic.

### A new NPC
1. Spawn them in a room's `npcs:[{id:'boatman', x:480, c:'#3a6a9a'}]`.
2. Add their conversation in `js/data/dialogs.js` under the same id.
   Each line: `['Display Name','Text…']` — append `'entry:some_id'` as a third element
   to grant a Book of Dharma entry.

### A Book of Dharma entry
`js/data/entries.js` → add `{title, text}` under a new id, grant it from a dialog
(above) or in code via `grantEntry('id')` (+10 dharma automatic).

### A PNG background for a room
1. Paint it **`<room width> × 360 px`**, save to `assets/backgrounds/`.
2. Register at boot (e.g. in `main.js` before `startGame`, or from DevTools):
   ```js
   RAMA.Assets.load({ bg_market_street:'assets/backgrounds/market_street.png' });
   ```
3. The renderer automatically uses `bg_<roomId>` when present — and falls back to the
   procedural art when absent. Nothing else to change.

### A character sprite sheet (future actors)
Horizontal strip, equal-width frames. Load via `RAMA.Assets.load({rama_walk:'assets/sprites/rama_walk.png'})`,
then draw with `RAMA.Assets.drawSprite(ctx,'rama_walk',frame,x,y,frameW,frameH,flip)`.
Swap calls inside `renderer.js → drawHuman` per-character when art is ready.

### Music & SFX
Current audio is fully procedural (`js/audio.js`): add a track to `Audio2.TRACKS`
(bpm, root note, 32-step melody over the RAGA scale, 16-step tabla pattern) and play it
with `Audio2.play('name')`. Sample-based audio can later live in `assets/music|sfx`.

### A new chapter
1. Story beats → `js/story.js` (follow the `startExileScene → beginExileWalk → endChapter` pattern).
2. New rooms/NPCs/dialogs → the data files.
3. New modes → add `update*()` + `draw*()` and register both in `js/engine.js` dispatch.
4. Track progress with `SAVE.flags` so resume logic in `main.js` can restore objectives.

---

## Firestore security rules (paste in Firebase console → Firestore → Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /leaderboard/{uid} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

*Independent fan project by Anubhaveshawar Manna. Built with Claude.*
