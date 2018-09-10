// @flow

import type { Message, Transport } from ".."

type Options = {
  keepAlivePeriod: number,
}

export default class Broker {
  _transports: { [route: string]: Transport } = {}
  _keepAlivePeriod: number
  _keepAliveTimers: { [route: string]: number } = {}

  constructor(options: Options) {
    const { keepAlivePeriod } = options

    this._keepAlivePeriod = keepAlivePeriod
  }

  register(transport: Transport, route: string) {
    this._transports[route] = transport

    transport.subscribe((message: Message) => {
      try {
        this._onMessage(message, route)
      } catch (e) {
        console.error(e)
      }
    })

    transport.send({
      type: "ROUTE",
      route,
    })

    this._keepAlive(route)

    return route
  }

  _keepAlive(route: string) {
    if (this._keepAliveTimers[route]) {
      clearTimeout(this._keepAliveTimers[route])
    }

    this._keepAliveTimers[route] = setTimeout(() => {
      this._transports[route].send({
        type: "KEEP_ALIVE",
      })
    }, this._keepAlivePeriod)
  }

  _onMessage = (message: Message, src: string) => {
    switch (message.type) {
      case "OFFER_CLIENT": {
        const { payload, pid } = message

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found.`)
        }

        this._transports[pid].send({
          type: "OFFER",
          src,
          payload: {
            sdp: payload.sdp,
          },
        })
        break
      }
      case "ANSWER_CLIENT": {
        const { payload, pid } = message

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found.`)
        }

        this._transports[pid].send({
          type: "ANSWER",
          src,
          payload: {
            sdp: payload.sdp,
          },
        })
        break
      }
      case "ICE_CLIENT": {
        const { payload, pid } = message

        if (!this._transports[pid]) {
          throw new Error(`Client ${pid} not found`)
        }

        this._transports[pid].send({
          type: "ICE",
          src,
          payload: {
            ice: payload.ice,
          },
        })
        break
      }
      case "KEEP_ALIVE_CLIENT": {
        this._keepAlive(src)
        break
      }
      case "TRANSPORT_CLOSE": {
        clearTimeout(this._keepAliveTimers[src])
        delete this._transports[src]
        delete this._keepAliveTimers[src]
        break
      }
      default:
        throw new Error(`Invalid message type ${message.type}`)
    }
  }
}
