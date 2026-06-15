# Raid spawn progression (KubeJS) — installation and testing

This system is **not a datapack**. It's a KubeJS script that dynamically changes the
Cobblemon Raid Dens tier spawn weights based on server progress.

## What it does

Per-tier spawn weights (`dimension_tier_weights`, overworld), in 3 **server-wide** stages:

| Stage | Condition (aggregated across all players) | Weights T1..T7 |
|---|---|---|
| 0 — default | nothing yet | `[9,15,25,25,20,5,1]` |
| 1 — T6 boost | complete **≥1** series: Radical Red **or** Unbound **or** Content Creators **or** ATM Team | `[5,10,10,15,30,25,5]` |
| 2 — T7 boost | complete **ALL 4 series** **+** craft the pika star | `[5,5,10,10,25,25,20]` |

- **Aggregated:** each milestone counts once, from any player. E.g.: A completes Radical Red + Unbound, B completes Content Creators + ATM Team, and anyone crafts the pika star → the T7 boost activates for the whole server.
- Progress is saved in the world (`server.persistentData`) and survives restarts.
- In single-player the behavior is identical (there's only one player).

### Milestones used (advancements)

- **Pika star:** `allthemons:unbound_pika_star`
- **Radical Red:** champion Terry → `rctmod:trainers/defeat_champion_terry`
- **Unbound:** champion Jax → `rctmod:trainers/defeat_champion_jax`
- **Content Creators:** the 10 `rctmod:trainers/defeat_contentcreators_*`
- **ATM Team:** `rctmod:trainers/defeat_team_allthemods_all_custom_gym` + `..._all_wandering`

(They're at the top of the `.js`, easy to edit if you want to change the criteria.)

## Installation

Copy the `server_scripts/` folder (with `raid_tier_progression.js`) into `kubejs/`
**in BOTH places**:

1. **Single-player:** `.../All the Mons - ATMons/kubejs/server_scripts/`
2. **Server:** `<server folder>/kubejs/server_scripts/`

Result: `kubejs/server_scripts/raid_tier_progression.js`

Then run in-game:
```
/reload
```
or
```
/kubejs reload server_scripts
```
(or restart the world/server).

## How to test

1. Enter the world and check the log (latest.log) for the line `[CRD-Prog] Loaded. Stage ... : 0`.
2. Force a milestone to test without grinding:
   - Grant a series advancement, e.g.: `/advancement grant @s only rctmod:trainers/defeat_champion_terry`
   - The log should show `Milestone '...' registered ... Current stage: 1` and `Stage 1 applied. Weights ...`.
3. Check the effect: open `config/cobblemonraiddens/common.json5` — the overworld
   `dimension_tier_weights` should have changed to the stage's set.
4. For the T7 boost: grant the 4 series + `allthemons:unbound_pika_star`.
   - Shortcut for the 4 series (example): grant terry, jax, the 10 contentcreators, and the 2 all_* of the ATM team.
5. To reset the test: removing it via `/data modify` isn't trivial here; to clear, delete the
   `crd_progression` key from the world's persistentData (or start a test world).

## ⚠️ Point to validate in-game

The weight swap accesses the CRD Cloth Config holder at runtime
(`AutoConfig.getConfigHolder(RaidConfig)` → mutates `dimension_tier_weights` → `save()`).
This should work and reflect on the next raid spawns. **If** you see
`[CRD-Prog] FAILED to apply weights ...` in the log, send me the error line (it
includes the field type) and I'll adjust the access method. If the mod uses a cache
built at load time, an extra `/reload` or restart may be needed for the new weight to
take effect — that can also be worked around in the script if needed.
