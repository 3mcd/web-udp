import {
  CLIENT_MASTER,
  Signal,
  WebSocketTransport,
  Transport,
} from "@web-udp/protocol"
import { Connection, ConnectionProvider, ConnectionOptions } from "./provider"
import { RTCConnectionProvider } from "./provider/web-rtc"

interface ClientOptions {
  provider?: ConnectionProvider
  transport?: Transport
  url?: string
}

export class Client {
  private provider: ConnectionProvider
  private _route: Promise<string>

  connections: Signal<Connection> = new Signal()

  constructor(options: ClientOptions) {
    let provider: ConnectionProvider
    let transport: Transport

    if (options.provider) {
      provider = options.provider
      transport = options.transport
    } else {
      let { url = `ws://${location.hostname}:${location.port}` } = options

      url = url.replace(/^http/, "ws")

      if (url.indexOf("ws") < 0) {
        url = `ws://${url}`
      }

      transport = new WebSocketTransport(new WebSocket(url))
      provider = new RTCConnectionProvider({
        transport,
        onConnection: connection => this.connections.dispatch(connection),
      })
    }

    this.provider = provider
    this._route = new Promise(resolve => {
      const handle = message => {
        if (message.type === "ROUTE") {
          resolve(message.route)
          transport.unsubscribe(handle)
        }
      }
      transport.subscribe(handle)
    })

    if (typeof window !== "undefined") {
      // Gracefully close the signaling transport before the browser tab is closed.
      window.addEventListener("beforeunload", () => {
        transport.close()
      })
    }
  }

  async connect(
    to: string | ConnectionOptions = CLIENT_MASTER,
    options?: ConnectionOptions,
  ): Promise<Connection> {
    if (typeof to === "object" && to !== null) {
      return this.provider.create(CLIENT_MASTER, to)
    }

    if (typeof to === "string") {
      return this.provider.create(to, options)
    }

    throw new Error(`Invalid options provided to Client.connect()`)
  }

  route() {
    return this._route
  }

  close(id: string) {
    this.provider.close(id)
  }
}

export { RTCConnectionProvider }
