const worldMap = require('../models/worldMap')
const gatherables = require('../models/gatherables')
const { pipe, omit, mergeWith, merge } = require('ramda')

const pickRandomElement = array => array[Math.floor(Math.random() * array.length)]

const expandLootPackages = gatherable =>
  gatherable.lootPackages.reduce((lootWheel, package) =>
    [
      ...lootWheel,
      ...Array.from({ length: package.weight }).map(() => package.loot)
    ],
    []
  )

const pickRandomLoot = pipe(
  expandLootPackages,
  pickRandomElement
)

const attempt = (gatherable, playerUid, now) => {
  if (Math.random() < gatherable.chance) {
    const loot = pickRandomLoot(gatherable)
    return {
      type: 'updateState',
      payload: {
        loot,
      }
    }
  }

  return {
    type: 'updateState',
    payload: {
      loot: null,
    },
  }
}

module.exports = ({ socket, database }) => ({ playerUid }) => {
  const player = database.player(playerUid)
  const tile = worldMap[player.coordinates.y][player.coordinates.x]

  if (tile.type !== 'gatherable') {
    socket.send(JSON.stringify({
      type: 'gatheringInvalid',
      meta: 'You are not in a valid gathering field.',
      error: true,
    }))
    return
  }

  const gatherable = gatherables.find(g => tile.id === g.uid)

  clearInterval(player.intervalId)
  player.intervalId = setInterval(() => {
    const response = attempt(gatherable, playerUid)

    if (response.payload.loot) {
      database.giveLoot({ playerUid, loot: response.payload.loot })
    }

    socket.send(JSON.stringify(mergeWith(merge,
      response,
      {
        payload: {
          player,
        },
      }
    )))
  }, gatherable.timeout)
}

