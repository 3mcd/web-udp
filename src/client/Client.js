// @flow

import shortid from "shortid";

import { CLIENT_MASTER } from "../const";

import type { Connection, ConnectionProvider } from "./provider";

type ClientOptions = {
  provider: ConnectionProvider
};

export default class Client {
  _provider: ConnectionProvider;

  constructor(options: ClientOptions) {
    const { provider } = options;

    this._provider = provider;
  }

  async connect(to: string = CLIENT_MASTER): Promise<Connection> {
    // Create an id for this connection.
    const cid = shortid();
    // Establish a UDP connection with the remote client.
    const connection = await this._provider.create(to, cid);

    return connection;
  }
}
