// @flow

import type { Signal, Message } from "@web-udp/protocol"

export interface Connection {
  send(mixed): void;
  close(): void;
  closed: Signal<>;
  errors: Signal<{ error: string }>;
  messages: Signal<>;
  metadata: any;
}

export interface ConnectionProvider {
  create(
    pid: string,
    options?: { binaryType?: "arraybuffer" | "blob", metadata?: any },
  ): Promise<Connection>;
  close(pid: string): void;
}
