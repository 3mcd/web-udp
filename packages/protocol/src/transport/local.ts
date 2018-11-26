import { Message, MessageHandler, Transport } from "../types"

export default class LocalTransport implements Transport {
  static create() {
    const left = new LocalTransport()
    const right = new LocalTransport()
    const temp = left.send

    // Route messages from right -> left
    left.send = right.send.bind(right)
    // Route messages from left -> right
    right.send = temp.bind(left)

    return { left, right }
  }

  private closed: boolean = false
  private subscribers: MessageHandler[] = []

  subscribe = (handler: MessageHandler) => {
    if (this.closed || this.subscribers.indexOf(handler) > -1) {
      return
    }

    this.subscribers.push(handler)
  }

  unsubscribe = (handler: MessageHandler) => {
    const i = this.subscribers.indexOf(handler)

    if (i === -1) {
      return
    }

    this.subscribers.splice(i, 1)
  }

  send = (message: Message) => {
    if (this.closed) {
      return
    }
    for (let i = 0; i < this.subscribers.length; i++) {
      this.subscribers[i](message)
    }
  }

  close() {
    this.closed = true
    this.subscribers = []
  }
}
