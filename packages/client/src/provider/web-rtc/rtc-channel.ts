import { Connection, ConnectionState } from "../types"

type DataChannelOptions = {
  dataChannel: RTCDataChannel
}

import { Signal } from "@web-udp/protocol"

export default class RTCChannel implements Connection {
  private buffer: any[] = []
  private dataChannel: RTCDataChannel

  state: ConnectionState = ConnectionState.CLOSED
  closed: Signal = new Signal()
  errors: Signal<{ error: string }> = new Signal()
  messages: Signal = new Signal()
  metadata: any = null

  id: string

  constructor(options: DataChannelOptions) {
    const { dataChannel } = options

    this.dataChannel = dataChannel
    this.dataChannel.addEventListener("open", this.onOpen)
    this.dataChannel.addEventListener("message", this.onMessage)
    this.dataChannel.addEventListener("close", () => this.close())
    this.dataChannel.addEventListener("error", this.onError)

    this.id = dataChannel.label

    if (this.dataChannel.readyState === "open") {
      this.state = ConnectionState.OPENED
    }
  }

  private onOpen = () => {
    this.state = ConnectionState.OPENED
    this.flush()
  }

  private onMessage = (e: MessageEvent) =>
    this.messages.dispatch(e.data)

  private onError = (e: RTCErrorEvent) =>
    this.errors.dispatch({ error: e.error.toString() })

  private flush() {
    for (let i = 0; i < this.buffer.length; i++) {
      let message = this.buffer[i]

      try {
        this.dataChannel.send(message)
        this.buffer.splice(i, 1)
      } catch (err) {
        this.errors.dispatch({
          error: `Failed to send ${JSON.stringify(message)} to ${
            this.id
          }.`,
        })
      }
    }
  }

  send(message: any) {
    this.buffer.push(message)

    if (this.state !== ConnectionState.OPENED) {
      return
    }

    this.flush()
  }

  close() {
    if (this.state !== ConnectionState.OPENED) {
      return
    }

    this.state = ConnectionState.CLOSED

    this.dataChannel.removeEventListener("message", this.onMessage)

    if (
      this.dataChannel.readyState !== "closing" &&
      this.dataChannel.readyState !== "closed"
    ) {
      this.dataChannel.close()
    }

    this.closed.dispatch(undefined)
  }
}
