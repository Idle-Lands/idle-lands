const express = require('express')
const bodyParser = require('body-parser')
const db = require('./database')
const routes = require('./routes')

async function start () {
  const app = express()
  const database = await db.connect('localhost:3000')

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.post('/createPlayer', function (req, res) {
    const player = routes.createPlayer({
      provider: req.body.provider,
      providerPlayerUid: req.body.providerPlayerUid,
      database,
    })
      .then(res.send)
  })

  app.post('/gatherResource', function (req, res) {
    const result = routes.gatherResource({
      playerUid: req.body.playerUid,
      gatherableUid: req.body.gatherableUid,
      database,
    })
      .then(res.send)
  })
}

start()
