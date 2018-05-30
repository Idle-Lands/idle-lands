const test = require('ava')

const level = require('./level')

test('Fetch level from experience table', t => {
  t.true(level(0) === 1)
  t.true(level(10) === 1)
  t.true(level(600) === 2)
  t.true(level(999999999999) === 200)
})
