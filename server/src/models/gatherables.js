const simplePackage = ({ weight, id, amount }) =>
  ({
    weight,
    loot: [
      {
        id,
        amount,
      },
    ],
  })

module.exports = [
  {
    uid: 'willow_tree',
    name: 'Willow',
    timeout: 1200,
    chance: 0.1,
    lootPackages: [
      simplePackage({ weight: 120, id: 'willow_log', amount: 1 }),
      simplePackage({ weight: 9, id: 'willow_log', amount: 3 }),
      simplePackage({ weight: 1, id: 'willow_log', amount: 5 }),
    ],
  },
]
