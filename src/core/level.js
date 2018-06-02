const expTable = require('../models/experience-table')

module.exports = experience =>
  expTable.reduce((currentLevel, minimumExp) =>
    experience >= minimumExp
      ? currentLevel + 1
      : currentLevel,
    0
  )

