// @flow

import { Server } from "ws";

import { CLIENT_MASTER } from "../const";
import Client from "../client/client";
import RTCConnectionProvider from "../client/provider/web-rtc/rtc-connection-provider";
import { LocalTransport, WebSocketTransport } from "../protocol";
import Broker from "./broker";

const left = new LocalTransport();
const right = new LocalTransport().bind(left);

const broker = new Broker();
const master = new Client({
  provider: new RTCConnectionProvider({
    onConnection: connection => {
      const { send, subscribe } = connection;
      subscribe(message => {
        if (message === "PING") {
          send("PONG");
        }
      });
    },
    transport: right
  })
});

// Route messages to/from master client.
broker.register(left, CLIENT_MASTER);

const port = process.env.PORT || 4000;
const server = new Server({ port });

// Route signaling messages to/from peers.
server.on("connection", ws => {
  broker.register(new WebSocketTransport(ws));
});
