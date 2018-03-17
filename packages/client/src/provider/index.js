// @flow

import type { Signal, Message } from "@web-udp/protocol";

export interface Connection {
  send(mixed): void;
  close(): void;
  closed: Signal<>;
  errors: Signal<{ error: string }>;
  messages: Signal<>;
}

export interface ConnectionProvider {
  create(
    pid: string,
    options?: { binaryType?: "arraybuffer" | "blob" }
  ): Promise<Connection>;
  close(pid: string): void;
}
