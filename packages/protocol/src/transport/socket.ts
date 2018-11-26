import { Message, MessageHandler, Transport } from "../types"

const serialize = JSON.stringify
const deserialize = JSON.parse

export default class WebSocketTransport implements Transport {
  private messages: Message[] = []
  private socket: WebSocket
  private subscribers: MessageHandler[] = []
  private _open: boolean = false

  get open() {
    return this._open
  }

  constructor(socket: WebSocket) {
    this.socket = socket

    if (socket.readyState === 1) {
      this._onOpen()
    } else {
      this.socket.addEventListener("open", this._onOpen)
    }

    this.socket.addEventListener("message", this._onMessage)
    this.socket.addEventListener("close", this._onClose)
    this.socket.addEventListener("error", (err: any) => {
      if (!err || typeof err.code !== "string") {
        return
      }
      // ECONNRESET can be thrown by some browsers when a connection isn't
      // closed gracefully (e.g. user closes a tab). This should already be
      // handled by the client, but we'll ignore it for now.
      // See: https://github.com/websockets/ws/issues/1256
      if (err.code !== "ECONNRESET") {
        throw err
      }
    })
  }

  _flush() {
    let message

    while ((message = this.messages.shift())) {
      this.socket.send(serialize(message))
    }
  }

  _onOpen = () => {
    this._open = true
  }

  _onMessage = (e: any) => {
    if (!e.data) {
      return
    }

    const message: Message = deserialize(e.data)

    for (let i = 0; i < this.subscribers.length; i++) {
      this.subscribers[i](message)
    }
  }

  _onClose = () => {
    const message = {
      type: "TRANSPORT_CLOSE",
    }

    for (let i = 0; i < this.subscribers.length; i++) {
      this.subscribers[i](message)
    }

    this._open = false
  }

  subscribe(handler: MessageHandler) {
    if (this.subscribers.indexOf(handler) > -1) {
      return
    }

    this.subscribers.push(handler)
  }

  unsubscribe(handler: MessageHandler) {
    const i = this.subscribers.indexOf(handler)

    if (i === -1) {
      return
    }

    this.subscribers.splice(i, 1)
  }

  send(message: Message) {
    this.messages.push(message)

    if (!this._open) {
      return
    }

    this._flush()
  }

  close() {
    this.socket.close()
  }
}
