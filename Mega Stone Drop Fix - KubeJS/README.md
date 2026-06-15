# Mega Stone Drop Fix (KubeJS)

Removes the **duplicate Mega Stone / Orb** that drops on the ground when a CRD mega/primal
raid boss is defeated.

**Why:** the raid boss holds its Mega Stone, so the captured Pokémon keeps it. Cobblemon
*also* drops that held item on the ground on defeat
(`config/cobblemon/main.json` → `defaultDropItemMethod: "on-entity"`) → 2 copies.
This script removes that ground drop for exactly those 85 stones/orbs, so you get just one
(on the captured Pokémon).

## Install

Copy `server_scripts/no_duplicate_mega_stone.js` into `kubejs/server_scripts/`
(in single-player **and** server), then run `/reload` or `/kubejs reload server_scripts`.

On load the log shows:
```
[CRD-StoneFix] Loaded: removing duplicate raid mega-stone/orb ground drops (85 items).
```

## Notes

- It only touches the 85 exact raid stones/orbs (`mega_showdown:*` + `zamega:*`), nothing else.
- Stones a player dropped/threw on purpose are spared (those have a thrower).
- Server-side only — players don't install anything.
