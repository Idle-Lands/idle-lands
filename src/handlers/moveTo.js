const pathfinding = require('pathfinding')
const worldMap = require('../models/worldMap')
const { omit } = require('ramda')

const transformBlockables = grid =>
  grid.map(rows => rows.map(tile => tile.block ? 1 : 0))

const grid = new pathfinding.Grid(transformBlockables(worldMap))
const finder = new pathfinding.AStarFinder()


module.exports = ({ socket, database }) => ({ playerUid, x, y }) => {
  const player = database.player(playerUid)

  socket.send(JSON.stringify({
    type: 'moveStarted',
  }))

  const path = finder.findPath(player.coordinates.x, player.coordinates.y, x, y, grid)
  let step = 0

  clearInterval(player.intervalId)
  player.intervalId = setInterval(() => {

    if (!path[step]) {
      socket.send(JSON.stringify({
        type: 'moveFinished',
        player: omit(['intervalId'], player)
      }))
      clearInterval(player.intervalId)
      return
    }

    player.coordinates.x = path[step][0]
    player.coordinates.y = path[step][1]
    step = step + 1

    socket.send(JSON.stringify({
      type: 'moveHappened',
      player: omit(['intervalId'], player)
    }))
  }, 500)
}
