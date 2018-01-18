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
  _webSocketServer: WebSocket.Server;

  get connections(): Signal<Connection> {
    return this._master.connections;
  }

  constructor(options: ServerOptions) {
    const { server } = options;

    // Create the signaling server.
    this._webSocketServer = new WebSocket.Server({ server });

    // Create a connection broker used to send signaling messages between
    // clients.
    this._broker = new Broker();

    // Create the master client.
    this._master = createLocalClient(
      CLIENT_MASTER,
      this._broker,
      connection => this.connections.dispatch(connection)
    );

    // Route signaling messages to/from clients.
    this._webSocketServer.on("connection", ws => {
      const id = this._broker.register(new WebSocketTransport(ws));
      // Manually close data channels on signaling disconnect.
      ws.on("close", () => this._master.close(id));
    });
  }

  // Create a local client for use on the server.
  client() {
    const client = createLocalClient(
      undefined,
      this._broker,
      connection => client.connections.dispatch(connection)
    );

    return client;
  }
}
