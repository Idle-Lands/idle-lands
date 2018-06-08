const { omit } = require('ramda')

module.exports = ({ socket, database }) => ({ playerUid }) => {
  const player = database.player(playerUid)

  socket.send(JSON.stringify({
    type: 'updateState',
    payload: {
      player: omit(['intervalId'], player),
    },
  }))
}
