// @flow

import type { ConnectionProvider } from "../../../src/client/provider";

import Connection from "./connection.mock";

export default (): ConnectionProvider => {
  return {
    create: async () => Connection(),
    close: jest.fn()
  };
};
