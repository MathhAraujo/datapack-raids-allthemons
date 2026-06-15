# Custom Raids CRD — Datapack

Datapack with custom **tier 6/7 encounters (bosses)** and **loot tables** for the
**Cobblemon Raid Dens (CRD) v0.11.0** mod, in the **All the Mons** modpack
(Minecraft 1.21.1, NeoForge).

- Data namespace: `cobblemonraiddens`
- `pack_format`: 48
- Contents: **292 bosses** (`data/cobblemonraiddens/raid/boss/`) + **7 loot tables** (`data/cobblemonraiddens/loot_table/raid/tier/`)

## Requirements

- Minecraft **1.21.1** / NeoForge
- **Cobblemon Raid Dens 0.11.0** installed (already bundled in the All the Mons modpack)
- This is a **data-only** pack (no assets). Only the side that **runs the world** needs it:
  in single-player that's your instance; on a server it's only the server —
  **players don't install anything**.

---

## Installation — Single-player

1. Find the world folder: `.../saves/<your_world>/`
2. Copy the whole **`Custom Raids CRD - DP 1.0.0 1.21.1`** folder into:
   ```
   saves/<your_world>/datapacks/
   ```
   (The `pack.mcmeta` must be at the folder root. A folder or a `.zip` both work.)
3. Enter the world and run `/reload` (or reload the world).
4. Confirm with `/datapack list` — it should appear as enabled.

## Installation — Dedicated server

1. Stop the server (or get ready to run `/reload`).
2. Find the world name in `server.properties` → `level-name` field (default: `world`).
3. Copy the **`Custom Raids CRD - DP 1.0.0 1.21.1`** folder into:
   ```
   <server>/<level-name>/datapacks/
   ```
4. Start the server (or run `/reload`).
5. Confirm with `/datapack list` and check the **console** — JSON errors show up at load time.

---

## Related configuration (separate from the datapack)

Some settings live in `config/cobblemonraiddens/*.json5`, **not** in the datapack:

- **Tier 6 boss level (90)** → already embedded in the datapack files.
- **Reward level, spawn rates, currency, IVs** → in `tier_*.json5` / `common.json5`.
  If you customized these in the single-player instance, **copy those same `.json5` files**
  to the server's `config/cobblemonraiddens/` — otherwise it uses the mod defaults.

> The advancement-based spawn progression (`raid_tier_progression.js` script) is a
> **separate** feature: it goes in `kubejs/server_scripts/` and is not part of this datapack.

---

## Contents overview

**Bosses:** tier 6 (megas, ultra beasts, paradoxes, starters/pseudo-legendaries with Tera, etc.)
and tier 7 (Tera with alternate forms, legendary megas, primals).
Megas hold their respective Mega Stone (the reward Pokémon comes with the stone).

**Loot tables (7 tiers):** based on the mod's originals, with:
- Bonus pool running on **every** raid (no catching charm required)
- Premium items scaled per tier (Shiny Card, Master Candy, Cobblemax, Silver/Shining Caps, Golden Cap, Blank-Z)
- Vitamins (1–3 types per raid) and Poké Treats
- Tera Shards / Max Mushrooms / Shadow Shards drops preserved per the raid's feature

## Notes

- Overwriting a tier's file affects the loot of **all** raids of that tier.
- In **mega** raids, the Mega Stone comes on the captured Pokémon **and** one also drops
  on the ground (default Cobblemon behavior on defeat — 2 stones total; intentional).
