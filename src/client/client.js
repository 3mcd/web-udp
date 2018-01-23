// @flow

import type { Transport } from "../protocol";
import type { Connection, ConnectionProvider } from "./provider";

import shortid from "shortid";

import { Signal } from "../signal";

import { CLIENT_MASTER } from "../const";
import WebSocketTransport from "../protocol/transport/socket";
import { RTCConnectionProvider } from "./provider/web-rtc";

type ClientOptions =
  | {| url?: string |}
  | { provider: ConnectionProvider, transport: Transport };

export class Client {
  _provider: ConnectionProvider;
  _route: Promise<string>;

  connections: Signal<Connection> = new Signal();

  constructor(options: ClientOptions) {
    let provider: ConnectionProvider;
    let transport: Transport;

    if (options.provider) {
      provider = options.provider;
      transport = options.transport;
    } else {
      let {
        url = `ws://${location.hostname}:${location.port}`
      } = options;

      url = url.replace(/^http/, "ws");

      if (url.indexOf("ws") < 0) {
        url = `ws://${url}`;
      }

      transport = new WebSocketTransport(new WebSocket(url));
      provider = new RTCConnectionProvider({
        transport,
        onConnection: connection =>
          this.connections.dispatch(connection)
      });
    }

    this._provider = provider;
    this._route = new Promise(resolve => {
      const handle = message => {
        if (message.type === "ROUTE") {
          resolve(message.route);
          transport.unsubscribe(handle);
        }
      };
      transport.subscribe(handle);
    });

    if (typeof window !== "undefined") {
      // Gracefully close the signaling transport before the browser tab is closed.
      window.addEventListener("beforeunload", () => {
        transport.close();
      });
    }
  }

  route() {
    return this._route;
  }

  async connect(
    to: string = CLIENT_MASTER,
    options?: { binaryType?: "arraybuffer" | "blob" }
  ): Promise<Connection> {
    // Establish a UDP connection with the remote client.
    return await this._provider.create(to, options);
  }

  close(id: string) {
    this._provider.close(id);
  }
}
