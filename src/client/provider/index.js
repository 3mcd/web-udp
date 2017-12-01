// @flow

import type { Message } from "../../protocol";

export interface Connection {
  send(mixed): void;
  subscribe((mixed) => mixed): void;
  unsubscribe((mixed) => mixed): void;
  close(): void;
}

export interface ConnectionProvider {
  create(pid: string, cid: string): Promise<Connection>;
  close(pid: string): void;
}
