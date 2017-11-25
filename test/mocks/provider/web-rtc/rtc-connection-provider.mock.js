// @flow

import type { ConnectionProvider } from "../../../../src/client/provider";
import type { Message } from "../../../../src/protocol/message";

import Connection from "../connection.mock";

export default (): ConnectionProvider => {
  return {
    create: jest.fn(async (pid: string, cid: string) => Connection()),
    handle: jest.fn((message: Message) => {})
  };
};
