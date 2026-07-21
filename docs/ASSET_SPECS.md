# RAMA V1 — Asset Specification Sheet
For generating drop-in art from the reference boards via the Asset Loader (Module 2).

## Internal render resolution
**640 × 360px** (CONFIG.WIDTH/HEIGHT). Design all art as if this is the "native" screen —
it scales up integer-crisp to any display via the Engine's canvas scaler.

## Character sprite sheets
- **Frame size: 96 × 96px** per cell (generous canvas for weapon swings/roll extension)
- **Sheet layout:** one row per animation state, frames left→right, uniform frame count
  padded with blank cells if an animation has fewer frames than the widest row
- **Grid is fixed** — `AssetLoader.drawFrame(ctx, key, col, row, 96, 96, x, y, flip)`
  reads directly off column/row, so sheets must follow this row order exactly:

| Row | Animation | Suggested frame count |
|---|---|---|
| 0 | Idle | 4 |
| 1 | Walk | 6 |
| 2 | Run | 6 |
| 3 | Jump (rise/apex/fall) | 3 |
| 4 | Double Jump | 3 |
| 5 | Wall Cling | 2 |
| 6 | Wall Jump | 3 |
| 7 | Roll / Dodge | 5 |
| 8 | Attack — Bow | 4 |
| 9 | Attack — Sword | 5 |
| 10 | Attack — Axe | 5 |
| 11 | Divine Power | 6 |
| 12 | Hurt | 2 |
| 13 | Death | 6 |

- Facing: **draw right-facing only** — the loader flips horizontally for left-facing, so
  never author a separate left sheet (halves art workload).
- Companion (Lakshmana) and enemies reuse the same 96×96 grid with their own row sets
  (see `docs/ANIMATION_STATES.md`, generated when Module 4/7 land).

## Backgrounds — parallax layers
Match the reference board's 4-layer depth read. Each biome (Forest of Tatākā, Sage's
Ashram, Ancient Ruins, Dark Swamp) needs 4 separate PNGs:

| Layer | Width | Height | Scroll factor | Notes |
|---|---|---|---|---|
| Far (sky/silhouette) | 1280px | 360px | 0.12 | tiles seamlessly left-right |
| Mid (large structures/trees) | 1600px | 360px | 0.35 | tiles seamlessly |
| Ground (path/floor) | 320px | ~100px | 1.0 | small repeating tile |
| Foreground (near silhouettes) | 960px | 360px | 1.45 | tiles seamlessly, mostly transparent |

All layers transparent PNG except Far (opaque base). Palette must match
`src/art/palette.js` (already sampled from your boards) until a formal
`data/palette.json` supersedes it.

## Format
PNG, transparent background where applicable, no premultiplied alpha assumptions.

## Manifest format (how you register real art once ready)
```json
{
  "images": {
    "rama_sheet": "assets/sprites/rama.png",
    "bg_forest_far": "assets/backgrounds/forest_far.png",
    "bg_forest_mid": "assets/backgrounds/forest_mid.png"
  },
  "audio": { "theme_forest": "audio/forest_theme.ogg" }
}
```
Load with: `await assets.load(manifest)` — swap-in requires zero gameplay code changes.
