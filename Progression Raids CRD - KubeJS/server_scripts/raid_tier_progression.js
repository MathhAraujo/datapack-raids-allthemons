// =============================================================================
//  Raid tier spawn progression (Cobblemon Raid Dens) — All the Mons
// =============================================================================
//  Dynamically changes the CRD tier spawn weights (dimension_tier_weights)
//  based on the server's AGGREGATE progress (the sum of all players).
//
//  STAGES (server-wide):
//    Stage 0 (default) ............................ [9,15,25,25,20,5,1]
//    Stage 1 (T6 boost): complete >=1 of the 4 series  [5,10,10,15,30,25,5]
//    Stage 2 (T7 boost): complete ALL 4 series
//                        + craft the pika star ...  [5,5,10,10,25,25,20]
//
//  State is stored in server.persistentData (survives restarts).
//  It is AGGREGATE: each milestone advancement counts once, from any player.
//
//  INSTALL: copy this file into  kubejs/server_scripts/  on BOTH your single
//  player instance AND the server. Then run /reload (or
//  /kubejs reload server_scripts), or restart.
//
//  *** IN-GAME VALIDATION ***  Weight swapping uses the CRD Cloth Config holder.
//  If anything fails, the [CRD-Prog] log line will show the error and the type
//  of the dimension_tier_weights field — send me that log and I'll fix the access.
// =============================================================================

// ---- weights per stage (tiers 1..7) ----
const WEIGHTS = {
  0: [9.0, 15.0, 25.0, 25.0, 20.0, 5.0, 1.0],
  1: [5.0, 10.0, 15.0, 15.0, 30.0, 20.0, 5.0],
  2: [5.0, 5.0, 10.0, 15.0, 25.0, 25.0, 15.0],
}

const DIMENSION = "minecraft:overworld"

// pika star (any player): advancement earned when crafting the first pika star
const ADV_PIKASTAR = "allthemons:unbound_pika_star"

// advancements that mark COMPLETION of each RCT series (all in the list = series done)
const SERIES = {
  radicalred:      ["rctmod:trainers/defeat_champion_terry"],
  unbound:         ["rctmod:trainers/defeat_champion_jax"],
  contentcreators: [
    "rctmod:trainers/defeat_contentcreators_bucketst",
    "rctmod:trainers/defeat_contentcreators_chosenarchitect",
    "rctmod:trainers/defeat_contentcreators_danrique",
    "rctmod:trainers/defeat_contentcreators_direwolf20",
    "rctmod:trainers/defeat_contentcreators_joeychin01",
    "rctmod:trainers/defeat_contentcreators_mitinhoplayer",
    "rctmod:trainers/defeat_contentcreators_nofaxu",
    "rctmod:trainers/defeat_contentcreators_pilpoh",
    "rctmod:trainers/defeat_contentcreators_princessstellar",
    "rctmod:trainers/defeat_contentcreators_virtuositas",
  ],
  atm_team: [
    "rctmod:trainers/defeat_team_allthemods_all_custom_gym",
    "rctmod:trainers/defeat_team_allthemods_all_wandering",
  ],
}

const PDATA_KEY = "crd_progression" // stores the set of earned milestone advancements

// list of every tracked advancement
const TRACKED = (() => {
  let arr = [ADV_PIKASTAR]
  for (let k in SERIES) arr = arr.concat(SERIES[k])
  return arr
})()

// ---- state (persisted as JSON in server.persistentData) ----
function loadEarned(server) {
  let raw = server.persistentData.getString(PDATA_KEY)
  if (!raw) return {}
  try { return JSON.parse(raw) } catch (e) { return {} }
}

function saveEarned(server, earned) {
  server.persistentData.putString(PDATA_KEY, JSON.stringify(earned))
}

function seriesDone(earned, name) {
  return SERIES[name].every(a => earned[a] === true)
}

function computeStage(earned) {
  let total = Object.keys(SERIES).length
  let done = 0
  for (let k in SERIES) if (seriesDone(earned, k)) done++
  let pika = earned[ADV_PIKASTAR] === true
  if (done >= total && pika) return 2
  if (done >= 1) return 1
  return 0
}

// ---- apply the weights to the CRD config (Cloth Config holder) ----
function applyWeights(server, stage) {
  let w = WEIGHTS[stage]
  try {
    let $AutoConfig = Java.loadClass("me.shedaniel.autoconfig.AutoConfig")
    let $RaidConfig = Java.loadClass("com.necro.raid.dens.common.config.RaidConfig")
    let $DoubleStream = Java.loadClass("java.util.stream.DoubleStream")
    let holder = $AutoConfig.getConfigHolder($RaidConfig)
    let cfg = holder.getConfig()
    let map = cfg.dimension_tier_weights

    // find the dimension key (it may be a String or a ResourceLocation).
    // Note: map.keySet().toArray() is an Object[] (indexable in Rhino), unlike the
    // primitive double[] value which is NOT indexable here.
    let foundKey = null
    let keys = map.keySet().toArray()
    for (let i = 0; i < keys.length; i++) {
      if (("" + keys[i]) === DIMENSION) { foundKey = keys[i]; break }
    }

    if (foundKey === null) {
      console.warn("[CRD-Prog] Dimension " + DIMENSION + " was not present in the config; nothing applied.")
      return
    }

    // The value is a primitive double[], which KubeJS's Rhino won't let us index or
    // mutate (and java.lang.reflect.Array is blocked). So build a fresh double[]
    // via DoubleStream and replace the map entry, then persist.
    let arr = $DoubleStream.of(w[0], w[1], w[2], w[3], w[4], w[5], w[6]).toArray()
    map.put(foundKey, arr)
    holder.save() // persists to common.json5 and updates the in-memory config

    // CRD picks the raid tier from a cached weighted map (RaidTier.RANDOM_MAP),
    // which is only rebuilt by RaidTier.updateRandom() (on init / datapack reload).
    // Call it here so the new weights take effect immediately, without a reload.
    Java.loadClass("com.necro.raid.dens.common.data.raid.RaidTier").updateRandom()

    console.log("[CRD-Prog] Stage " + stage + " applied + RANDOM_MAP refreshed. Weights for " + DIMENSION + " = " + w)
  } catch (err) {
    console.error("[CRD-Prog] FAILED to apply weights (stage " + stage + "): " + err)
  }
}

// ---- events ----

// when any milestone advancement is earned, record it (aggregate) and re-evaluate the stage
PlayerEvents.advancement(event => {
  let id = "" + event.advancement.id
  if (TRACKED.indexOf(id) < 0) return

  let server = event.player.server
  let earned = loadEarned(server)
  if (earned[id] === true) return // already counted

  earned[id] = true
  saveEarned(server, earned)

  let stage = computeStage(earned)
  applyWeights(server, stage)
  console.log("[CRD-Prog] Milestone '" + id + "' recorded (server-wide). Current stage: " + stage)
})

// when the server/world loads, re-apply the current stage (safety after restart)
ServerEvents.loaded(event => {
  let server = event.server
  let stage = computeStage(loadEarned(server))
  applyWeights(server, stage)
  console.log("[CRD-Prog] Loaded. Raid progression stage: " + stage)
})
