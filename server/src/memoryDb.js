const { mergeWith, add } = require('ramda')

const db = {
  worms: {
    inventory: [],
    bank: {},
    intervalId: null,
    coordinates: {
      x: 1,
      y: 1,
    },
  }
}

module.exports = () => ({
  giveLoot: ({ playerUid, loot }) => {
    const player = db[playerUid]

    loot.forEach(stack => player.inventory = [
      ...player.inventory,
      ...Array.from({ length: stack.amount }).map(() => stack.id),
    ])

    if (player.inventory.length > 20) {
     player.inventory = player.inventory
        .filter(e, i => i < 20)
    }
  },
  player: uid => db[uid],
  setXY: ({ uid, x, y }) => { db[uid].coordinates = { x, y } },
  bankItems: ({ playerUid }) => {
    const player = db[playerUid]
    const toBank = player.inventory.reduce(
      (stack, item) => mergeWith(add, stack, { [item]: 1 }),
      {}
    )
    player.bank = mergeWith(add, player.bank, toBank)
    player.inventory = []
  }
})
