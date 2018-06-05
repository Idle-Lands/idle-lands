const worldMap = require('../models/worldMap')
const { omit } = require('ramda')

module.exports = ({ socket, database }) => ({ playerUid }) => {
  const player = database.player(playerUid)
  const tile = worldMap[player.coordinates.y][player.coordinates.x]

  if (tile.type !== 'building' || tile.id !== 'bank') {
    socket.send(JSON.stringify({
      type: 'bankFail',
    }))
    return
  }

  clearInterval(player.intervalId)

  database.bankItems({ playerUid })

  socket.send(JSON.stringify({
    type: 'bankSuccess',
    player: omit(['intervalId'], player),
  }))
}
