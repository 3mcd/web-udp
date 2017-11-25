// @flow

import type { Connection } from "./provider";

import WebSocketTransport from "../protocol/transport/socket";

import { RTCConnectionProvider } from "./provider/web-rtc";
import Client from "./client";

const defaultUrl = `ws://${location.host}:${location.port}`;

export default function(
  url: string = defaultUrl,
  onConnection: Connection => mixed
) {
  const ws = new WebSocket(url);
  const transport = new WebSocketTransport(ws);
  const provider = new RTCConnectionProvider({
    transport,
    onConnection
  });
  const client = new Client({
    provider
  });

  return client;
}
