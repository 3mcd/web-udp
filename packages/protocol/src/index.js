// @flow

export { default as LocalTransport } from "./transport/local";
export { default as WebSocketTransport } from "./transport/socket";
export { default as Broker } from "./broker";
export * from "./signal";
export * from "./const";

import type { Message } from "./message";

export type { Message };
export type MessageHandler = Message => any;

export interface Transport {
  send(Message): mixed;
  subscribe(MessageHandler): mixed;
  unsubscribe(MessageHandler): mixed;
  close(): mixed;
}
