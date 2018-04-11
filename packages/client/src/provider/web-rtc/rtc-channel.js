// @flow

import type { RTCDataChannel } from "wrtc"
import type { Transport } from "@web-udp/protocol"
import type { Connection } from ".."

type DataChannelOptions = {
  dataChannel: RTCDataChannel,
}

import { Signal } from "@web-udp/protocol"

type ConnectionState = "CLOSED" | "OPEN"

export default class RTCChannel implements Connection {
  _state: ConnectionState = "CLOSED"
  _buffer: mixed[] = []
  _dataChannel: RTCDataChannel

  closed: Signal<> = new Signal()
  errors: Signal<{ error: string }> = new Signal()
  messages: Signal<> = new Signal()
  metadata: any = null

  id: string

  constructor(options: DataChannelOptions) {
    const { dataChannel } = options

    this._dataChannel = dataChannel
    this._dataChannel.addEventListener("open", this._onOpen)
    this._dataChannel.addEventListener("message", this._onMessage)
    this._dataChannel.addEventListener("close", () => this.close())
    this._dataChannel.addEventListener("error", this._onError)

    this.id = dataChannel.label

    if (this._dataChannel.readyState === "open") {
      this._state = "OPEN"
    }
  }

  _onOpen = () => {
    this._state = "OPEN"
    this._flush()
  }

  _onMessage = (e: MessageEvent) =>
    this.messages.dispatch((e.data: any))

  _onError = (e: Error) => this.errors.dispatch({ error: e.message })

  _flush = () => {
    let m

    for (let i = 0; i < this._buffer.length; i++) {
      let message = this._buffer[i]
      try {
        this._dataChannel.send(message)
        this._buffer.splice(i, 1)
      } catch (err) {
        this.errors.dispatch({
          error: `Failed to send ${JSON.stringify(message)} to ${
            this.id
          }.`,
        })
      }
    }
  }

  send = (message: mixed) => {
    this._buffer.push(message)

    if (this._state !== "OPEN") {
      return
    }

    this._flush()
  }

  close() {
    if (this._state !== "OPEN") {
      return
    }

    this._state = "CLOSED"

    this._dataChannel.removeEventListener("message", this._onMessage)

    if (
      this._dataChannel.readyState !== "closing" &&
      this._dataChannel.readyState !== "closed"
    ) {
      this._dataChannel.close()
    }

    this.closed.dispatch()
  }
}
