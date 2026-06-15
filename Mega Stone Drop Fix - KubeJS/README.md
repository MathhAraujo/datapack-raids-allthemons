# Mega Stone Drop Fix (KubeJS) — TEST

Removes the **duplicate Mega Stone / Orb** that drops on the ground when a CRD mega/primal
raid boss is defeated.

**Why:** the raid boss holds its Mega Stone, so the captured Pokémon keeps it. Cobblemon
*also* drops that held item on the ground on defeat
(`config/cobblemon/main.json` → `defaultDropItemMethod: "on-entity"`) → 2 copies.
This script cancels that ground drop for exactly those 85 stones/orbs.

## Install

Copy `server_scripts/no_duplicate_mega_stone.js` into `kubejs/server_scripts/`
(in single-player **and** server), then run `/reload` or `/kubejs reload server_scripts`.

On load the log should show:
```
[CRD-StoneFix] Loaded: suppressing duplicate raid mega-stone/orb ground drops (85 items).
```

## Test

1. Beat a **mega** raid (e.g. Houndoom).
2. Expected: **no** stone on the ground, and the **captured** Pokémon still holds the stone (1 total).
3. Sanity check: drop a Mega Stone from your inventory by hand — it should **not** vanish
   (player-thrown items are spared via the thrower check).

## Notes / limitations

- It only touches the 85 exact raid stones/orbs (`mega_showdown:*` + `zamega:*`), nothing else.
- Player-dropped/thrown stones are spared (they have a thrower). If a stone you dropped ever
  disappears, tell me and I'll scope it to raid proximity instead.
- This is a **test version**. If `[CRD-StoneFix]` errors appear in `latest.log`
  (e.g. the `EntityEvents.spawned` cancel or `entity.item` API differs in this KubeJS build),
  send the error line and I'll adjust.
