const app = require('express')()
const server = require('http').Server(app)
const handlers = require('./handlers')
const memoryDb = require('./memoryDb')

const io = require('socket.io')

const { map } = require('ramda')

const socketServer = io(server)

const database = memoryDb()

app.get((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Credentials', true)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

socketServer.on('connection', socket => {
  const boundHandlers = map(
    handler => handler({ database, socket }),
    handlers
  )
  socket.on('message', handleSocketMessage(socket, boundHandlers))
  socket.send(JSON.stringify({ type: 'connected' }))
})

server.listen(4000, () => console.log(`Server is up on port ${server.address().port}`))

const handleSocketMessage = (socket, boundHandlers) => message => {

  const { gatherResource, moveTo, bankItems } = boundHandlers

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
    return
  }

  if (parsed.type === 'bankItems') {
    if (!parsed.payload || !parsed.payload.playerUid) {
      console.error('Invalid payload:', message)
      socket.send('Invalid payload')
      return
    }

    const { playerUid } = parsed.payload

    try {
      return bankItems({
        playerUid,
      })
    } catch (e) {
      console.error(e)
      socket.send(`Handler exploded. Details: ${e.message}`)
    }
    return
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
    return
  }

  socket.send(`Invalid type. Valid types are: ${Object.keys(boundHandlers).join(', ')}`)
}


