// @flow

import { Server as HTTPServer } from "http"
import { Connection } from "@web-udp/client"

import * as WS from "ws"
import shortid from "shortid"
import {
  Signal,
  Broker,
  CLIENT_MASTER,
  LocalTransport,
  WebSocketTransport,
} from "@web-udp/protocol"
import { Client, RTCConnectionProvider } from "@web-udp/client"

function createLocalClient(
  id: string,
  broker: Broker,
  onConnection: (Connection) => any,
) {
  // Simulate an end-to-end connection for local clients.
  const { left, right } = LocalTransport.create()
  // Create a connection provider which generates connections using one side
  // of the signaling transport.
  const provider = new RTCConnectionProvider({
    onConnection,
    transport: right,
  })
  // Route messages to/from client.
  broker.register(left, id)

  return new Client({
    provider,
    transport: right,
  })
}

type ServerOptions = {
  server: HTTPServer
  keepAlivePeriod?: number
}

const DEFAULT_KEEP_ALIVE_PERIOD = 30000

// Server() sets up a signaling broker that can facilitate connections between
// clients.
export class Server {
  private broker: Broker
  private master: Client
  private webSocketServer: WS.Server

  connections: Signal<Connection> = new Signal()

  constructor(options: ServerOptions) {
    const { server, keepAlivePeriod = DEFAULT_KEEP_ALIVE_PERIOD } = options

    // Create the signaling server.
    this.webSocketServer = new WS.Server({ server })

    // Create a connection broker used to send signaling messages between
    // clients.
    this.broker = new Broker({ keepAlivePeriod })

    // Create the master client.
    this.master = createLocalClient(CLIENT_MASTER, this.broker, connection =>
      this.connections.dispatch(connection),
    )

    // Route signaling messages to/from clients.
    this.webSocketServer.on("connection", ws => {
      const transport = new WebSocketTransport(ws)
      const id = this.broker.register(transport, shortid())
      // Manually close data channels on signaling disconnect.
      ws.on("close", () => this.master.close(id))
    })
  }

  // Create a local client for use on the server.
  client() {
    const client = createLocalClient(shortid(), this.broker, connection =>
      client.connections.dispatch(connection),
    )

    return client
  }
}
