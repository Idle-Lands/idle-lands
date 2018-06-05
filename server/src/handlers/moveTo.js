const pathfinding = require('pathfinding')
const worldMap = require('../models/worldMap')
const { omit } = require('ramda')

const transformBlockables = grid =>
  grid.map(rows => rows.map(tile => tile.block ? 1 : 0))

const grid = new pathfinding.Grid(transformBlockables(worldMap))
const finder = new pathfinding.AStarFinder()


module.exports = ({ socket, database }) => ({ playerUid, x, y }) => {

  socket.send(JSON.stringify({
    type: 'moveStarted',
  }))

  const player = database.player(playerUid)

  const path = finder.findPath(player.coordinates.x, player.coordinates.y, x, y, grid.clone())

  if (path.length === 0) {
    socket.send(JSON.stringify({
      type: 'moveFinished',
      player: omit(['intervalId'], player)
    }))
    clearInterval(player.intervalId)
    return
  }

  let step = 0

  clearInterval(player.intervalId)
  player.intervalId = setInterval(() => {

    database.setXY({
      uid: playerUid,
      x: path[step][0],
      y: path[step][1],
    })

    if (!path[step + 1]) {
      socket.send(JSON.stringify({
        type: 'moveFinished',
        player: omit(['intervalId'], player)
      }))
      clearInterval(player.intervalId)
      return
    }

    socket.send(JSON.stringify({
      type: 'moveHappened',
      player: omit(['intervalId'], player)
    }))

    step = step + 1
  }, 300)
}
