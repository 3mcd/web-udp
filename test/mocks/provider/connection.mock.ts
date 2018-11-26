import { Connection, ConnectionState } from "../../../packages/client/src/provider"

import { Signal } from "../../../packages/protocol/lib"

export default (): Connection => {
  return {
    state: ConnectionState.CLOSED,
    send: jest.fn(),
    close: jest.fn(),
    closed: new Signal(),
    errors: new Signal(),
    messages: new Signal(),
    metadata: null,
  }
}
