const app = require('express')()
const server = require('http').Server(app)
const handlers = require('./handlers')
const memoryDb = require('./memoryDb')
const routes = require('./routes')

const io = require('socket.io')

const {
  __,
  has,
  head,
  tap,
  and,
  isEmpty,
  prop,
  reduce,
  not,
  equals,
  map,
  isNil,
  complement,
  pipe,
  filter,
  find,
} = require('ramda')

const socketServer = io(server)

const database = memoryDb()

app.get((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Credentials', true)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

socketServer.on('connection', socket => {
  socket.on('message', handleSocketMessage(socket))
  socket.send(JSON.stringify({ type: 'connected' }))
})

server.listen(4000, () => console.log(`Server is up on port ${server.address().port}`))

const handleSocketMessage = socket => message => {
  const exists = complement(isNil)

  let parsed

  try {
    parsed = JSON.parse(message)
  } catch (e) {
    console.error(e)
    socket.send(JSON.stringify({
      type: 'invalidMessage',
      error: true,
      meta: `The JSON parser failed to parse your message. Details: ${e.message}`,
    }))
    return
  }

  const matchType = pipe(
    prop('type'),
    equals(parsed.type)
  )

  const selectedHandler = find(matchType, routes)

  if(!exists(selectedHandler)) {
    console.error('Invalid route:', message)
    socket.send(JSON.stringify({
      type: 'invalidMessage',
      error: true,
      meta: `Invalid route. Valid routes are: ${routes.join(', ')}`,
    }))
    return
  }

  const missing = complement(has)

  const isInvalid = (payload, fields) =>
    !payload || find(missing(__, payload), fields)

  const { validFields, handler } = selectedHandler

  if (isInvalid(parsed.payload, validFields)) {
    console.error('Invalid payload:', message)
    socket.send(JSON.stringify({
      type: 'invalidMessage',
      error: true,
      meta: `Invalid payload. Payload must have: ${validFields.join(', ')}`,
    }))
    return
  }

  const boundHandler = handler({ socket, database })

  try {
    return boundHandler(parsed.payload)
  } catch (e) {
    console.error(e)
    socket.send(JSON.stringify({
      type: 'invalidMessage',
      error: true,
      meta: `Handler exploded. Details: ${e.message}`,
    }))
  }
}


