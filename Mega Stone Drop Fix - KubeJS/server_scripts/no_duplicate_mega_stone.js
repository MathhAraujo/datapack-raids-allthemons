// CRD mega/primal raids — remove the duplicate Mega Stone / Orb ground drop.
//
// The raid boss holds its Mega Stone (or Orb), so the captured Pokémon keeps it.
// Cobblemon ALSO drops that held item on the ground when the boss is defeated
// (config/cobblemon/main.json -> defaultDropItemMethod = "on-entity"), producing a 2nd copy.
// This script cancels that ground drop for exactly those stones/orbs, while sparing
// items a player intentionally dropped/threw (those have a thrower).
//
// TEST VERSION. If "[CRD-StoneFix]" errors show up in latest.log, send the line over so the API can be adjusted.

const RAID_STONES = new Set([
  'mega_showdown:abomasite',
  'mega_showdown:absolite',
  'mega_showdown:aerodactylite',
  'mega_showdown:aggronite',
  'mega_showdown:alakazite',
  'mega_showdown:altarianite',
  'mega_showdown:ampharosite',
  'mega_showdown:audinite',
  'mega_showdown:banettite',
  'mega_showdown:beedrillite',
  'mega_showdown:blastoisinite',
  'mega_showdown:blazikenite',
  'mega_showdown:blue_orb',
  'mega_showdown:cameruptite',
  'mega_showdown:diancite',
  'mega_showdown:galladite',
  'mega_showdown:garchompite',
  'mega_showdown:gardevoirite',
  'mega_showdown:gengarite',
  'mega_showdown:glalitite',
  'mega_showdown:gyaradosite',
  'mega_showdown:heracronite',
  'mega_showdown:houndoominite',
  'mega_showdown:kangaskhanite',
  'mega_showdown:latiasite',
  'mega_showdown:latiosite',
  'mega_showdown:lopunnite',
  'mega_showdown:lucarionite',
  'mega_showdown:manectite',
  'mega_showdown:mawilite',
  'mega_showdown:medichamite',
  'mega_showdown:metagrossite',
  'mega_showdown:pidgeotite',
  'mega_showdown:pinsirite',
  'mega_showdown:red_orb',
  'mega_showdown:sablenite',
  'mega_showdown:salamencite',
  'mega_showdown:sceptilite',
  'mega_showdown:scizorite',
  'mega_showdown:sharpedonite',
  'mega_showdown:slowbronite',
  'mega_showdown:steelixite',
  'mega_showdown:swampertite',
  'mega_showdown:tyranitarite',
  'mega_showdown:venusaurite',
  'zamega:barbaracite',
  'zamega:baxcalibrite',
  'zamega:chandelurite',
  'zamega:chesnaughtite',
  'zamega:chimechite',
  'zamega:clefablite',
  'zamega:crabominite',
  'zamega:darkranite',
  'zamega:delphoxite',
  'zamega:dragalgite',
  'zamega:dragoninite',
  'zamega:drampanite',
  'zamega:eelektrossite',
  'zamega:emboarite',
  'zamega:excadrite',
  'zamega:falinksite',
  'zamega:feraligite',
  'zamega:floettite',
  'zamega:froslassite',
  'zamega:glimmoranite',
  'zamega:golisopite',
  'zamega:golurkite',
  'zamega:greninjite',
  'zamega:hawluchanite',
  'zamega:heatranite',
  'zamega:magearnite',
  'zamega:malamarite',
  'zamega:meganiumite',
  'zamega:meowsticite',
  'zamega:pyroarite',
  'zamega:scolipite',
  'zamega:scovillainite',
  'zamega:scraftinite',
  'zamega:skarmorite',
  'zamega:staraptite',
  'zamega:starminite',
  'zamega:tatsugirinite',
  'zamega:victreebelite',
  'zamega:zeraorite',
  'zamega:zygardite'
])

EntityEvents.spawned(event => {
  const entity = event.entity
  if (!entity || entity.type !== 'minecraft:item') return

  let stack
  try { stack = entity.item } catch (err) { return }
  if (!stack || stack.isEmpty()) return

  if (!RAID_STONES.has(String(stack.id))) return

  // Spare stones a player dropped/threw on purpose (player drops have a thrower).
  try {
    if (entity.thrower) return
  } catch (ignored) {}

  try {
    event.cancel()
  } catch (err) {
    try { entity.discard() } catch (e2) {}
  }
})

console.info('[CRD-StoneFix] Loaded: suppressing duplicate raid mega-stone/orb ground drops (' + RAID_STONES.size + ' items).')
