// @flow

import type { RTCDataChannel } from "wrtc";

import type { Connection } from "..";

type DataChannelOptions = {
  dc: RTCDataChannel
};

type DataChannelSubscriber = (data: mixed) => mixed;

export default class DataChannel implements Connection {
  _open: boolean = true;
  _dc: RTCDataChannel;

  get id(): string {
    return this._dc.label;
  }

  _subscribers: DataChannelSubscriber[] = [];

  constructor(options: DataChannelOptions) {
    const { dc } = options;

    this._dc = dc;

    dc.addEventListener("message", this._onMessage);
  }

  _onMessage = (e: MessageEvent) => {
    this._subscribers.forEach(subscriber => subscriber(e.data));
  };

  send = (message: mixed) => {
    // wrtc's RTCDataChannel.send currently will segfault if connection is
    // closed.
    if (
      // Even accessing readyState causes a segfault:
      // this._dc.readyState === "closing" ||
      // this._dc.readyState === "closed" ||
      !this._open
    ) {
      return;
    }
    this._dc.send(message);
  };

  subscribe = (subscriber: DataChannelSubscriber) => {
    this._subscribers.push(subscriber);
  };

  unsubscribe = (subscriber: DataChannelSubscriber) => {
    this._subscribers.splice(
      this._subscribers.indexOf(subscriber),
      1
    );
  };

  close() {
    this._open = false;
    // this._dc.close();
  }
}
