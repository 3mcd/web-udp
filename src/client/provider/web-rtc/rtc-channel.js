// @flow

import type { RTCDataChannel } from "wrtc";
import type { Transport } from "../../../protocol";
import type { Connection } from "..";

type DataChannelOptions = {
  dataChannel: RTCDataChannel
};

import { Signal } from "../../../signal";

export default class RTCChannel extends Signal<>
  implements Connection {
  _dataChannel: RTCDataChannel;
  _open: boolean = true;

  closed: Signal<> = new Signal();
  errors: Signal<{ error: string }> = new Signal();

  get id(): string {
    return this._dataChannel.label;
  }

  constructor(options: DataChannelOptions) {
    super();

    const { dataChannel } = options;

    this._dataChannel = dataChannel;
    this._dataChannel.addEventListener("message", this._onMessage);
    this._dataChannel.addEventListener("close", () =>
      this.closed.dispatch()
    );
    this._dataChannel.addEventListener("error", e =>
      this.errors.dispatch({ error: e.message })
    );

    this.closed.subscribe(this._onClose);
  }

  _onClose = () => {
    this._open = false;
    this._dataChannel.removeEventListener("message", this._onMessage);
    // Again, a segfault will occur if the connection is closed and .close()
    // is called:
    // this._dataChannel.close();
  };

  _onMessage = (e: MessageEvent) => this.dispatch((e.data: any));

  send = (message: mixed) => {
    // wrtc's RTCDataChannel.send currently will segfault if connection is
    // closed and certain properties are accessed:
    if (
      // Even accessing readyState causes a segfault:
      // this._dataChannel.readyState === "closing" ||
      // this._dataChannel.readyState === "closed" ||
      !this._open
    ) {
      return;
    }
    this._dataChannel.send(message);
  };

  close() {
    this.closed.dispatch();
  }
}
