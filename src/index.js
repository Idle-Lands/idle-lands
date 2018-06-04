const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const handlers = require('./handlers')
const memoryDb = require('./memoryDb')

const { map } = require('ramda')

const app = express()
const server = http.createServer(app)
const socketServer = new WebSocket.Server({ server })

const database = memoryDb

socketServer.on('connection', socket => {
  const boundHandlers = map(
    handler => handler({ database, socket }),
    handlers
  )
  socket.on('message', handleSocketMessage(socket, boundHandlers))
  socket.send(JSON.stringify({ type: 'connected' }))
})

const handleSocketMessage = (socket, boundHandlers) => message => {

  const { gatherResource, moveTo } = boundHandlers

  let parsed

  try {
    parsed = JSON.parse(message)
  } catch (e) {
    console.error(e)
    socket.send(`The JSON parser failed to parse your message. Details: ${e.message}`)
    return
  }

  if (parsed.type === 'gatherResource') {
    if (!parsed.payload || !parsed.payload.playerUid) {
      console.error('Invalid payload:', message)
      socket.send('Invalid payload')
      return
    }

    const { playerUid, gatherableUid } = parsed.payload

    try {
      return gatherResource({
        playerUid,
        gatherableUid,
      })
    } catch (e) {
      console.error(e)
      socket.send(`Handler exploded. Details: ${e.message}`)
    }
  }

  if (parsed.type === 'moveTo') {
    if (!parsed.payload || !parsed.payload.playerUid || !parsed.payload.x || !parsed.payload.y) {
      console.error('Invalid payload:', message)
      socket.send('Invalid payload')
      return
    }

    const { x, y, playerUid } = parsed.payload

    try {
      return moveTo({
        playerUid,
        x,
        y,
      })
    } catch (e) {
      console.error(e)
      socket.send(`Handler exploded. Details: ${e.message}`)
    }
  }
}


server.listen(4000, () => console.log(`Server is up on port ${server.address().port}`))
