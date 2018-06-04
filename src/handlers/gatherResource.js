const gatherables = require('../models/gatherables')
const { pipe, omit } = require('ramda')

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

const attempt = (gatherable, playerUid, now) => {
  if (Math.random() < gatherable.chance) {
    return {
      type: 'gatheringSuccess',
      payload: {
        loot: pickRandomLoot(gatherable),
      }
    }
  }

  return {
    type: 'gatheringFail',
  }
}

module.exports = services => ({ playerUid, gatherableUid }) => {
  const gatherable = gatherables.find(g => gatherableUid === g.uid)
  const player = services.database.player(playerUid)

  services.socket.send(JSON.stringify({
    type: 'gatheringStarted',
  }))

  clearInterval(player.intervalId)
  player.intervalId = setInterval(() => {
    const response = attempt(gatherable, playerUid)
    if (response.type === 'gatheringSuccess') {
      services.database.giveLoot({ playerUid, loot: response.payload.loot })
    }
    services.socket.send(JSON.stringify({
      response,
      player: omit(['intervalId'], player)
    }))
  }, gatherable.timeout)
}
