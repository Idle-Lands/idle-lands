const worldMap = require('../models/worldMap')
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

module.exports = ({ socket, database }) => ({ playerUid }) => {
  const player = database.player(playerUid)
  const tile = worldMap[player.coordinates.y][player.coordinates.x]

  if (tile.type !== 'gatherable') {
    socket.send(JSON.stringify({
      type: 'gatheringInvalid',
    }))
    return
  }

  const gatherable = gatherables.find(g => tile.id === g.uid)

  socket.send(JSON.stringify({
    type: 'gatheringStarted',
  }))

  clearInterval(player.intervalId)
  player.intervalId = setInterval(() => {
    const response = attempt(gatherable, playerUid)
    if (response.type === 'gatheringSuccess') {
      database.giveLoot({ playerUid, loot: response.payload.loot })
    }
    socket.send(JSON.stringify({
      response,
      player: omit(['intervalId'], player)
    }))
  }, gatherable.timeout)
}
