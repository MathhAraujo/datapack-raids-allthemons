// CRD mega/primal raids — remove the duplicate Mega Stone / Orb ground drop.
//
// The raid boss holds its Mega Stone (or Orb), so the captured Pokémon keeps it.
// Cobblemon ALSO drops that held item on the ground when the boss is defeated
// (config/cobblemon/main.json -> defaultDropItemMethod = "on-entity"), producing a 2nd copy.
// This removes that ground drop for exactly those 85 stones/orbs, while sparing items a
// player dropped/threw on purpose (those have a thrower).
//
// Removal is done both at spawn time and again on the next tick (the reliable path).

const RAID_STONES = new Set([
  'mega_showdown:abomasite','mega_showdown:absolite','mega_showdown:aerodactylite','mega_showdown:aggronite',
  'mega_showdown:alakazite','mega_showdown:altarianite','mega_showdown:ampharosite','mega_showdown:audinite',
  'mega_showdown:banettite','mega_showdown:beedrillite','mega_showdown:blastoisinite','mega_showdown:blazikenite',
  'mega_showdown:blue_orb','mega_showdown:cameruptite','mega_showdown:diancite','mega_showdown:galladite',
  'mega_showdown:garchompite','mega_showdown:gardevoirite','mega_showdown:gengarite','mega_showdown:glalitite',
  'mega_showdown:gyaradosite','mega_showdown:heracronite','mega_showdown:houndoominite','mega_showdown:kangaskhanite',
  'mega_showdown:latiasite','mega_showdown:latiosite','mega_showdown:lopunnite','mega_showdown:lucarionite',
  'mega_showdown:manectite','mega_showdown:mawilite','mega_showdown:medichamite','mega_showdown:metagrossite',
  'mega_showdown:pidgeotite','mega_showdown:pinsirite','mega_showdown:red_orb','mega_showdown:sablenite',
  'mega_showdown:salamencite','mega_showdown:sceptilite','mega_showdown:scizorite','mega_showdown:sharpedonite',
  'mega_showdown:slowbronite','mega_showdown:steelixite','mega_showdown:swampertite','mega_showdown:tyranitarite',
  'mega_showdown:venusaurite','zamega:barbaracite','zamega:baxcalibrite','zamega:chandelurite','zamega:chesnaughtite',
  'zamega:chimechite','zamega:clefablite','zamega:crabominite','zamega:darkranite','zamega:delphoxite',
  'zamega:dragalgite','zamega:dragoninite','zamega:drampanite','zamega:eelektrossite','zamega:emboarite',
  'zamega:excadrite','zamega:falinksite','zamega:feraligite','zamega:floettite','zamega:froslassite',
  'zamega:glimmoranite','zamega:golisopite','zamega:golurkite','zamega:greninjite','zamega:hawluchanite',
  'zamega:heatranite','zamega:magearnite','zamega:malamarite','zamega:meganiumite','zamega:meowsticite',
  'zamega:pyroarite','zamega:scolipite','zamega:scovillainite','zamega:scraftinite','zamega:skarmorite',
  'zamega:staraptite','zamega:starminite','zamega:tatsugirinite','zamega:victreebelite','zamega:zeraorite',
  'zamega:zygardite'
])

function readItemId(entity) {
  let stack = null
  try { stack = entity.item } catch (e) {}
  if (!stack) { try { stack = entity.getItem() } catch (e) {} }
  if (!stack) return null
  let id = null
  try { if (stack.id) id = String(stack.id) } catch (e) {}
  if (!id) { try { id = String(stack.getId()) } catch (e) {} }
  if (!id) { try { id = String(stack.kjs$getId()) } catch (e) {} }
  if (!id) { try { id = String(Item.getId(stack)) } catch (e) {} }
  return id
}

function getServer(entity) {
  try { if (entity.server) return entity.server } catch (e) {}
  try { if (entity.level && entity.level.server) return entity.level.server } catch (e) {}
  try { if (entity.getServer) return entity.getServer() } catch (e) {}
  try { if (Utils.server) return Utils.server } catch (e) {}
  return null
}

function remove(entity) {
  let ok = false
  try { entity.discard(); ok = true } catch (e) {}
  if (!ok) { try { entity.kill() } catch (e) {} }
}

EntityEvents.spawned(event => {
  const entity = event.entity
  if (!entity) return
  let type = ''
  try { type = String(entity.type) } catch (e) {}
  if (type !== 'minecraft:item') return

  const id = readItemId(entity)
  if (!id || !RAID_STONES.has(id)) return

  // Spare stones a player dropped/threw on purpose (death/loot drops have no thrower).
  try { if (entity.thrower) return } catch (e) {}

  try { event.cancel() } catch (e) {}
  remove(entity)
  const server = getServer(entity)
  if (server && server.scheduleInTicks) {
    try { server.scheduleInTicks(1, () => remove(entity)) } catch (e) {}
  }
})

console.info('[CRD-StoneFix] Loaded: removing duplicate raid mega-stone/orb ground drops (' + RAID_STONES.size + ' items).')
