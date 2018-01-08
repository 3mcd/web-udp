// @flow

import type { Connection } from "../../../src/client/provider";

import { Signal } from "../../../src/signal";

export default (): Connection => {
  return {
    send: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    close: jest.fn(),
    closed: new Signal(),
    errors: new Signal(),
    messages: new Signal()
  };
};
