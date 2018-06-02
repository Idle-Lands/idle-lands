const test = require('ava')

const createPlayer = require('./createPlayer')

test('Create a player', t => {
  const player = createPlayer({ provider: 'github', providerPlayerUid: '123' })

  t.truthy(player.uid)
  t.truthy(player.providers[0])
  t.truthy(player.providers[0].uid)
})
