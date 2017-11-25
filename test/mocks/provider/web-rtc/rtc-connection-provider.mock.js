// @flow

import type { ConnectionProvider } from "../../../../src/client/provider";
import type { Message } from "../../../../src/protocol/message";

import Connection from "../connection.mock";

export default (): ConnectionProvider => {
  return {
    create: jest.fn(async () => Connection()),
    handle: jest.fn(),
    close: jest.fn()
  };
};
