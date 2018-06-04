1) `yarn`

2) `yarn start`

3) connect a websock client on `localhost:4000`

4) send this messages:

  `{"type":"gatherResource","payload":{"playerUid": "worms", "gatherableUid":"willow_tree"}}`

  or

  `{"type":"moveTo","payload":{"playerUid": "worms", "x":3, "y": 7}}`
