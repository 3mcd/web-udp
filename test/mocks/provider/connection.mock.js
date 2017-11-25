// @flow

import type { Connection } from "../../../src/client/provider";

export default (): Connection => {
  return {
    send: jest.fn((message: mixed) => {})
  };
};
