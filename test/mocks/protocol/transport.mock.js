// @flow

import type { Message } from "../../../src/protocol/message";
import type {
  MessageHandler,
  Transport
} from "../../../src/protocol";

export type TransportMockUtil = {
  __provide__: (message: Message) => mixed
};

export default (): Transport & TransportMockUtil => {
  const _handlers: ((Message) => void)[] = [];

  return {
    subscribe: jest.fn((handler: MessageHandler) =>
      _handlers.push(handler)
    ),

    unsubscribe: jest.fn((handler: MessageHandler) =>
      _handlers.splice(_handlers.indexOf(handler), 1)
    ),

    send: jest.fn(),

    close: jest.fn(),

    __provide__: jest.fn((message: Message) =>
      _handlers.forEach(fn => fn(message))
    )
  };
};
