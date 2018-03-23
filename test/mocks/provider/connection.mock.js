// @flow

import type { Connection } from "../../../packages/client/src/provider"

import { Signal } from "../../../packages/protocol"

export default (): Connection => {
  return {
    send: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    close: jest.fn(),
    closed: new Signal(),
    errors: new Signal(),
    messages: new Signal(),
  }
}
