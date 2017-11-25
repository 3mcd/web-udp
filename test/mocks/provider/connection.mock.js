// @flow

import type { Connection } from "../../../src/client/provider";

export default (): Connection => {
  return {
    send: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    close: jest.fn()
  };
};
