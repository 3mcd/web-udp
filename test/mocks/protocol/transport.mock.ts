import { Message } from "../../../packages/protocol/src"
import {
  MessageHandler,
  Transport,
} from "../../../packages/protocol/dist"

export type TransportMockUtil = {
  __provide__: (message: Message) => any
}

export default (): Transport & TransportMockUtil => {
  const _handlers: ((Message) => void)[] = []

  return {
    subscribe: jest.fn((handler: MessageHandler) =>
      _handlers.push(handler),
    ),

    unsubscribe: jest.fn((handler: MessageHandler) =>
      _handlers.splice(_handlers.indexOf(handler), 1),
    ),

    send: jest.fn(),

    close: jest.fn(),

    __provide__: jest.fn((message: Message) =>
      _handlers.forEach(fn => fn(message)),
    ),
  }
}
