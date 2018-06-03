const gatherables = require('../models/gatherables')

const pickRandomElement = array => array[Math.floor(Math.random() * array.length)]

const expandLootPackages = gatherable =>
  gatherable.lootPackages.reduce((lootWheel, package) =>
    [
      ...lootWheel,
      ...Array.from({ length: package.weight }).map(() => package.loot)
    ]
    , [])

const pickRandomLoot = pipe(
  expandLootPackages,
  pickRandomElement
)

const attempt = (gatherable, playerUid) =>
  Math.random() < gatherable.chance
    ? {
      playerUid,
      gatherableUid: gatherable.uid,
      timeout: gatherable.timeout,
      timeoutFinishes: Date.now() + gatherable.timeout,
      result: 'success',
      loot: pickRandomLoot(gatherable),
    }
    : {
      playerUid,
      gatherableUid: gatherable.uid,
      timeout: gatherable.timeout,
      timeoutFinishes: Date.now() + gatherable.timeout,
      result: 'miss',
    }

module.exports = async function gatherResource ({ database, playerUid, gatherableUid }) {
  const lastGather = await database.gatherings.find({ playerUid })

  const now = Date.now()
  const { validAt } = lastGather

  if (timeoutFinishes < now) {
    return {
      result: 'fail',
      timeout: now - timeoutFinishes
    }
  }

  const gatherable = gatherables.find(g => gatherableUid === g.uid)
  const response = attempt(gatherable, playerUid)

  return database.gatherings.create(response)
    .then(() => response)
}
