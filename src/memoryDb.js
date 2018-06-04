const db = {
  worms: {
    inventory: [],
    bank: [],
    intervalId: null,
    coordinates: {
      x: 1,
      y: 1,
    },
  }
}

module.exports = {
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
}
