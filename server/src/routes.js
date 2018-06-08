const handlers = require('./handlers')

module.exports = [
  {
    type: 'moveTo',
    validFields: ['playerUid', 'x', 'y'],
    handler: handlers.moveTo,
  },
  {
    type: 'gatherResource',
    validFields: ['playerUid'],
    handler: handlers.gatherResource,
  },
  {
    type: 'bankItems',
    validFields: ['playerUid'],
    handler: handlers.bankItems,
  }
]
