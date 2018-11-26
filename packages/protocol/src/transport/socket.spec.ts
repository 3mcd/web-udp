import { Server, WebSocket } from "mock-socket"

import WebSocketTransport from "./socket"
;(<any>global).WebSocket = WebSocket

describe("WebSocketTransport", () => {
  let server
  let socket
  let transport
  let subscriber

  beforeEach(() => {
    server = new Server("ws://localhost:8000")
    socket = new WebSocket("ws://localhost:8000")
    transport = new WebSocketTransport(socket)
    subscriber = jest.fn()
  })

  afterEach(() => {
    server.stop()
  })

  describe("subscribe()", () => {
    it("emits messages to subscribers when WebSocket receives message", async () => {
      transport.subscribe(subscriber)

      server.send(
        JSON.stringify({
          foo: "bar",
        }),
      )

      expect(subscriber).toHaveBeenCalledWith({
        foo: "bar",
      })
    })
  })

  describe("unsubscribe", () => {
    it("removes subscription to WebSocket messages", async () => {
      transport.subscribe(subscriber)
      transport.unsubscribe(subscriber)

      server.send(
        JSON.stringify({
          foo: "bar",
        }),
      )

      expect(subscriber).not.toHaveBeenCalled()
    })
  })
})
