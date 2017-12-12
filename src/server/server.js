// @flow

import type { Server as HTTPServer } from "http";

import type { Connection } from "../client/provider";

import WebSocket from "ws";

import { Signal } from "../signal";
import Broker from "../protocol/broker";
import { Client } from "../client";
import RTCConnectionProvider from "../client/provider/web-rtc/rtc-connection-provider";
import { CLIENT_MASTER } from "../const";
import { LocalTransport, WebSocketTransport } from "../protocol";

function createLocalClient(
  id: string | typeof undefined,
  broker: Broker,
  onConnection: Connection => mixed
) {
  // Simulate an end-to-end connection for local clients.
  const { left, right } = LocalTransport.create();
  // Create a connection provider which generates connections using one side
  // of the signaling transport.
  const provider = new RTCConnectionProvider({
    onConnection,
    transport: right
  });
  // Route messages to/from client.
  broker.register(left, id);

  return new Client({
    provider,
    transport: right
  });
}

type ServerOptions = {
  server: HTTPServer,
  onConnection: Connection => mixed
};

// Server() sets up a signaling broker that can facilitate connections between
// clients.
export class Server {
  _broker: Broker;
  _master: Client;
  _server: HTTPServer;

  get connections(): Signal<Connection> {
    return this._master.connections;
  }

  constructor(options: ServerOptions) {
    const { server } = options;

    this._server = server;

    // Create a connection broker used to send signaling messages between
    // clients.
    this._broker = new Broker();

    // Create the master client.
    this._master = createLocalClient(
      CLIENT_MASTER,
      this._broker,
      connection => this.connections.dispatch(connection)
    );
  }

  client(onConnection: Connection => mixed) {
    const client = createLocalClient(
      undefined,
      this._broker,
      onConnection
    );

    // Create the signaling server.
    const signaling = new WebSocket.Server({ server: this._server });

    // Route signaling messages to/from clients.
    signaling.on("connection", ws => {
      const id = this._broker.register(new WebSocketTransport(ws));
      // Temp workaround. We need to keep the signaling connection open to listen
      // for the "close" event when the client drops. The data channel instances
      // are then manually halted to prevent segfault in wrtc library.
      ws.on("close", () => this._master.close(id));
    });

    return client;
  }
}
