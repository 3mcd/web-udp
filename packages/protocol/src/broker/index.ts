import { Message, Transport } from "../types"

interface BrokerOptions {
  keepAlivePeriod: number
}

export default class Broker {
  private transports: { [route: string]: Transport } = {}
  private keepAliveTimers: { [route: string]: NodeJS.Timeout } = {}

  readonly keepAlivePeriod: number

  constructor(options: BrokerOptions) {
    const { keepAlivePeriod } = options

    this.keepAlivePeriod = keepAlivePeriod
  }

  private keepAlive(route: string) {
    if (this.keepAliveTimers[route]) {
      clearTimeout(this.keepAliveTimers[route])
    }

    this.keepAliveTimers[route] = setTimeout(() => {
      this.transports[route].send({
        type: "KEEP_ALIVE",
      })
    }, this.keepAlivePeriod)
  }

  private onMessage = (message: Message, src: string) => {
    switch (message.type) {
      case "OFFER_CLIENT": {
        const { payload, pid } = message

        if (!this.transports[pid]) {
          throw new Error(`Client ${pid} not found.`)
        }

        this.transports[pid].send({
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

        if (!this.transports[pid]) {
          throw new Error(`Client ${pid} not found.`)
        }

        this.transports[pid].send({
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

        if (!this.transports[pid]) {
          throw new Error(`Client ${pid} not found`)
        }

        this.transports[pid].send({
          type: "ICE",
          src,
          payload: {
            ice: payload.ice,
          },
        })
        break
      }
      case "KEEP_ALIVE_CLIENT": {
        this.keepAlive(src)
        break
      }
      case "TRANSPORT_CLOSE": {
        clearTimeout(this.keepAliveTimers[src])
        delete this.transports[src]
        delete this.keepAliveTimers[src]
        break
      }
      default:
        throw new Error(`Invalid message type ${message.type}`)
    }
  }

  register(transport: Transport, route: string) {
    this.transports[route] = transport

    transport.subscribe(message => {
      try {
        this.onMessage(message, route)
      } catch (e) {
        console.error(e)
      }
    })

    transport.send({
      type: "ROUTE",
      route,
    })

    this.keepAlive(route)

    return route
  }
}
