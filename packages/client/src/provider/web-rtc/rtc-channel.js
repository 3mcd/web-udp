// @flow

import type { RTCDataChannel } from "wrtc"
import type { Transport } from "@web-udp/protocol"
import type { Connection } from ".."

type DataChannelOptions = {
  dataChannel: RTCDataChannel,
}

import { Signal } from "@web-udp/protocol"

export default class RTCChannel implements Connection {
  _dataChannel: RTCDataChannel
  _open: boolean = true

  closed: Signal<> = new Signal()
  errors: Signal<{ error: string }> = new Signal()
  messages: Signal<> = new Signal()

  id: string

  constructor(options: DataChannelOptions) {
    const { dataChannel } = options

    this._dataChannel = dataChannel
    this._dataChannel.addEventListener("message", this._onMessage)
    this._dataChannel.addEventListener("close", () => this.close())
    this._dataChannel.addEventListener("error", this._onError)

    this.id = dataChannel.label
  }

  _onMessage = (e: MessageEvent) =>
    this.messages.dispatch((e.data: any))

  _onError = (e: Error) => this.errors.dispatch({ error: e.message })

  send = (message: mixed) => {
    if (
      this._dataChannel.readyState === "closing" ||
      this._dataChannel.readyState === "closed"
    ) {
      return
    }

    this._dataChannel.send(message)
  }

  close() {
    this._open = false
    this._dataChannel.removeEventListener("message", this._onMessage)

    if (
      this._dataChannel.readyState !== "closing" ||
      this._dataChannel.readyState !== "closed"
    ) {
      this._dataChannel.close()
    }

    this.closed.dispatch()
  }
}
