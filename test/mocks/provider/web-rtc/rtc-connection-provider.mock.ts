import { ConnectionProvider } from "../../../../packages/client/src/provider"

import Connection from "../connection.mock"

export default class RTCConnectionProviderMock implements ConnectionProvider {
  create = jest.fn(async () => Connection())
  close = jest.fn()
}
