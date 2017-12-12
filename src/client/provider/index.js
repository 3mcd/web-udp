// @flow

import type { Signal } from "../../signal";
import type { Message } from "../../protocol";

export interface Connection {
  send(mixed): void;
  close(): void;
  closed: Signal<>;
  errors: Signal<{ error: string }>;
  messages: Signal<>;
}

export interface ConnectionProvider {
  create(pid: string, cid: string): Promise<Connection>;
  close(pid: string): void;
}
