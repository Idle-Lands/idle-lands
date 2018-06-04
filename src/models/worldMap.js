
const _ = { type: 'empty', block: false }
const X = { type: 'wall', block: true }
const W = { type: 'gatherable', id: 'willow_tree', block: true }
const B = { type: 'building', id: 'bank', block: true }

module.exports = [
  [X, X, X, X, X],
  [X, _, B, _, X],
  [X, _, _, _, X],
  [X, X, X, _, X],
  [X, _, _, _, X],
  [X, _, X, X, X],
  [X, _, X, X, X],
  [X, _, _, _, X],
  [X, _, W, _, X],
  [X, X, X, X, X],
]
