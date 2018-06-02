const cuid = require('cuid')

module.exports = ({ provider, providerPlayerUid }) =>
  ({
    uid: cuid(),
    providers: [
      {
        name: provider,
        uid: providerPlayerUid,
      },
    ],
  })
