// @flow

import type { Connection, ConnectionProvider } from "./provider";

import shortid from "shortid";

import { CLIENT_MASTER } from "../const";
import WebSocketTransport from "../protocol/transport/socket";
import { RTCConnectionProvider } from "./provider/web-rtc";

type ClientOptions =
  {| url?: string, onConnection: Connection => mixed |} |
  { provider: ConnectionProvider };

export default class Client {
  _provider: ConnectionProvider;

  constructor(options: ClientOptions) {
    let provider: ConnectionProvider;

    if (options.provider) {
      provider = options.provider;
    } else {
      let {
        url = `ws://${location.hostname}:${location.port}`,
        onConnection
      } = options;

      url = url.replace(/^http/, "ws");

      if (url.indexOf("ws") < 0) {
        url = `ws://${url}`;
      }

      const ws = new WebSocket(url);
      const transport = new WebSocketTransport(ws);

      provider = new RTCConnectionProvider({
        transport,
        onConnection
      });
    }

    this._provider = provider;
  }

  async connect(to: string = CLIENT_MASTER): Promise<Connection> {
    // Create an id for this connection.
    const cid = shortid();
    // Establish a UDP connection with the remote client.
    const connection = await this._provider.create(to, cid);

    return connection;
  }

  close(id: string) {
    this._provider.close(id);
  }
}
