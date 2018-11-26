import { ConnectionProvider } from "../../../packages/client/src/provider"

import Connection from "./connection.mock"

export default (): ConnectionProvider => {
  return {
    create: jest.fn(async () => Connection()),
    close: jest.fn(),
  }
}
