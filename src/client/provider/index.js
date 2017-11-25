// @flow

import type { Message } from "../../protocol";

export interface Connection {
  send(mixed): void;
}

export interface ConnectionProvider {
  create(id: string, cid: string): Promise<Connection>;
}
