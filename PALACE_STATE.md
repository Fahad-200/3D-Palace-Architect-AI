---
# PALACE_STATE — Abandoned German-Mediterranean Palace
# STATUS: IN DEVELOPMENT — KNOWN ISSUES EXIST
---

## How to Run
python3 -m http.server 8080 from palace/ directory. Open http://localhost:8080

## Controls
WASD — Move | Mouse — Look | Space — Jump | Shift — Sprint | C — Crouch
ESC — Pause | Tab — Debug room labels

## Architecture
Three.js r165 ES modules via importmap. No build tool required.

## Known Issues
- Collision resolution is order-dependent (X resolved before Z) — corner cases may pinch player.
- NaN scrubbers in engine.js fix vertex data but do not fix the upstream bug.
- Some procedural geometry uses non-deterministic Math.random() — hard to reproduce exact states.
- Audio tightly coupled to trigger positions (piano chord, wind near windows, water drip).
- Horizontal collision skips objectHeight === 0 boxes.
- Ground snapping uses a 0.5 m tolerance band.
- Debug labels churn DOM each frame when enabled.
- Most materials only have color maps; normal/roughness maps limited.
- inline styles in index.html, CDN-only importmap.
- PALACE_STATE.md previously claimed "no issues" — rectified.

## File Registry
[DONE]  index.html
[DONE]  src/state.js
[DONE]  src/engine.js
[DONE]  src/player.js
[DONE]  src/collision.js
[DONE]  src/materials.js
[DONE]  src/lighting.js
[DONE]  src/audio.js
[DONE]  src/atmosphere.js
[DONE]  src/world/shell.js
[DONE]  src/world/exterior.js
[DONE]  src/world/stairs.js
[DONE]  src/world/floor1_foyer.js
[DONE]  src/world/floor1_greathall.js
[DONE]  src/world/floor1_gallery.js
[DONE]  src/world/floor1_kitchen.js
[DONE]  src/world/floor2_ballroom.js
[DONE]  src/world/floor2_library.js
[DONE]  src/world/floor2_chapel.js
[DONE]  src/world/floor3_master.js
[DONE]  src/world/floor3_guests.js
[DONE]  src/world/floor4_observatory.js
[DONE]  src/world/floor4_attic.js
[DONE]  src/world/basement.js
