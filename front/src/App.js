import React, { Component } from 'react'
import './App.css'
import openSocket from 'socket.io-client'

const _ = { type: 'empty', block: false }
const X = { type: 'wall', block: true }
const W = { type: 'gatherable', id: 'willow_tree', block: false }
const B = { type: 'building', id: 'bank', block: false }
const worldMap = [
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

class App extends Component {
  state = {
    player: { coordinates: { x: 1, y: 1 }},
    socket: null,
  }
  handleMessage = message => {
    let parsed
    try {
      parsed = JSON.parse(message)
      if (parsed.error) { throw new Error(parsed.meta) }
    } catch (e) {
      console.error(e)
      return
    }
    console.log('INCOMING:', parsed)
    parsed.type === 'updateState' && this.setState({ ...parsed.payload })
  }
  componentWillMount () {
    const socket = openSocket('ws://localhost:4000')

    socket.on('message', this.handleMessage)

    this.setState({ socket })

    const obj = {
      type: 'fetch',
      payload: { playerUid: 'worms' }
    }
    console.log('SENDING:', obj)
    socket.send(JSON.stringify(obj))
  }
  send = obj => {
    console.log('SENDING:', obj)
    this.state.socket.send(JSON.stringify(obj))
  }
  render() {
    return (
      <div className="app">
        <div className="map">
          {worldMap.map((row, y) => row.map((tile, x) =>
            <div
              key={`x${x}y${y}`}
              className={`tile ${
                this.state.player.coordinates.x === x && this.state.player.coordinates.y === y
                ? 'player'
                : tile.type === 'wall'
                ? 'wall'
                : tile.type === 'gatherable'
                ? 'tree'
                : tile.type === 'building'
                ? 'bank'
                : 'empty'
              }`}
              onClick={() => this.send({
                type: 'moveTo',
                payload: { playerUid: 'worms', x, y }
              })}
            />
          ))}
        </div>
        <div className="player-info">
          Inventory:
          {JSON.stringify(this.state.player.inventory, null, 2)}
          <br />
          Bank:
          {JSON.stringify(this.state.player.bank, null, 2)}
          <br />
          <button
            onClick={() => this.send({
              type: 'gatherResource',
              payload: { playerUid: 'worms' }
            })}
          >gather resource</button>
          <br />
          <button
            onClick={() => this.send({
              type: 'bankItems',
              payload: { playerUid: 'worms' }
            })}
          >bank items</button>
        </div>
      </div>
    )
  }
}

export default App
