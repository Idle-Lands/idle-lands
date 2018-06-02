const { MongoClient } = require('mongodb')
const Promise require('bluebird')

const dao = require('./dao')

function build (db) {
  return {
    player: dao.build(db.collection('player')),
    resources: dao.build(db.collection('resources')),
  }
}

function connect (url) {
  return MongoClient
    .connect(url, { promiseLibrary: Promise })
    .then(build)
}

export default {
  connect,
}

