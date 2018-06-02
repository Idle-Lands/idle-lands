const cuid = require('cuid')

module.exports = services => ({ provider, providerPlayerUid }) =>
  ({
    uid: cuid(),
    providers: [
      {
        name: provider,
        uid: providerPlayerUid,
      },
    ],
  })
