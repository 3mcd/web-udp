// @flow

import type { RTCDataChannel } from "wrtc";
import type { Transport } from "../../../protocol";
import type { Connection } from "..";

type DataChannelOptions = {
  dataChannel: RTCDataChannel
};

type RTCChannelSubscriber = (data: any) => any;

export default class RTCChannel implements Connection, Transport {
  _dataChannel: RTCDataChannel;
  _open: boolean = true;
  _subscribers: RTCChannelSubscriber[] = [];

  get id() {
    return this._dataChannel.label;
  }

  constructor(options: DataChannelOptions) {
    const { dataChannel } = options;

    this._dataChannel = dataChannel;
    this._dataChannel.addEventListener("message", this._onMessage);
  }

  _onMessage = (e: MessageEvent) => {
    for (let subscriber of this._subscribers) {
      subscriber(e.data);
    }
  };

  send = (message: mixed) => {
    // wrtc's RTCDataChannel.send currently will segfault if connection is
    // closed and certain properties are accessed.
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

  subscribe = (subscriber: RTCChannelSubscriber) => {
    if (!this._open) {
      return;
    }

    this._subscribers.push(subscriber);
  };

  unsubscribe = (subscriber: RTCChannelSubscriber) => {
    if (!this._open) {
      return;
    }

    this._subscribers.splice(
      this._subscribers.indexOf(subscriber),
      1
    );
  };

  close() {
    this._open = false;
    this._dataChannel.removeEventListener("message", this._onMessage);
    // this._dataChannel.close();
  }
}
